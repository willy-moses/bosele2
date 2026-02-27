// app/api/daycare/fees/receipt/route.js
// POST { paymentId } — generate and return a PDF receipt for a payment
// Principal only

import { NextResponse }  from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }   from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { jsPDF }         from 'jspdf'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function fmt(n) { return `BWP ${Number(n || 0).toFixed(2)}` }

function buildPDF(payment) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, ml = 20, mr = 20, contentW = W - ml - mr

  const monthLabel = MONTHS[(payment.month ?? 1) - 1]
  const paidDate   = payment.paid_date
    ? new Date(payment.paid_date).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    : 'N/A'
  const createdAt  = payment.created_at
    ? new Date(payment.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    : new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })

  const due      = Number(payment.amount_due  || 0)
  const paid     = Number(payment.amount_paid || 0)
  const balance  = Math.max(0, due - paid)
  const receipt  = payment.receipt_number || payment.reference || '—'
  const method   = payment.payment_method || 'Cash'
  const status   = payment.status         || 'Paid'
  const notes    = payment.notes          || ''
  const recordedBy = payment.recorded_by  || 'Principal'
  const childName  = payment.child_name   || ''
  const parentName = payment.parent_name  || ''
  const cls        = payment.class        || 'N/A'

  const statusColors = {
    Paid:    [22,  163, 74],
    Partial: [37,  99,  235],
    Unpaid:  [217, 119, 6],
    Overdue: [220, 38,  38],
    Waived:  [107, 114, 128],
  }
  const [sr, sg, sb] = statusColors[status] || statusColors.Paid

  let y = 15

  // ── Amber header bar ────────────────────────────────────────────────────────
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Bosele Day Care Pre-school', W / 2, 12, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Official Payment Receipt', W / 2, 21, { align: 'center' })

  y = 36

  // ── Status badge ────────────────────────────────────────────────────────────
  doc.setFillColor(sr, sg, sb)
  doc.roundedRect(ml, y, contentW, 14, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(fmt(paid), W / 2, y + 9, { align: 'center' })
  y += 18

  doc.setFillColor(sr, sg, sb)
  doc.roundedRect(W / 2 - 20, y, 40, 7, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(status.toUpperCase(), W / 2, y + 5, { align: 'center' })
  y += 13

  // ── Divider ─────────────────────────────────────────────────────────────────
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.8)
  doc.line(ml, y, W - mr, y)
  y += 6

  // ── Details rows ────────────────────────────────────────────────────────────
  const rows = [
    ['Receipt No.',        receipt],
    ['Child Name',         childName],
    ['Class',              cls],
    ['Parent / Guardian',  parentName],
    ['Month',              `${monthLabel} ${payment.year}`],
    ['Payment Date',       paidDate],
    ['Payment Method',     method],
    ['Amount Due',         fmt(due)],
    ['Amount Paid',        fmt(paid)],
    ['Balance',            balance > 0 ? fmt(balance) : 'NIL'],
  ]
  if (notes) rows.push(['Notes', notes])

  rows.forEach(([label, value], i) => {
    // alternating background
    if (i % 2 === 0) {
      doc.setFillColor(255, 251, 235)
      doc.rect(ml, y - 1, contentW, 8, 'F')
    }
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 113, 108)
    doc.text(label, ml + 3, y + 5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(28, 25, 23)
    doc.text(String(value), ml + 60, y + 5)

    y += 8
  })

  y += 4

  // ── Footer divider ──────────────────────────────────────────────────────────
  doc.setDrawColor(253, 230, 138)
  doc.setLineWidth(0.5)
  doc.line(ml, y, W - mr, y)
  y += 5

  // ── Recorded by / date issued ───────────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(120, 113, 108)
  doc.text(`Recorded by: ${recordedBy}`, ml, y)
  doc.text(`Date issued: ${createdAt}`, W - mr, y, { align: 'right' })
  y += 8

  // ── Thank you note ──────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(160, 160, 160)
  doc.text('Thank you for your payment. Please keep this receipt for your records.', W / 2, y, { align: 'center' })

  // ── Bottom footer bar ───────────────────────────────────────────────────────
  doc.setFillColor(245, 158, 11)
  doc.rect(0, 287, W, 10, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(255, 255, 255)
  doc.text('Bosele Day Care Pre-school  •  Official Receipt  •  Keep for your records', W / 2, 293, { align: 'center' })

  return Buffer.from(doc.output('arraybuffer'))
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = session.user?.role?.toUpperCase().replace(/-/g, '_')
    if (role !== 'DAY_CARE_PRINCIPAL') {
      return NextResponse.json({ error: 'Principal access required' }, { status: 403 })
    }

    const { paymentId } = await request.json()
    if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 })

    const { data: payment, error } = await supabaseAdmin
      .from('fee_payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error || !payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const pdfBuffer = buildPDF(payment)
    const filename  = `receipt-${payment.receipt_number || payment.id}-${payment.child_name?.replace(/\s+/g, '-')}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length':      pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('POST /api/daycare/fees/receipt:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}