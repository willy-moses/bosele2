import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function hex(r, g, b) {
  return rgb(r / 255, g / 255, b / 255);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { staff } = await request.json();
    if (!staff || !Array.isArray(staff)) {
      return NextResponse.json({ error: 'Invalid staff data' }, { status: 400 });
    }

    // ── Page constants ───────────────────────────────────────────
    const PAGE_W  = 595;  // A4 portrait
    const PAGE_H  = 842;
    const MARGIN  = 40;
    const TABLE_W = PAGE_W - MARGIN * 2; // 515
    const CELL_PAD = 4;

    // Colours
    const AMBER       = hex(245, 158, 11);   // #f59e0b
    const AMBER_DARK  = hex(146, 64, 14);    // #92400e
    const AMBER_LIGHT = hex(254, 243, 199);  // #fef3c7
    const WHITE = rgb(1, 1, 1);
    const BLACK = rgb(0, 0, 0);
    const GREY  = hex(102, 102, 102);

    // Column proportions (must sum to 1.0)
    const COL_LABELS  = ['Name', 'Position', 'Email', 'Phone', 'Status'];
    const COL_RATIOS  = [0.27, 0.21, 0.30, 0.14, 0.08];
    const COLS = COL_RATIOS.map((r, i) => ({
      label: COL_LABELS[i],
      w: Math.floor(TABLE_W * r),
    }));
    // Assign rounding remainder to last col
    const colSum = COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += TABLE_W - colSum;

    // ── Fixed vertical space (header section + table header + footer) ──
    const HDR_H     = 25;  // table column header bar
    const TITLE_H   = 26;  // "Bosele Day Care Pre-school"
    const SUB_H     = 22;  // "Staff Directory"
    const DATE_H    = 32;  // date line + gap below
    const SUMMARY_H = 50;  // two summary lines + gap
    const FOOTER_H  = 30;  // page footer area

    const FIXED_H = MARGIN + TITLE_H + SUB_H + DATE_H + SUMMARY_H + HDR_H + FOOTER_H + MARGIN;

    // ── Auto-scale row height to fit all rows on one page ────────
    const AVAILABLE_H = PAGE_H - FIXED_H;
    const rowCount    = Math.max(staff.length, 1);
    let ROW_H = Math.floor(AVAILABLE_H / rowCount);
    ROW_H = Math.max(11, Math.min(22, ROW_H)); // clamp: 11px min, 22px max

    // Font sizes scale proportionally with row height
    const FONT_SIZE     = Math.max(6,  Math.min(9,  ROW_H - 5));
    const HDR_FONT_SIZE = Math.max(7,  Math.min(10, ROW_H - 4));

    // ── Build PDF ─────────────────────────────────────────────────
    const pdfDoc  = await PDFDocument.create();
    const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    // Title
    const title = 'Bosele Day Care Pre-school';
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 18)) / 2,
      y, size: 18, font: fontBold, color: AMBER,
    });
    y -= TITLE_H;

    // Subtitle
    const subtitle = 'Staff Directory';
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 14)) / 2,
      y, size: 14, font: fontBold, color: AMBER_DARK,
    });
    y -= SUB_H;

    // Date
    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })}`;
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= DATE_H;

    // Summary
    const activeCount = staff.filter(s => s.status === 'active').length;
    page.drawText(`Total Staff Members: ${staff.length}`, {
      x: MARGIN, y, size: 10, font, color: BLACK,
    });
    y -= 18;
    page.drawText(`Active: ${activeCount}    Inactive: ${staff.length - activeCount}`, {
      x: MARGIN, y, size: 10, font, color: BLACK,
    });
    y -= 14;

    // Table header bar
    page.drawRectangle({ x: MARGIN, y, width: TABLE_W, height: HDR_H, color: AMBER });
    let hx = MARGIN;
    for (const col of COLS) {
      page.drawText(col.label, {
        x: hx + CELL_PAD,
        y: y + (HDR_H - HDR_FONT_SIZE) / 2,
        size: HDR_FONT_SIZE, font: fontBold, color: WHITE,
      });
      hx += col.w;
    }
    y -= ROW_H;  // move down to first data row

    // ── Clip helper ───────────────────────────────────────────────
    function clip(text, maxW, size, f) {
      const s = String(text || '');
      if (f.widthOfTextAtSize(s, size) <= maxW - CELL_PAD * 2) return s;
      let t = s;
      while (t.length > 1 && f.widthOfTextAtSize(t + '\u2026', size) > maxW - CELL_PAD * 2) {
        t = t.slice(0, -1);
      }
      return t + '\u2026';
    }

    // ── Data rows ─────────────────────────────────────────────────
    staff.forEach((member, index) => {
      // Alternating row background
      if (index % 2 === 0) {
        page.drawRectangle({ x: MARGIN, y, width: TABLE_W, height: ROW_H, color: AMBER_LIGHT });
      }

      const firstName = member.first_name || member.firstName || '';
      const lastName  = member.last_name  || member.lastName  || '';
      const position  = (member.position || '')
        .replace(/_/g, ' ')
        .replace(/\bDAY CARE\b/i, '')
        .trim();
      const status =
        (member.status || 'active').charAt(0).toUpperCase() +
        (member.status || 'active').slice(1).toLowerCase();

      const cells = [
        `${firstName} ${lastName}`.trim(),
        position,
        member.email || '\u2014',
        member.phone || '\u2014',
        status,
      ];

      let cx = MARGIN;
      cells.forEach((cell, i) => {
        page.drawText(clip(cell, COLS[i].w, FONT_SIZE, font), {
          x: cx + CELL_PAD,
          y: y + (ROW_H - FONT_SIZE) / 2,
          size: FONT_SIZE, font, color: BLACK,
        });
        cx += COLS[i].w;
      });

      y -= ROW_H;
    });

    // ── Footer ────────────────────────────────────────────────────
    const footerText = 'Page 1 of 1';
    page.drawText(footerText, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(footerText, 8)) / 2,
      y: MARGIN - 15,
      size: 8, font, color: GREY,
    });

    // ── Serialise & return ────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="staff-list-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}