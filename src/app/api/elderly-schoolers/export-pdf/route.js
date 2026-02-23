// ========================================
// FILE: app/api/elderly-schoolers/export-pdf/route.js
// PURPOSE: Generate PDF for elderly schoolers (all or filtered by village)
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function hex(r, g, b) { return rgb(r / 255, g / 255, b / 255); }

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { schoolers } = await request.json();
    if (!schoolers || !Array.isArray(schoolers))
      return NextResponse.json({ error: 'Invalid schoolers data' }, { status: 400 });

    // ── Layout ────────────────────────────────────────────────────
    const PAGE_W   = 842;  // A4 landscape for wider table
    const PAGE_H   = 595;
    const MARGIN   = 40;
    const TABLE_W  = PAGE_W - MARGIN * 2;  // 762
    const CELL_PAD = 5;
    const HDR_H    = 25;
    const ROW_H    = 20;
    const FOOTER_H = 30;

    // Emerald colour theme
    const EMERALD       = hex(  5, 150, 105);
    const EMERALD_DARK  = hex(  4,  90,  64);
    const EMERALD_LIGHT = hex(209, 250, 229);
    const WHITE  = rgb(1, 1, 1);
    const BLACK  = rgb(0, 0, 0);
    const GREY   = hex(102, 102, 102);
    const ORANGE = hex(180,  83,   9);

    // Columns — total must equal TABLE_W (762)
    const COLS = [
      { label: '#',             w:  30 },
      { label: 'Name',          w: 130 },
      { label: 'Age',           w:  40 },
      { label: 'Grade',         w:  80 },
      { label: 'ID Number',     w: 100 },  // ← new
      { label: 'Village / Town',w: 110 },  // ← new
      { label: 'Guardian',      w: 110 },
      { label: 'Contact',       w:  90 },
      { label: 'Medical Info',  w:  72 },
    ];
    // Force last col to absorb any rounding gap
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

    // ── Detect if this is a single-village export ─────────────────
    const uniqueVillages = [...new Set(schoolers.map(s => s.villageTown?.trim()).filter(Boolean))];
    const isSingleVillage = uniqueVillages.length === 1;
    const villageName = isSingleVillage ? uniqueVillages[0] : null;

    // ── Fonts ─────────────────────────────────────────────────────
    const pdfDoc   = await PDFDocument.create();
    const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    function clip(text, colW, size, f) {
      const s = String(text || '');
      const maxW = colW - CELL_PAD * 2;
      if (f.widthOfTextAtSize(s, size) <= maxW) return s;
      let t = s;
      while (t.length > 1 && f.widthOfTextAtSize(t + '\u2026', size) > maxW) t = t.slice(0, -1);
      return t + '\u2026';
    }

    function drawTableHeader(p, topY) {
      p.drawRectangle({ x: MARGIN, y: topY, width: TABLE_W, height: HDR_H, color: EMERALD });
      let x = MARGIN;
      for (const col of COLS) {
        p.drawText(col.label, {
          x: x + CELL_PAD,
          y: topY + (HDR_H - 10) / 2,
          size: 9, font: fontBold, color: WHITE,
        });
        x += col.w;
      }
    }

    function drawRow(p, rowY, schooler, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: EMERALD_LIGHT });
      }

      const medicalText  = schooler.medicalInfo ? clip(schooler.medicalInfo, COLS[8].w, 9, font) : 'None';
      const medicalColor = schooler.medicalInfo ? ORANGE : GREY;

      const cells = [
        String(index + 1),
        schooler.name             || '—',
        String(schooler.age       || '—'),
        schooler.grade            || '—',
        schooler.idNumber         || '—',   // ← new
        schooler.villageTown      || '—',   // ← new
        schooler.guardianName     || '—',
        schooler.guardianContact  || '—',
        medicalText,
      ];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        const color = i === 8 ? medicalColor : BLACK;
        p.drawText(clip(cell, COLS[i].w, 9, font), {
          x: x + CELL_PAD,
          y: rowY + (ROW_H - 9) / 2,
          size: 9, font, color,
        });
        x += COLS[i].w;
      });
    }

    // ── Page 1: title block ───────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    // Organisation name
    const title = 'Bosele Kgotla';
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 20)) / 2,
      y, size: 20, font: fontBold, color: EMERALD,
    });
    y -= 26;

    // Register title — includes village name if filtered
    const subtitle = isSingleVillage
      ? `Elderly Schoolers Register — ${villageName}`
      : 'Elderly Schoolers Register';
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 13)) / 2,
      y, size: 13, font: fontBold, color: EMERALD_DARK,
    });
    y -= 20;

    // Date
    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })}`;
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 22;

    // Summary stats
    const avgAge = schoolers.length > 0
      ? Math.round(schoolers.reduce((sum, s) => sum + Number(s.age || 0), 0) / schoolers.length)
      : 0;
    const medicalCount = schoolers.filter(s => s.medicalInfo).length;
    const summary = `Total: ${schoolers.length}   Average Age: ${avgAge}   With Medical Info: ${medicalCount}`;
    page.drawText(summary, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summary, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 28;

    // Table header
    drawTableHeader(page, y);
    y -= ROW_H;

    // ── Data rows with pagination ─────────────────────────────────
    schoolers.forEach((schooler, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
        drawTableHeader(page, y);
        y -= ROW_H;
      }
      drawRow(page, y, schooler, index);
      y -= ROW_H;
    });

    // ── Footer on every page ──────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      const villageLabel = isSingleVillage ? `  •  ${villageName}` : '';
      const footerText = `Bosele Kgotla${villageLabel}  •  Page ${i + 1} of ${totalPages}  •  Confidential`;
      p.drawText(footerText, {
        x: MARGIN + (TABLE_W - font.widthOfTextAtSize(footerText, 7)) / 2,
        y: MARGIN - 15,
        size: 7, font, color: GREY,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="elderly-schoolers-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error generating schoolers PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}