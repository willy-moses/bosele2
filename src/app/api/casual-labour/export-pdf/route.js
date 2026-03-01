// app/api/casual-labour/export-pdf/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

function hex(r, g, b) { return rgb(r / 255, g / 255, b / 255) }

const EMERALD       = hex(  5, 150, 105)
const EMERALD_DARK  = hex(  4,  90,  64)
const EMERALD_LIGHT = hex(209, 250, 229)
const WHITE         = rgb(1, 1, 1)
const BLACK         = rgb(0, 0, 0)
const GREY          = hex(102, 102, 102)
const BLUE          = hex( 37,  99, 235)
const PINK          = hex(219,  39, 119)
const ORANGE        = hex(180,  83,   9)
const GREEN         = hex( 21, 128,  61)
const YELLOW_BG     = hex(254, 249, 195)
const YELLOW_TEXT   = hex(146,  64,  14)
const GREEN_BG      = hex(220, 252, 231)
const GRAY_BG       = hex(243, 244, 246)
const GRAY_TEXT     = hex(107, 114, 128)

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { workers } = await request.json()
    if (!workers?.length) return NextResponse.json({ error: 'No data to export' }, { status: 400 })

    // ── Layout ────────────────────────────────────────────────────
    const PAGE_W   = 842
    const PAGE_H   = 595
    const MARGIN   = 40
    const TABLE_W  = PAGE_W - MARGIN * 2
    const CELL_PAD = 5
    const HDR_H    = 25
    const ROW_H    = 22
    const FOOTER_H = 30

    // ── Columns ───────────────────────────────────────────────────
    const COLS = [
      { label: '#',             w:  25 },
      { label: 'Full Name',     w: 120 },
      { label: 'ID / Omang',    w:  95 },
      { label: 'Age',           w:  35 },
      { label: 'Gender',        w:  50 },
      { label: 'Village / Town',w:  95 },
      { label: 'Phone',         w:  80 },
      { label: 'Skills',        w: 110 },
      { label: 'Status',        w:  65 },
      { label: 'Notes',         w:  87 },
    ]
    const colDiff = TABLE_W - COLS.reduce((s, c) => s + c.w, 0)
    COLS[COLS.length - 1].w += colDiff

    const pdfDoc   = await PDFDocument.create()
    const font     = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    function clip(text, colW, size, f) {
      const s   = String(text || '')
      const maxW = colW - CELL_PAD * 2
      if (f.widthOfTextAtSize(s, size) <= maxW) return s
      let t = s
      while (t.length > 1 && f.widthOfTextAtSize(t + '…', size) > maxW) t = t.slice(0, -1)
      return t + '…'
    }

    function drawTableHeader(p, topY) {
      p.drawRectangle({ x: MARGIN, y: topY, width: TABLE_W, height: HDR_H, color: EMERALD })
      let x = MARGIN
      for (const col of COLS) {
        p.drawText(col.label, {
          x: x + CELL_PAD, y: topY + (HDR_H - 9) / 2,
          size: 8, font: fontBold, color: WHITE,
        })
        x += col.w
      }
    }

    function drawStatusBadge(p, rowY, status, colX, colW) {
      const label = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Waiting'
      const bg    = status === 'hired' ? GREEN_BG : status === 'unavailable' ? GRAY_BG : YELLOW_BG
      const text  = status === 'hired' ? GREEN    : status === 'unavailable' ? GRAY_TEXT : YELLOW_TEXT

      const BADGE_H   = 12
      const BADGE_PAD = 5
      const labelW    = fontBold.widthOfTextAtSize(label, 7)
      const badgeW    = labelW + BADGE_PAD * 2
      const bx        = colX + CELL_PAD
      const by        = rowY + (ROW_H - BADGE_H) / 2

      p.drawRectangle({ x: bx, y: by, width: badgeW, height: BADGE_H, color: bg, borderRadius: 3 })
      p.drawText(label, {
        x: bx + BADGE_PAD, y: by + (BADGE_H - 7) / 2,
        size: 7, font: fontBold, color: text,
      })
    }

    function drawRow(p, rowY, worker, index) {
      if (index % 2 === 0) {
        p.drawRectangle({ x: MARGIN, y: rowY, width: TABLE_W, height: ROW_H, color: EMERALD_LIGHT })
      }

      const genderColor = worker.gender === 'Male' ? BLUE : worker.gender === 'Female' ? PINK : BLACK

      const cells = [
        String(index + 1),
        worker.full_name    || '—',
        worker.id_number    || '—',
        String(worker.age   || '—'),
        worker.gender       || '—',
        worker.village_town || '—',
        worker.phone        || '—',
        worker.skills       || '—',
        null,   // status badge — drawn separately
        worker.notes        || '—',
      ]

      let x = MARGIN
      cells.forEach((cell, i) => {
        if (i === 8) {
          drawStatusBadge(p, rowY, worker.status, x, COLS[i].w)
        } else {
          const color = i === 4 ? genderColor : BLACK
          p.drawText(clip(String(cell ?? '—'), COLS[i].w, 8, font), {
            x: x + CELL_PAD, y: rowY + (ROW_H - 8) / 2,
            size: 8, font, color,
          })
        }
        x += COLS[i].w
      })
    }

    // ── Stats ─────────────────────────────────────────────────────
    const waiting     = workers.filter(w => w.status === 'waiting').length
    const hired       = workers.filter(w => w.status === 'hired').length
    const unavailable = workers.filter(w => w.status === 'unavailable').length
    const maleCount   = workers.filter(w => w.gender === 'Male').length
    const femaleCount = workers.filter(w => w.gender === 'Female').length

    // ── Page 1 header ─────────────────────────────────────────────
    let page = pdfDoc.addPage([PAGE_W, PAGE_H])
    let y = PAGE_H - MARGIN

    const title = 'Bosele Kgotla'
    page.drawText(title, {
      x: MARGIN + (TABLE_W - fontBold.widthOfTextAtSize(title, 20)) / 2,
      y, size: 20, font: fontBold, color: EMERALD,
    })
    y -= 26

    const subtitle = 'Casual Labour Waitlist'
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
    y -= 18

    const summaryLine = `Total: ${workers.length}   Waiting: ${waiting}   Hired: ${hired}   Unavailable: ${unavailable}   Male: ${maleCount}   Female: ${femaleCount}`
    page.drawText(summaryLine, {
      x: MARGIN + (TABLE_W - font.widthOfTextAtSize(summaryLine, 9)) / 2,
      y, size: 9, font, color: GREY,
    })
    y -= 32

    // ── Table ─────────────────────────────────────────────────────
    drawTableHeader(page, y)
    y -= ROW_H

    workers.forEach((worker, index) => {
      if (y - ROW_H < MARGIN + FOOTER_H) {
        page = pdfDoc.addPage([PAGE_W, PAGE_H])
        y = PAGE_H - MARGIN
        drawTableHeader(page, y)
        y -= ROW_H
      }
      drawRow(page, y, worker, index)
      y -= ROW_H
    })

    // ── Footer on every page ──────────────────────────────────────
    const totalPages = pdfDoc.getPageCount()
    for (let i = 0; i < totalPages; i++) {
      const p = pdfDoc.getPage(i)
      const footerText = `Bosele Kgotla  •  Casual Labour Waitlist  •  Page ${i + 1} of ${totalPages}  •  Confidential`
      p.drawText(footerText, {
        x: MARGIN + (TABLE_W - font.widthOfTextAtSize(footerText, 7)) / 2,
        y: MARGIN - 15, size: 7, font, color: GREY,
      })
    }

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="casual-labour-waitlist-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('❌ PDF export error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}