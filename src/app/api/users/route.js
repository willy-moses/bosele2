import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // ✅ Changed from '../auth/[...nextauth]/route'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey)

// GET - Fetch all users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { data: users, error } = await supabase
      .from('staff_users')
      .select('id, name, email, role, department, status, lastLogin, createdAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, password, role, department } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('staff_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error } = await supabase
      .from('staff_users')
      .insert([
        {
          name,
          username: email.split('@')[0], // Generate username from email
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role || 'STAFF',
          department: department || null,
          status: 'active',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update user role
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role, status, department } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updates = {}
    if (role) {
      if (!['STAFF', 'ADMIN', 'viewer', 'editor', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, error: 'Invalid role' },
          { status: 400 }
        )
      }
      updates.role = role
    }
    if (status) updates.status = status
    if (department !== undefined) updates.department = department

    const { data, error } = await supabase
      .from('staff_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, user: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('staff_users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}