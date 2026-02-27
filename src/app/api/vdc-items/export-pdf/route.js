// ========================================
// FILE: app/api/vdc-items/export-pdf/route.js
// PURPOSE: Generate PDF for VDC Items & Tools register
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
    const PAGE_W   = 842;  // A4 landscape
    const PAGE_H   = 595;
    const MARGIN   = 40;
    const TABLE_W  = PAGE_W - MARGIN * 2;  // 762
    const CELL_PAD = 5;
    const HDR_H    = 25;
    const ROW_H    = 20;
    const FOOTER_H = 30;

    // Emerald colour theme (matching the rest of the app)
    const EMERALD       = hex(  5, 150, 105);
    const EMERALD_DARK  = hex(  4,  90,  64);
    const EMERALD_LIGHT = hex(209, 250, 229);
    const WHITE  = rgb(1, 1, 1);
    const BLACK  = rgb(0, 0, 0);
    const GREY   = hex(102, 102, 102);
    const ORANGE = hex(180,  83,   9);
    const BLUE   = hex( 37, 99, 235);
    const RED    = hex(220,  38,  38);

    // Columns — total must equal TABLE_W (762)
    const COLS = [
      { label: 'ID No.',        w:  60 },
      { label: 'Item Name',     w: 130 },
      { label: 'Category',      w:  90 },
      { label: 'Serial No.',    w:  90 },
      { label: 'Qty',           w:  35 },
      { label: 'Condition',     w:  70 },
      { label: 'Status',        w:  75 },
      { label: 'Assigned To',   w: 112 },
      { label: 'Location',      w: 100 },
    ];
    // Force last col to absorb any rounding gap
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

    // ── Detect single-category export ─────────────────────────────
    const uniqueCategories = [...new Set(items.map(i => i.category?.trim()).filter(Boolean))];
    const isSingleCategory = uniqueCategories.length === 1;
    const categoryName = isSingleCategory ? uniqueCategories[0] : null;

    // ── Format item_number as VDC-0001 ────────────────────────────
    const fmtNumber = (n) => `VDC-${String(n).padStart(4, '0')}`;

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

    function statusColor(status) {
      switch (status) {
        case 'Available':    return EMERALD;
        case 'In Use':       return BLUE;
        case 'Under Repair': return ORANGE;
        case 'Lost':         return RED;
        case 'Retired':      return GREY;
        default:             return BLACK;
      }
    }

    function conditionColor(condition) {
      switch (condition) {
        case 'New':     return EMERALD;
        case 'Good':    return BLUE;
        case 'Fair':    return ORANGE;
        case 'Poor':    return RED;
        case 'Damaged': return RED;
        default:        return BLACK;
      }
    }

    function drawRow(p, rowY, item, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: EMERALD_LIGHT });
      }

      const cells = [
        fmtNumber(item.item_number),
        item.item_name    || '—',
        item.category     || '—',
        item.serial_number|| '—',
        String(item.quantity ?? '—'),
        item.condition    || '—',
        item.status       || '—',
        item.assigned_to  || '—',
        item.location     || '—',
      ];

      const cellColors = [
        EMERALD,
        BLACK,
        BLACK,
        GREY,
        BLACK,
        conditionColor(item.condition),
        statusColor(item.status),
        BLACK,
        BLACK,
      ];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        p.drawText(clip(cell, COLS[i].w, 9, font), {
          x: x + CELL_PAD,
          y: rowY + (ROW_H - 9) / 2,
          size: 9, font, color: cellColors[i],
        });
        x += COLS[i].w;
      });
    }

    // ── Page 1: title block ───────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    // Organisation name
    const orgName = 'Bosele Kgotla';
    page.drawText(orgName, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(orgName, 20)) / 2,
      y, size: 20, font: fontBold, color: EMERALD,
    });
    y -= 26;

    // Register title — includes category name if filtered
    const subtitle = isSingleCategory
      ? `VDC Items & Tools Register — ${categoryName}`
      : 'VDC Items & Tools Register';
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
    const availableCount  = items.filter(i => i.status === 'Available').length;
    const inUseCount      = items.filter(i => i.status === 'In Use').length;
    const repairCount     = items.filter(i => i.status === 'Under Repair').length;
    const totalQty        = items.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    const summary = `Total Items: ${items.length}   Total Qty: ${totalQty}   Available: ${availableCount}   In Use: ${inUseCount}   Under Repair: ${repairCount}`;
    page.drawText(summary, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summary, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 28;

    // Table header
    drawTableHeader(page, y);
    y -= ROW_H;

    // ── Data rows with pagination ─────────────────────────────────
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

    // ── Footer on every page ──────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      const categoryLabel = isSingleCategory ? `  •  ${categoryName}` : '';
      const footerText = `Bosele Kgotla${categoryLabel}  •  Page ${i + 1} of ${totalPages}  •  Confidential`;
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
        'Content-Disposition': `attachment; filename="vdc-items-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error generating VDC items PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}