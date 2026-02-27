// app/api/daycare/fees/reminders/route.js
// POST { childIds, month, year, channel, message } — log reminders + mark sent
// GET  ?month=&year=                               — list reminders sent
// Principal only

import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/app/api/auth/[...nextauth]/route'
import prisma               from '@/lib/prisma'

async function requirePrincipal() {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized', status: 401 }
  const role = session.user?.role?.toUpperCase().replace(/-/g, '_')
  if (role !== 'DAY_CARE_PRINCIPAL') return { error: 'Principal access required', status: 403 }
  return { session }
}

// ─── GET — list reminders ─────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { error, status } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')) : null
    const year  = searchParams.get('year')  ? parseInt(searchParams.get('year'))  : null

    const where = {}
    if (month) where.month = month
    if (year)  where.year  = year

    const reminders = await prisma.feeReminder.findMany({
      where,
      orderBy: { sentAt: 'desc' },
    })

    return NextResponse.json({ reminders })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ─── POST — send reminders ────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { error, status, session } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const { childIds, month, year, channel = 'Manual', message } = await request.json()

    if (!childIds?.length || !month || !year) {
      return NextResponse.json({ error: 'childIds, month and year are required' }, { status: 400 })
    }

    // Find matching payment records
    const payments = await prisma.feePayment.findMany({
      where: {
        childId: { in: childIds },
        month:   parseInt(month),
        year:    parseInt(year),
        status:  { in: ['Unpaid', 'Overdue', 'Partial'] },
      },
    })

    const now = new Date()
    const sentBy = session.user?.name || session.user?.email

    // Create reminder log entries and mark payments as reminded
    const reminderData = payments.map(p => ({
      childId:   p.childId,
      paymentId: p.id,
      month:     p.month,
      year:      p.year,
      sentAt:    now,
      sentBy,
      channel,
      message: message || `Reminder: School fee of BWP ${Number(p.amountDue).toFixed(2)} for ${month}/${year} is outstanding. Please make payment as soon as possible. — Bosele Day Care`,
    }))

    await prisma.feeReminder.createMany({ data: reminderData })

    // Mark payments as reminder_sent
    await prisma.feePayment.updateMany({
      where: { id: { in: payments.map(p => p.id) } },
      data:  { reminderSent: true, reminderSentAt: now, updatedAt: now },
    })

    return NextResponse.json({
      success: true,
      count:   reminderData.length,
      message: `Reminder logged for ${reminderData.length} payment(s). Use the contact info to reach out via ${channel}.`,
    })
  } catch (err) {
    console.error('POST /api/daycare/fees/reminders:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}