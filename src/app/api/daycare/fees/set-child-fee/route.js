// app/api/daycare/fees/set-child-fee/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = session.user?.role?.toUpperCase().replace(/-/g, '_')
    if (role !== 'DAY_CARE_PRINCIPAL') return NextResponse.json({ error: 'Principal access required' }, { status: 403 })

    const { childId, monthlyFee, feeNotes, startMonth, startYear } = await request.json()
    if (!childId) return NextResponse.json({ error: 'childId is required' }, { status: 400 })

    const enrollmentMonth = parseInt(startMonth) || new Date().getMonth() + 1
    const enrollmentYear  = parseInt(startYear)  || new Date().getFullYear()

    console.log('📅 Enrollment month:', enrollmentMonth, '| year:', enrollmentYear)
    console.log('📅 Months to waive: 1 to', enrollmentMonth - 1, '(total:', enrollmentMonth - 1, ')')

    // ── 1. Fetch child name and contact info ────────────────────────────────
    const { data: child, error: childError } = await supabase
      .from('Child')
      .select('id, firstName, lastName, parentFirstName, parentLastName, parentPhone, parentEmail, class')
      .eq('id', childId)
      .single()

    if (childError || !child) throw new Error('Child not found')

    const now          = new Date().toISOString()
    const recordedBy   = session.user?.name || session.user?.email
    const fee          = monthlyFee === '' || monthlyFee === null ? null : Number(monthlyFee)
    const effectiveFee = fee ?? 400

    // ── 2. Save custom fee to Child record ──────────────────────────────────
    const { error: updateError } = await supabase
      .from('Child')
      .update({
        monthly_fee: fee,
        fee_notes:   feeNotes || null,
        updatedAt:   new Date().toISOString(),
      })
      .eq('id', childId)

    if (updateError) throw updateError

    // ── 3. Auto-waive all months before enrollment month ────────────────────
    let actualWaivedCount = 0

    for (let m = 1; m < enrollmentMonth; m++) {
      console.log(`🔍 Checking month ${m} / ${enrollmentYear}...`)

      const { data: existing } = await supabase
        .from('fee_payments')
        .select('id')
        .eq('child_id', childId)
        .eq('month', m)
        .eq('year',  enrollmentYear)
        .maybeSingle()

      console.log(`   existing record for month ${m}:`, existing ? `YES (id: ${existing.id})` : 'NO — will waive')

      if (!existing) {
        const { error: insertError } = await supabase.from('fee_payments').insert({
          child_id:       childId,
          child_name:     `${child.firstName} ${child.lastName}`,
          parent_name:    `${child.parentFirstName ?? ''} ${child.parentLastName ?? ''}`.trim() || null,
          parent_phone:   child.parentPhone  || null,
          parent_email:   child.parentEmail  || null,
          class:          child.class        || null,
          amount_due:     0,
          amount_paid:    0,
          month:          m,
          year:           enrollmentYear,
          due_date:       `${enrollmentYear}-${String(m).padStart(2, '0')}-07`,
          paid_date:      null,
          payment_method: null,
          status:         'Waived',
          notes:          'Auto-waived: child not yet enrolled',
          recorded_by:    recordedBy,
          created_at:     now,
          updated_at:     now,
        })

        if (insertError) {
          console.error(`❌ Failed to waive month ${m}:`, insertError)
        } else {
          console.log(`   ✅ Month ${m} waived successfully`)
          actualWaivedCount++
        }
      }
    }

    console.log('✅ Total months waived:', actualWaivedCount)

    return NextResponse.json({
      success: true,
      enrollmentMonth,
      enrollmentYear,
      waivedCount: actualWaivedCount,
      message: `Fee set to BWP ${effectiveFee}. ${
        actualWaivedCount > 0
          ? `${actualWaivedCount} month(s) before enrollment auto-waived.`
          : 'All prior months were already recorded.'
      }`,
    })

  } catch (error) {
    console.error('❌ Error updating child fee:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}