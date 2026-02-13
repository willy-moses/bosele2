import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client (server-side with service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ─── GET /api/daycare/staff ───────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/daycare/staff error:', error)
      return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
    }

    return NextResponse.json({ staff: staff || [] })
  } catch (error) {
    console.error('GET /api/daycare/staff error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// ─── POST /api/daycare/staff ──────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      firstName, lastName, email, phone,
      address, position, department, employeeId,
      dateOfBirth, hireDate,
      salary,
      emergencyContactName, emergencyContactPhone,
      // Support form field aliases from the dashboard form
      role: roleAlias,
      startDate,
      emergencyContact, emergencyPhone,
    } = body

    // ── Map dashboard form fields → DB fields ────────────────────────────────
    const resolvedPosition   = position   || roleAlias  || null
    const resolvedDept       = department || 'General'
    const resolvedHireDate   = hireDate   || startDate  || null
    const resolvedECName     = emergencyContactName  || emergencyContact  || null
    const resolvedECPhone    = emergencyContactPhone || emergencyPhone    || null
    const resolvedEmployeeId = employeeId || `EMP-${Date.now()}`

    // ── Validate required fields ─────────────────────────────────────────────
    if (!firstName || !lastName || !email || !phone || !resolvedPosition || !resolvedHireDate) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, phone, position/role, hireDate/startDate' },
        { status: 400 }
      )
    }

    // ── Check for duplicate email (simplified) ────────────────────────────────
    try {
      const { data: existingStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (existingStaff && existingStaff.length > 0) {
        return NextResponse.json(
          { error: 'A staff member with this email already exists' },
          { status: 409 }
        )
      }
    } catch (checkError) {
      console.error('Email check error:', checkError)
      // Continue anyway - the database will catch duplicate emails via UNIQUE constraint
    }

    // ── Insert new staff member ──────────────────────────────────────────────
    const { data: newStaff, error: insertError } = await supabase
      .from('staff')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address?.trim() || null,
        position: resolvedPosition.trim(),
        department: resolvedDept.trim(),
        employee_id: resolvedEmployeeId,
        date_of_birth: dateOfBirth || null,
        hire_date: resolvedHireDate,
        salary: salary ? parseFloat(salary) : null,
        emergency_contact_name: resolvedECName?.trim() || null,
        emergency_contact_phone: resolvedECPhone?.trim() || null,
        status: 'active',
      })
      .select()
      .single()

    if (insertError) {
      console.error('POST /api/daycare/staff insert error:', insertError)
      
      // Check if it's a duplicate email error from database
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'A staff member with this email already exists' },
          { status: 409 }
        )
      }
      
      return NextResponse.json({ error: 'Failed to create staff member: ' + insertError.message }, { status: 500 })
    }

    return NextResponse.json({ staff: newStaff }, { status: 201 })
  } catch (error) {
    console.error('POST /api/daycare/staff error:', error)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}