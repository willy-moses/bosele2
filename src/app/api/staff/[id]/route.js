import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ─── GET /api/daycare/staff/[id] ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.staff.findUnique({
      where: { id: params.id },
    })

    if (!member) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json({ staff: member })
  } catch (error) {
    console.error('GET /api/daycare/staff/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 })
  }
}

// ─── PATCH /api/daycare/staff/[id] ───────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'address',
      'position', 'department', 'employeeId',
      'dateOfBirth', 'hireDate', 'salary',
      'emergencyContactName', 'emergencyContactPhone',
      'status',
    ]

    const updateData = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'dateOfBirth' || field === 'hireDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else if (field === 'salary') {
          updateData[field] = body[field] ? parseFloat(body[field]) : null
        } else if (field === 'email') {
          updateData[field] = body[field].toLowerCase().trim()
        } else {
          updateData[field] = typeof body[field] === 'string'
            ? body[field].trim() || null
            : body[field]
        }
      }
    }

    const updated = await prisma.staff.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ staff: updated })
  } catch (error) {
    console.error('PATCH /api/daycare/staff/[id] error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
  }
}

// ─── DELETE /api/daycare/staff/[id] ──────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.staff.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/daycare/staff/[id] error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
  }
}