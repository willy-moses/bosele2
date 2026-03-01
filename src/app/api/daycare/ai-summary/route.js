// app/api/daycare/ai-summary/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data } = await request.json()

    const pct         = parseFloat(data.collectionPct)
    const outstanding = parseFloat(data.outstanding)

    const health  = pct >= 80 ? 'strong' : pct >= 50 ? 'moderate' : 'low'
    const concern = outstanding > 0
      ? `BWP ${data.outstanding} remains outstanding across ${data.countUnpaid} child(ren).`
      : 'All billed fees have been fully collected.'
    const waived  = data.countWaived > 0
      ? `${data.countWaived} fee record(s) have been waived this period.`
      : ''
    const partial = data.countPartial > 0
      ? `${data.countPartial} child(ren) have made partial payments.`
      : ''
    const reg     = data.pendingReg > 0
      ? `There are ${data.pendingReg} pending registration(s) awaiting review.`
      : 'There are no pending registrations.'

    const summary = `Fee collection for ${data.period} is ${health} at ${pct}%, with BWP ${data.collected} collected out of BWP ${data.due} billed. ${concern} ${partial} ${waived} ${reg} The school currently has ${data.activeChildren} active children and ${data.activeStaff} staff members on record.`
      .replace(/\s+/g, ' ')
      .trim()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('AI summary error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}