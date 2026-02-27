// ========================================
// FILE: app/api/elderly-people/export-pdf/route.js
// PURPOSE: Generate PDF for elderly people registry — with categories
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function hex(r, g, b) { return rgb(r / 255, g / 255, b / 255); }

// ── Category config (mirrors frontend) ───────────────────────────
const ALL_CATEGORIES = [
  { value: 'Elderly',    label: 'Elderly',    abbr: 'ELD' },
  { value: 'Disabled',   label: 'Disabled',   abbr: 'DIS' },
  { value: 'Vulnerable', label: 'Vulnerable', abbr: 'VUL' },
  { value: 'Orphan',     label: 'Orphan',     abbr: 'ORP' },
]

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
    const ROW_H    = 22;   // slightly taller to fit category badges
    const FOOTER_H = 30;

    const EMERALD        = hex(  5, 150, 105);
    const EMERALD_DARK   = hex(  4,  90,  64);
    const EMERALD_LIGHT  = hex(209, 250, 229);
    const WHITE   = rgb(1, 1, 1);
    const BLACK   = rgb(0, 0, 0);
    const GREY    = hex(102, 102, 102);
    const ORANGE  = hex(180,  83,   9);
    const BLUE    = hex( 37,  99, 235);
    const PINK    = hex(219,  39, 119);

    // Category badge colours (bg fill, text)
    const CAT_COLORS = {
      Elderly:    { bg: hex(253, 230, 138), text: hex(146,  64,  14) },  // amber
      Disabled:   { bg: hex(191, 219, 254), text: hex( 29,  78, 216) },  // blue
      Vulnerable: { bg: hex(254, 215, 170), text: hex(154,  52,  18) },  // orange
      Orphan:     { bg: hex(233, 213, 255), text: hex(109,  40, 217) },  // purple
    }

    // ── Column widths — total must equal TABLE_W (762) ────────────
    // Added "Categories" col (110px), reduced a few others slightly
    const COLS = [
      { label: '#',            w:  25 },
      { label: 'Full Name',    w: 108 },
      { label: 'Categories',   w: 110 },   // ← NEW
      { label: 'ID Number',    w:  88 },
      { label: 'Age',          w:  30 },
      { label: 'Gender',       w:  48 },
      { label: 'Village/Town', w:  90 },
      { label: 'District',     w:  72 },
      { label: 'Phone',        w:  75 },
      { label: 'Next of Kin',  w:  80 },
      { label: 'Medical',      w:  36 },
    ];
    // Auto-adjust last col to fill any rounding gap
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0);
    COLS[COLS.length - 1].w += colDiff;

    // Detect single-village / single-category export
    const uniqueVillages   = [...new Set(people.map(p => p.villageTown?.trim()).filter(Boolean))]
    const isSingleVillage  = uniqueVillages.length === 1
    const villageName      = isSingleVillage ? uniqueVillages[0] : null

    // Find which categories are actually present in this export
    const presentCategories = ALL_CATEGORIES.filter(c =>
      people.some(p => (p.categories || []).includes(c.value))
    )

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
          x: x + CELL_PAD, y: topY + (HDR_H - 9) / 2,
          size: 8, font: fontBold, color: WHITE,
        });
        x += col.w;
      }
    }

    // Draw category pills in the Categories cell
    function drawCategoryBadges(p, rowY, categories, colW, colX) {
      if (!categories || categories.length === 0) {
        p.drawText('—', {
          x: colX + CELL_PAD, y: rowY + (ROW_H - 8) / 2,
          size: 8, font, color: GREY,
        });
        return;
      }

      const BADGE_H   = 10;
      const BADGE_PAD = 3;
      const BADGE_GAP = 2;
      let bx = colX + CELL_PAD;
      const by = rowY + (ROW_H - BADGE_H) / 2;

      for (const cat of categories) {
        const colors = CAT_COLORS[cat] || { bg: hex(229, 231, 235), text: GREY };
        const abbr   = ALL_CATEGORIES.find(c => c.value === cat)?.abbr || cat.slice(0, 3).toUpperCase();
        const labelW = fontBold.widthOfTextAtSize(abbr, 6.5);
        const badgeW = labelW + BADGE_PAD * 2;

        // Don't overflow the cell
        if (bx + badgeW > colX + colW - CELL_PAD) break;

        p.drawRectangle({ x: bx, y: by, width: badgeW, height: BADGE_H, color: colors.bg, borderRadius: 2 });
        p.drawText(abbr, {
          x: bx + BADGE_PAD, y: by + (BADGE_H - 6.5) / 2,
          size: 6.5, font: fontBold, color: colors.text,
        });
        bx += badgeW + BADGE_GAP;
      }
    }

    function drawRow(p, rowY, person, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: EMERALD_LIGHT });
      }

      const medText  = person.medicalInfo ? 'Yes' : 'None';
      const medColor = person.medicalInfo ? ORANGE : GREY;
      const genderColor = person.gender === 'Male' ? BLUE : person.gender === 'Female' ? PINK : BLACK;

      // Regular text cells (skip index 2 = Categories — drawn separately)
      const cells = [
        String(index + 1),
        `${person.firstName || ''} ${person.lastName || ''}`.trim() || '—',
        null,   // placeholder for Categories (drawn as badges)
        person.idNumber      || '—',
        String(person.age    || '—'),
        person.gender        || '—',
        person.villageTown   || '—',
        person.district      || '—',
        person.phone         || '—',
        person.nextOfKinName || '—',
        medText,
      ];

      let x = MARGIN;
      cells.forEach((cell, i) => {
        if (i === 2) {
          // Draw category badges
          drawCategoryBadges(p, rowY, person.categories || [], COLS[i].w, x);
        } else {
          const color =
            i === 10 ? medColor :
            i === 5  ? genderColor :
            BLACK;
          p.drawText(clip(String(cell ?? '—'), COLS[i].w, 8, font), {
            x: x + CELL_PAD, y: rowY + (ROW_H - 8) / 2,
            size: 8, font, color,
          });
        }
        x += COLS[i].w;
      });
    }

    // ── Page 1 header ─────────────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    let y = PAGE_H - MARGIN;

    const title = 'Bosele Kgotla';
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 20)) / 2,
      y, size: 20, font: fontBold, color: EMERALD,
    });
    y -= 26;

    const subtitle = isSingleVillage
      ? `Community Registry — ${villageName}`
      : 'Community Registry';
    page.drawText(subtitle, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(subtitle, 13)) / 2,
      y, size: 13, font: fontBold, color: EMERALD_DARK,
    });
    y -= 20;

    const dateStr = `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    page.drawText(dateStr, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(dateStr, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 18;

    // ── Summary stats line ────────────────────────────────────────
    const maleCount   = people.filter(p => p.gender === 'Male').length;
    const femaleCount = people.filter(p => p.gender === 'Female').length;
    const avgAge      = people.length
      ? Math.round(people.reduce((s, p) => s + Number(p.age || 0), 0) / people.length)
      : 0;

    const catCounts = ALL_CATEGORIES
      .map(c => `${c.label}: ${people.filter(p => (p.categories || []).includes(c.value)).length}`)
      .join('   ');

    const summaryLine1 = `Total: ${people.length}   Male: ${maleCount}   Female: ${femaleCount}   Avg Age: ${avgAge}`;
    const summaryLine2 = catCounts;

    page.drawText(summaryLine1, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summaryLine1, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 14;
    page.drawText(summaryLine2, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summaryLine2, 9)) / 2,
      y, size: 9, font, color: GREY,
    });
    y -= 32;

    // ── Table ─────────────────────────────────────────────────────
    drawTableHeader(page, y);
    y -= ROW_H;

    people.forEach((person, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN;
        drawTableHeader(page, y);
        y -= ROW_H;
      }
      drawRow(page, y, person, index);
      y -= ROW_H;
    });

    // ── Footer ────────────────────────────────────────────────────
    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i);
      const villageLabel = isSingleVillage ? `  •  ${villageName}` : '';
      const footerText = `Bosele Kgotla${villageLabel}  •  Page ${i + 1} of ${totalPages}  •  Confidential`;
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
        'Content-Disposition': `attachment; filename="community-registry-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}