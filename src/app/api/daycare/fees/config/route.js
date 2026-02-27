// app/api/daycare/fees/config/route.js
// GET  – return the active fee config
// POST – upsert the fee config

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Return the most recent active config (no effectiveTo, or effectiveTo in future)
    const config = await prisma.feeConfig.findFirst({
      where: {
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
      },
      orderBy: { effectiveFrom: 'desc' },
    })
    return NextResponse.json({ config: config ?? { monthlyFee: 250, currency: 'BWP' } })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only principals can change fee config
    const role = session.user?.role?.toUpperCase().replace(/-/g, '_')
    if (role !== 'DAY_CARE_PRINCIPAL') {
      return NextResponse.json({ error: 'Only a Principal can change fee configuration' }, { status: 403 })
    }

    const { monthlyFee, description, currency } = await request.json()

    // Close any existing active config
    await prisma.feeConfig.updateMany({
      where: { effectiveTo: null },
      data:  { effectiveTo: new Date() },
    })

    // Create new config effective today
    const config = await prisma.feeConfig.create({
      data: {
        monthlyFee:    Number(monthlyFee),
        currency:      currency    ?? 'BWP',
        description:   description ?? null,
        effectiveFrom: new Date(),
        createdBy:     session.user?.name || session.user?.email,
      },
    })

    return NextResponse.json({ config })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}