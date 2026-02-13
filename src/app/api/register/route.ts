import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      parent_name,
      child_name,
      email,
      phone,
      address,
      child_age,
      start_date,
      additional_data
    } = body

    // Validate required fields
    if (!parent_name || !child_name || !email || !phone || !address || child_age === undefined || !start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number (basic check)
    if (phone.trim().length < 7) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Validate child age
    if (child_age < 0 || child_age > 10) {
      return NextResponse.json(
        { error: 'Child age must be between 0 and 10 years' },
        { status: 400 }
      )
    }

    // Parse and validate additional_data if it's a string
    let parsedAdditionalData = null
    if (additional_data) {
      try {
        parsedAdditionalData = typeof additional_data === 'string' 
          ? JSON.parse(additional_data) 
          : additional_data
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid additional data format' },
          { status: 400 }
        )
      }
    }

    // Use public client for form submission (respects RLS)
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          parent_name: parent_name.trim(),
          child_name: child_name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          child_age: child_age,
          start_date: start_date,
          status: 'pending',
          additional_data: parsedAdditionalData
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save registration', details: error.message },
        { status: 500 }
      )
    }

    // Create notification for new registration
    try {
      await supabase
        .from('notifications')
        .insert([
          {
            type: 'registration',
            title: 'New Daycare Registration',
            message: `New registration received for ${child_name} (parent: ${parent_name})`,
            reference_id: data[0].id,
            reference_type: 'registration',
            priority: 'high',
            metadata: {
              child_name: child_name.trim(),
              parent_name: parent_name.trim(),
              email: email.trim().toLowerCase(),
              child_age: child_age
            }
          }
        ])
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json(
      { 
        message: 'Registration submitted successfully!',
        registration: data[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your registration' },
      { status: 500 }
    )
  }
}

// GET endpoint with authentication (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use admin client to bypass RLS
    let query = supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        registrations: data,
        total: count,
        limit,
        offset
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching registrations' },
      { status: 500 }
    )
  }
}