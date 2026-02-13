import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all registrations
export async function GET() {
  try {
    console.log('📊 GET /api/registrations called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Session valid:', session.user.email)
    console.log('🔍 Fetching from registrations table...')

    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Found', registrations.length, 'registrations from database')
    
    if (registrations.length > 0) {
      console.log('📦 Sample data:', registrations[0])
    }

    return NextResponse.json(registrations)

  } catch (error) {
    console.error('❌ Error fetching registrations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

// PATCH - Update registration status
export async function PATCH(request) {
  try {
    console.log('🔄 PATCH /api/registrations called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body
    
    console.log('🔄 Updating registration:', { id, status })

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'waitlist']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update using Supabase
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    console.log('✅ Registration updated successfully:', data[0])

    return NextResponse.json({ 
      success: true, 
      message: 'Registration updated successfully',
      registration: data[0]
    })

  } catch (error) {
    console.error('❌ Error updating registration:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to update registration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a registration
export async function DELETE(request) {
  try {
    console.log('🗑️ DELETE /api/registrations called')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    console.log('🗑️ Deleting registration:', id)

    if (!id) {
      return NextResponse.json(
        { error: 'Missing registration id' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      )
    }

    console.log('✅ Registration deleted successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Registration deleted successfully' 
    })

  } catch (error) {
    console.error('❌ Error deleting registration:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete registration' },
      { status: 500 }
    )
  }
}