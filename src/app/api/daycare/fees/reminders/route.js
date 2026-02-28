// app/api/daycare/fees/reminders/route.js
// POST { childIds, month, year, channel, message } — log reminders + mark sent
// GET  ?month=&year=                               — list reminders sent
// Principal only

import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { supabaseAdmin }    from '@/lib/supabase'
import twilio               from 'twilio'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

// ─── Twilio client (only if credentials are set) ──────────────────────────────
function getTwilioClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  return twilio(sid, token)
}

// ─── Send a single WhatsApp message via Twilio ────────────────────────────────
async function sendWhatsApp(to, body) {
  const client = getTwilioClient()
  if (!client) throw new Error('Twilio credentials not configured')

  // Normalize Botswana number: strip leading 0 or +267, then add +267
  const digits = to.replace(/\D/g, '')
  const normalized = digits.startsWith('267')
    ? `+${digits}`
    : `+267${digits.replace(/^0/, '')}`

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    to:   `whatsapp:${normalized}`,
    body,
  })
}

// ─── Send a single SMS via Twilio ─────────────────────────────────────────────
async function sendSMS(to, body) {
  const client = getTwilioClient()
  if (!client) throw new Error('Twilio credentials not configured')

  const digits = to.replace(/\D/g, '')
  const normalized = digits.startsWith('267')
    ? `+${digits}`
    : `+267${digits.replace(/^0/, '')}`

  await client.messages.create({
    from: process.env.TWILIO_SMS_FROM || process.env.TWILIO_WHATSAPP_FROM?.replace('whatsapp:', ''),
    to:   normalized,
    body,
  })
}

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

    let query = supabaseAdmin
      .from('fee_reminders')
      .select('*')
      .order('sent_at', { ascending: false })

    if (month) query = query.eq('month', month)
    if (year)  query = query.eq('year',  year)

    const { data: reminders, error: dbError } = await query
    if (dbError) throw dbError

    return NextResponse.json({ reminders })
  } catch (err) {
    console.error('GET /api/daycare/fees/reminders:', err)
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

    const monthName = MONTHS[(parseInt(month) ?? 1) - 1]

    // Fetch payments for these children
    const { data: payments, error: fetchError } = await supabaseAdmin
      .from('fee_payments')
      .select('id, child_id, child_name, parent_name, parent_phone, amount_due, month, year')
      .in('child_id', childIds)
      .eq('month', parseInt(month))
      .eq('year',  parseInt(year))
      .in('status', ['Unpaid', 'Overdue', 'Partial'])

    if (fetchError) throw fetchError

    const now    = new Date().toISOString()
    const sentBy = session.user?.name || session.user?.email

    // ── Send messages if channel requires it ──────────────────────────────────
    const sendResults = []
    if (channel === 'WhatsApp' || channel === 'SMS') {
      for (const p of (payments || [])) {
        const phone = p.parent_phone
        if (!phone) {
          sendResults.push({ childId: p.child_id, success: false, error: 'No phone number' })
          continue
        }

        const body = message ||
          `Dear Parent,\n\nThis is a reminder that the school fee of BWP ${Number(p.amount_due).toFixed(2)} for ${monthName} ${year} is outstanding for ${p.child_name}.\n\nPlease make payment at your earliest convenience.\n\nThank you,\nBosele Day Care Pre-school`

        try {
          if (channel === 'WhatsApp') await sendWhatsApp(phone, body)
          if (channel === 'SMS')      await sendSMS(phone, body)
          sendResults.push({ childId: p.child_id, success: true })
        } catch (sendErr) {
          console.error(`Failed to send ${channel} to ${phone}:`, sendErr.message)
          sendResults.push({ childId: p.child_id, success: false, error: sendErr.message })
        }
      }
    }

    // ── Log all reminders to fee_reminders ────────────────────────────────────
    const reminderData = (payments || []).map(p => ({
      child_id:   p.child_id,
      payment_id: p.id,
      month:      p.month,
      year:       p.year,
      sent_at:    now,
      sent_by:    sentBy,
      channel,
      message:    message ||
        `Reminder: School fee of BWP ${Number(p.amount_due).toFixed(2)} for ${monthName} ${year} is outstanding. Please make payment as soon as possible. — Bosele Day Care`,
    }))

    if (reminderData.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('fee_reminders')
        .insert(reminderData)
      if (insertError) throw insertError

      // Mark payments as reminder sent
      const { error: updateError } = await supabaseAdmin
        .from('fee_payments')
        .update({ reminder_sent: true, reminder_sent_at: now })
        .in('id', payments.map(p => p.id))
      if (updateError) throw updateError
    }

    // ── Build response ────────────────────────────────────────────────────────
    const failed  = sendResults.filter(r => !r.success)
    const success = sendResults.filter(r =>  r.success)

    let responseMessage = `Reminder logged for ${reminderData.length} parent(s).`
    if (channel === 'WhatsApp' || channel === 'SMS') {
      responseMessage = `${channel} sent to ${success.length} parent(s).`
      if (failed.length > 0) responseMessage += ` ${failed.length} failed (no phone number or send error).`
    }

    return NextResponse.json({
      success: true,
      count:   reminderData.length,
      sent:    success.length,
      failed:  failed.length,
      message: responseMessage,
    })
  } catch (err) {
    console.error('POST /api/daycare/fees/reminders:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}