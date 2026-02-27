// app/api/daycare/fees/route.js

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function requirePrincipal() {
  const session = await getServerSession(authOptions)
  if (!session) return { error: 'Unauthorized', status: 401 }
  const role = session.user?.role?.toUpperCase().replace(/-/g, '_')
  if (role !== 'DAY_CARE_PRINCIPAL') return { error: 'Principal access required', status: 403 }
  return { session, role }
}

export async function GET(request) {
  try {
    const { error, status } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const { searchParams } = new URL(request.url)
    const year      = searchParams.get('year')    ? parseInt(searchParams.get('year'))  : null
    const month     = searchParams.get('month')   ? parseInt(searchParams.get('month')) : null
    const childId   = searchParams.get('childId') || null
    const feeStatus = searchParams.get('status')  || null

    let query = supabaseAdmin
      .from('fee_payments')
      .select('*')
      .order('year',      { ascending: false })
      .order('month',     { ascending: false })
      .order('child_name',{ ascending: true })

    if (year)      query = query.eq('year',     year)
    if (month)     query = query.eq('month',    month)
    if (childId)   query = query.eq('child_id', childId)
    if (feeStatus) query = query.eq('status',   feeStatus)

    const { data, error: dbError } = await query

    if (dbError) {
      console.error('❌ Supabase error:', dbError)
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
    }

    const payments = (data || []).map(p => ({
      id:            p.id,
      childId:       p.child_id,
      childName:     p.child_name,
      parentName:    p.parent_name,
      parentPhone:   p.parent_phone,
      parentEmail:   p.parent_email,
      class:         p.class,
      amountDue:     p.amount_due,
      amountPaid:    p.amount_paid,
      dueDate:       p.due_date,
      paidDate:      p.paid_date,
      paymentMethod: p.payment_method,
      reference:     p.reference,
      status:        p.status,
      notes:         p.notes,
      recordedBy:    p.recorded_by,
      month:         p.month,
      year:          p.year,
      createdAt:     p.created_at,
      updatedAt:     p.updated_at,
    }))

    const totalDue     = payments.reduce((s, p) => s + Number(p.amountDue),  0)
    const totalPaid    = payments.reduce((s, p) => s + Number(p.amountPaid), 0)
    const countUnpaid  = payments.filter(p => ['Unpaid', 'Overdue'].includes(p.status)).length
    const countPaid    = payments.filter(p => p.status === 'Paid').length
    const countOverdue = payments.filter(p => p.status === 'Overdue').length
    const countPartial = payments.filter(p => p.status === 'Partial').length

    return NextResponse.json({
      payments,
      summary: { totalDue, totalPaid, countUnpaid, countPaid, countOverdue, countPartial },
    })
  } catch (err) {
    console.error('❌ GET /api/daycare/fees:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { error, status, session } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const body = await request.json()
    const {
      childId, childName, parentName, parentPhone, parentEmail,
      class: cls, amountDue, amountPaid,
      month, year, dueDate, paidDate,
      paymentMethod, reference, notes, status: manualStatus,
    } = body

    if (!childId || !month || !year || amountDue == null) {
      return NextResponse.json(
        { error: 'childId, month, year and amountDue are required' },
        { status: 400 }
      )
    }

    const due   = Number(amountDue)
    const paid  = Number(amountPaid ?? 0)
    const now   = new Date().toISOString()
    const dueDt = dueDate ? new Date(dueDate).toISOString() : new Date(year, month - 1, 7).toISOString()

    let derivedStatus = manualStatus
    if (!derivedStatus || derivedStatus === 'auto') {
      const dueDtDate = new Date(dueDt)
      if (paid >= due)               derivedStatus = 'Paid'
      else if (paid > 0)             derivedStatus = 'Partial'
      else if (dueDtDate < new Date()) derivedStatus = 'Overdue'
      else                           derivedStatus = 'Unpaid'
    }

    // Check for existing record to decide upsert
    const { data: existing } = await supabaseAdmin
      .from('fee_payments')
      .select('id')
      .eq('child_id', childId)
      .eq('month',    parseInt(month))
      .eq('year',     parseInt(year))
      .maybeSingle()

    const payload = {
      child_id:       childId,
      child_name:     childName,
      parent_name:    parentName    || null,
      parent_phone:   parentPhone   || null,
      parent_email:   parentEmail   || null,
      class:          cls           || null,
      amount_due:     due,
      amount_paid:    paid,
      due_date:       dueDt,
      paid_date:      paidDate && paid > 0 ? new Date(paidDate).toISOString() : null,
      payment_method: paymentMethod || null,
      reference:      reference     || null,
      status:         derivedStatus,
      notes:          notes         || null,
      recorded_by:    session.user?.name || session.user?.email,
      month:          parseInt(month),
      year:           parseInt(year),
      updated_at:     now,
    }

    let data, dbError

    if (existing) {
      ;({ data, error: dbError } = await supabaseAdmin
        .from('fee_payments')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single())
    } else {
      ;({ data, error: dbError } = await supabaseAdmin
        .from('fee_payments')
        .insert({ ...payload, created_at: now })
        .select()
        .single())
    }

    if (dbError) {
      console.error('❌ Error saving fee payment:', dbError)
      return NextResponse.json({ error: 'Failed to save payment' }, { status: 500 })
    }

    return NextResponse.json({ payment: data }, { status: existing ? 200 : 201 })
  } catch (err) {
    console.error('❌ POST /api/daycare/fees:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { error, status } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const { id, ...updates } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Convert camelCase keys to snake_case for Supabase
    const snakeUpdates = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [
        k.replace(/([A-Z])/g, '_$1').toLowerCase(), v
      ])
    )

    const { data, error: dbError } = await supabaseAdmin
      .from('fee_payments')
      .update({ ...snakeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (dbError) {
      console.error('❌ Error updating fee payment:', dbError)
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
    }

    return NextResponse.json({ payment: data })
  } catch (err) {
    console.error('❌ PATCH /api/daycare/fees:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { error, status } = await requirePrincipal()
    if (error) return NextResponse.json({ error }, { status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error: dbError } = await supabaseAdmin
      .from('fee_payments')
      .delete()
      .eq('id', id)

    if (dbError) {
      console.error('❌ Error deleting fee payment:', dbError)
      return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ DELETE /api/daycare/fees:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}