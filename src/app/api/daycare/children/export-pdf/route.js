import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function hex(r, g, b) { return rgb(r / 255, g / 255, b / 255); }

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { children } = await request.json();
    if (!children || !Array.isArray(children))
      return NextResponse.json({ error: 'Invalid children data' }, { status: 400 });

    // ── Layout constants ──────────────────────────────────────────
    const PAGE_W   = 842;  // A4 landscape
    const PAGE_H   = 595;
    const MARGIN   = 40;
    const TABLE_W  = PAGE_W - MARGIN * 2;   // 762
    const CELL_PAD = 4;
    const HDR_H    = 24;
    const ROW_H    = 19;
    const FOOTER_H = 28;

    // Colours
    const AMBER       = hex(245, 158,  11);
    const AMBER_DARK  = hex(146,  64,  14);
    const AMBER_LIGHT = hex(254, 243, 199);
    const PINK_LIGHT  = hex(253, 242, 248);
    const BLUE_LIGHT  = hex(239, 246, 255);
    const WHITE = rgb(1, 1, 1);
    const BLACK = rgb(0, 0, 0);
    const GREY  = hex(102, 102, 102);
    const RED   = hex(185,  28,  28);
    const GREEN = hex( 21, 128,  61);

    // Columns — sum must equal TABLE_W (762)
    const COLS = [
      { label: 'Name',          w: 130 },
      { label: 'DOB',           w:  72 },
      { label: 'Gender',        w:  55 },
      { label: 'Class',         w:  60 },
      { label: 'Parent',        w: 120 },
      { label: 'Contact',       w:  95 },
      { label: 'District',      w:  80 },
      { label: 'Allergies',     w:  90 },
      { label: 'Status',        w:  60 },
    ];
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

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

    function formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    // ── Draw column headers ───────────────────────────────────────
    function drawTableHeader(p, topY) {
      p.drawRectangle({ x: MARGIN, y: topY, width: TABLE_W, height: HDR_H, color: AMBER });
      let x = MARGIN;
      for (const col of COLS) {
        p.drawText(col.label, {
          x: x + CELL_PAD,
          y: topY + (HDR_H - 9) / 2,
          size: 9, font: fontBold, color: WHITE,
        });
        x += col.w;
      }
    }

    // ── Draw a data row ───────────────────────────────────────────
    function drawRow(p, rowY, child, index) {
      // Alternate row shading
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: AMBER_LIGHT });
      }

      const name     = `${child.firstName || ''} ${child.lastName || ''}`.trim();
      const parent   = `${child.parentFirstName || ''} ${child.parentLastName || ''}`.trim();
      const allergies = child.allergies && child.allergies.trim() ? child.allergies : 'None';
      const status   = (child.status || 'active');
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

      const cells = [
        name,
        formatDate(child.dateOfBirth),
        child.gender || '—',
        child.class  || '—',
        parent,
        child.parentPhone || '—',
        child.district    || '—',
        allergies,
        statusLabel,
      ];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        // Colour-code status and allergies
        let color = BLACK;
        if (i === 8) color = status === 'active' ? GREEN : status === 'inactive' ? GREY : hex(180, 83, 9);
        if (i === 7 && allergies !== 'None') color = RED;

        p.drawText(clip(cell, COLS[i].w, 8, font), {
          x: x + CELL_PAD,
          y: rowY + (ROW_H - 8) / 2,
          size: 8, font, color,
        });
        x += COLS[i].w;
      });
    }

    // ── Page 1 header section ─────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const title = 'Bosele Day Care Pre-school';
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 18)) / 2,
      y, size: 18, font: fontBold, color: AMBER,
    });
    y -= 26;

    const subtitle = 'Enrolled Children Register';
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 13)) / 2,
      y, size: 13, font: fontBold, color: AMBER_DARK,
    });
    y -= 20;

    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })}`;
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 24;

    // Summary counts
    const activeCount   = children.filter(c => c.status === 'active').length;
    const inactiveCount = children.filter(c => c.status === 'inactive').length;
    const pendingCount  = children.filter(c => c.status === 'pending').length;
    const allergyCount  = children.filter(c => c.allergies && c.allergies.trim()).length;

    const summary = `Total: ${children.length}   Active: ${activeCount}   Inactive: ${inactiveCount}   Pending: ${pendingCount}   With Allergies: ${allergyCount}`;
    page.drawText(summary, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summary, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 36;

    // Table header
    drawTableHeader(page, y);
    y -= ROW_H;

    // ── Data rows with pagination ─────────────────────────────────
    children.forEach((child, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
        drawTableHeader(page, y);
        y -= ROW_H;
      }
      drawRow(page, y, child, index);
      y -= ROW_H;
    });

    // ── Footer on all pages ───────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      const footerText = `Bosele Day Care Pre-school  •  Page ${i + 1} of ${totalPages}  •  Confidential`;
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
        'Content-Disposition': `attachment; filename="children-register-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating children PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}