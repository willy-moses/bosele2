// ========================================
// FILE: app/api/elderly-people/export-pdf/route.js
// PURPOSE: Generate PDF for elderly people registry (all or filtered by village)
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

    const { people } = await request.json();
    if (!people || !Array.isArray(people))
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    // ── Layout (A4 landscape) ─────────────────────────────────────
    const PAGE_W   = 842;
    const PAGE_H   = 595;
    const MARGIN   = 40;
    const TABLE_W  = PAGE_W - MARGIN * 2;
    const CELL_PAD = 5;
    const HDR_H    = 25;
    const ROW_H    = 20;
    const FOOTER_H = 30;

    const EMERALD       = hex(  5, 150, 105);
    const EMERALD_DARK  = hex(  4,  90,  64);
    const EMERALD_LIGHT = hex(209, 250, 229);
    const WHITE  = rgb(1, 1, 1);
    const BLACK  = rgb(0, 0, 0);
    const GREY   = hex(102, 102, 102);
    const ORANGE = hex(180,  83,   9);
    const BLUE   = hex( 37, 99, 235);
    const PINK   = hex(219,  39, 119);

    // Columns — total = 762
    const COLS = [
      { label: '#',            w:  28 },
      { label: 'Full Name',    w: 120 },
      { label: 'ID Number',    w:  95 },
      { label: 'Age',          w:  35 },
      { label: 'Gender',       w:  55 },
      { label: 'Village/Town', w: 100 },
      { label: 'District',     w:  80 },
      { label: 'Phone',        w:  80 },
      { label: 'Next of Kin',  w: 100 },
      { label: 'Medical',      w:  69 },
    ];
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

    // Detect single-village export
    const uniqueVillages = [...new Set(people.map(p => p.villageTown?.trim()).filter(Boolean))]
    const isSingleVillage = uniqueVillages.length === 1
    const villageName = isSingleVillage ? uniqueVillages[0] : null

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
        p.drawText(col.label, { x: x + CELL_PAD, y: topY + (HDR_H - 10) / 2, size: 9, font: fontBold, color: WHITE });
        x += col.w;
      }
    }

    function drawRow(p, rowY, person, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: EMERALD_LIGHT });
      }

      const medText  = person.medicalInfo ? clip(person.medicalInfo, COLS[9].w, 8, font) : 'None'
      const medColor = person.medicalInfo ? ORANGE : GREY
      const genderColor = person.gender === 'Male' ? BLUE : person.gender === 'Female' ? PINK : BLACK

      const cells = [
        String(index + 1),
        `${person.firstName || ''} ${person.lastName || ''}`.trim() || '—',
        person.idNumber        || '—',
        String(person.age      || '—'),
        person.gender          || '—',
        person.villageTown     || '—',
        person.district        || '—',
        person.phone           || '—',
        person.nextOfKinName   || '—',
        medText,
      ]

      let x = MARGIN
      cells.forEach((cell, i) => {
        const color = i === 9 ? medColor : i === 4 ? genderColor : BLACK
        p.drawText(clip(cell, COLS[i].w, 8, font), {
          x: x + CELL_PAD, y: rowY + (ROW_H - 8) / 2, size: 8, font, color,
        })
        x += COLS[i].w
      })
    }

    // ── Page 1 title ──────────────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H])
    let y = PAGE_H - MARGIN

    const title = 'Bosele Kgotla'
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 20)) / 2,
      y, size: 20, font: fontBold, color: EMERALD,
    })
    y -= 26

    const subtitle = isSingleVillage
      ? `Elderly People Registry — ${villageName}`
      : 'Elderly People Registry'
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 13)) / 2,
      y, size: 13, font: fontBold, color: EMERALD_DARK,
    })
    y -= 20

    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    })
    y -= 20

    const maleCount   = people.filter(p => p.gender === 'Male').length
    const femaleCount = people.filter(p => p.gender === 'Female').length
    const avgAge      = people.length ? Math.round(people.reduce((s, p) => s + Number(p.age || 0), 0) / people.length) : 0
    const summary     = `Total: ${people.length}   Male: ${maleCount}   Female: ${femaleCount}   Average Age: ${avgAge}`
    page.drawText(summary, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summary, 9)) / 2,
      y, size: 9, font, color: GREY,
    })
    y -= 28

    drawTableHeader(page, y)
    y -= ROW_H

    people.forEach((person, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H])
        y = PAGE_H - MARGIN
        drawTableHeader(page, y)
        y -= ROW_H
      }
      drawRow(page, y, person, index)
      y -= ROW_H
    })

    // ── Footer ────────────────────────────────────────────────────
    const totalPages = pdfDoc.getPageCount()
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i)
      const villageLabel = isSingleVillage ? `  •  ${villageName}` : ''
      const footerText = `Bosele Kgotla${villageLabel}  •  Page ${i + 1} of ${totalPages}  •  Confidential`
      p.drawText(footerText, {
        x: MARGIN + (TABLE_W - font.widthOfTextAtSize(footerText, 7)) / 2,
        y: MARGIN - 15, size: 7, font, color: GREY,
      })
    }

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="elderly-people-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('❌ Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}