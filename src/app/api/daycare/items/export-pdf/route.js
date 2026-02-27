// ========================================
// FILE: app/api/daycare/items/export-pdf/route.js
// PURPOSE: Generate PDF for Day Care Items & Tools register
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

    const { items } = await request.json();
    if (!items || !Array.isArray(items))
      return NextResponse.json({ error: 'Invalid items data' }, { status: 400 });

    // ── Layout ────────────────────────────────────────────────────
    const PAGE_W   = 842;
    const PAGE_H   = 595;
    const MARGIN   = 40;
    const TABLE_W  = PAGE_W - MARGIN * 2;
    const CELL_PAD = 5;
    const HDR_H    = 25;
    const ROW_H    = 20;
    const FOOTER_H = 30;

    // Amber/daycare colour theme
    const AMBER       = hex(245, 158,  11);
    const AMBER_DARK  = hex(180, 104,   0);
    const AMBER_LIGHT = hex(255, 251, 235);
    const WHITE  = rgb(1, 1, 1);
    const BLACK  = rgb(0, 0, 0);
    const GREY   = hex(102, 102, 102);
    const ORANGE = hex(234,  88,  12);
    const BLUE   = hex( 37,  99, 235);
    const RED    = hex(220,  38,  38);
    const GREEN  = hex( 22, 163,  74);

    const COLS = [
      { label: 'ID No.',       w:  55 },
      { label: 'Item Name',    w: 120 },
      { label: 'Categories',   w: 130 },
      { label: 'Serial No.',   w:  80 },
      { label: 'Qty',          w:  30 },
      { label: 'Condition',    w:  65 },
      { label: 'Status',       w:  75 },
      { label: 'Assigned To',  w: 112 },
      { label: 'Location',     w:  95 },
    ];
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

    const uniqueCategories = [...new Set((items.flatMap(i => i.categories || [])))];
    const isSingleCategory = uniqueCategories.length === 1;
    const categoryName = isSingleCategory ? uniqueCategories[0] : null;

    const fmtNumber = (n) => `DC-${String(n).padStart(4, '0')}`;

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
      p.drawRectangle({ x: MARGIN, y: topY, width: TABLE_W, height: HDR_H, color: AMBER });
      let x = MARGIN;
      for (const col of COLS) {
        p.drawText(col.label, {
          x: x + CELL_PAD, y: topY + (HDR_H - 10) / 2,
          size: 9, font: fontBold, color: WHITE,
        });
        x += col.w;
      }
    }

    function statusColor(s) {
      return { 'Available': GREEN, 'In Use': BLUE, 'Under Repair': ORANGE, 'Lost': RED, 'Retired': GREY }[s] || BLACK;
    }

    function conditionColor(c) {
      return { 'New': GREEN, 'Good': BLUE, 'Fair': ORANGE, 'Poor': RED, 'Damaged': RED }[c] || BLACK;
    }

    function drawRow(p, rowY, item, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: AMBER_LIGHT });
      }

      const categoriesText = (item.categories || []).join(', ') || '—';

      const cells = [
        fmtNumber(item.itemNumber),
        item.itemName     || '—',
        categoriesText,
        item.serialNumber || '—',
        String(item.quantity ?? '—'),
        item.condition    || '—',
        item.status       || '—',
        item.assignedTo   || '—',
        item.location     || '—',
      ];

      const cellColors = [AMBER_DARK, BLACK, GREY, GREY, BLACK, conditionColor(item.condition), statusColor(item.status), BLACK, BLACK];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        p.drawText(clip(cell, COLS[i].w, 9, font), {
          x: x + CELL_PAD, y: rowY + (ROW_H - 9) / 2,
          size: 9, font, color: cellColors[i],
        });
        x += COLS[i].w;
      });
    }

    // ── Page 1 ────────────────────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const orgName = 'Bosele Day Care Pre-school';
    page.drawText(orgName, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(orgName, 20)) / 2,
      y, size: 20, font: fontBold, color: AMBER,
    });
    y -= 26;

    const subtitle = isSingleCategory
      ? `Items & Tools Register — ${categoryName}`
      : 'Items & Tools Register';
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 13)) / 2,
      y, size: 13, font: fontBold, color: AMBER_DARK,
    });
    y -= 20;

    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 22;

    const availableCount = items.filter(i => i.status === 'Available').length;
    const inUseCount     = items.filter(i => i.status === 'In Use').length;
    const repairCount    = items.filter(i => i.status === 'Under Repair').length;
    const totalQty       = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    const summary = `Total Items: ${items.length}   Total Qty: ${totalQty}   Available: ${availableCount}   In Use: ${inUseCount}   Under Repair: ${repairCount}`;
    page.drawText(summary, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summary, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 28;

    drawTableHeader(page, y);
    y -= ROW_H;

    items.forEach((item, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
        drawTableHeader(page, y);
        y -= ROW_H;
      }
      drawRow(page, y, item, index);
      y -= ROW_H;
    });

    // ── Footer ────────────────────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      const catLabel = isSingleCategory ? `  •  ${categoryName}` : '';
      const footerText = `Bosele Day Care Pre-school${catLabel}  •  Page ${i + 1} of ${totalPages}  •  Confidential`;
      p.drawText(footerText, {
        x: MARGIN + (TABLE_W - font.widthOfTextAtSize(footerText, 7)) / 2,
        y: MARGIN - 15, size: 7, font, color: GREY,
      });
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="daycare-items-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error generating daycare items PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}