import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── GET /api/daycare/staff/[id] ─────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: member, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('GET staff by id error:', error)
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

    // Build update object with only provided fields
    const updateData = {}

    if (body.firstName !== undefined) updateData.first_name = body.firstName.trim()
    if (body.lastName !== undefined) updateData.last_name = body.lastName.trim()
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim()
    if (body.phone !== undefined) updateData.phone = body.phone.trim()
    if (body.address !== undefined) updateData.address = body.address?.trim() || null
    if (body.position !== undefined) updateData.position = body.position.trim()
    if (body.department !== undefined) updateData.department = body.department.trim()
    if (body.employeeId !== undefined) updateData.employee_id = body.employeeId
    if (body.dateOfBirth !== undefined) updateData.date_of_birth = body.dateOfBirth || null
    if (body.hireDate !== undefined) updateData.hire_date = body.hireDate
    if (body.salary !== undefined) updateData.salary = body.salary ? parseFloat(body.salary) : null
    if (body.emergencyContactName !== undefined) updateData.emergency_contact_name = body.emergencyContactName?.trim() || null
    if (body.emergencyContactPhone !== undefined) updateData.emergency_contact_phone = body.emergencyContactPhone?.trim() || null
    if (body.status !== undefined) updateData.status = body.status

    const { data: updated, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('PATCH staff error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
    }

    return NextResponse.json({ staff: updated })
  } catch (error) {
    console.error('PATCH /api/daycare/staff/[id] error:', error)
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

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('DELETE staff error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/daycare/staff/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
  }
}