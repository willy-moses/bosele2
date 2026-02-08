import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('👤 Session:', session)
    console.log('👤 User role:', session?.user?.role)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (case-insensitive)
    const isAdmin = session.user.role?.toUpperCase() === 'ADMIN'
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 })
    }

    const supabase = getSupabaseAdmin()
    
    const { data: users, error } = await supabase
      .from('staff_users')
      .select('id, name, email, role, department, status, lastLogin, createdAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('❌ Error fetching users:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to fetch users' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      users: users || [] 
    })
  } catch (error) {
    console.error('❌ Error in GET /api/users:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (case-insensitive)
    const isAdmin = session.user.role?.toUpperCase() === 'ADMIN'
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 })
    }

    const { name, email, role, department, password } = await request.json()

    // Validation
    if (!name || !email || !password || !department) {
      return NextResponse.json({ 
        success: false,
        error: 'All fields are required' 
      }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('staff_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        error: 'User with this email already exists' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user with username derived from email
    const username = email.split('@')[0]

    const { data: newUser, error } = await supabase
      .from('staff_users')
      .insert([{
        name,
        email,
        username,
        password: hashedPassword,
        role: role || 'VIEWER',
        department,
        status: 'active'
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating user:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create user' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: newUser 
    })
  } catch (error) {
    console.error('❌ Error in POST /api/users:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}

// PATCH - Update user
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (case-insensitive)
    const isAdmin = session.user.role?.toUpperCase() === 'ADMIN'
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 })
    }

    const { userId, ...updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'User ID is required' 
      }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: updatedUser, error } = await supabase
      .from('staff_users')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to update user' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      user: updatedUser 
    })
  } catch (error) {
    console.error('❌ Error in PATCH /api/users:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (case-insensitive)
    const isAdmin = session.user.role?.toUpperCase() === 'ADMIN'
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'User ID is required' 
      }, { status: 400 })
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ 
        success: false,
        error: 'You cannot delete your own account' 
      }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('staff_users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('❌ Error deleting user:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to delete user' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true 
    })
  } catch (error) {
    console.error('❌ Error in DELETE /api/users:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}