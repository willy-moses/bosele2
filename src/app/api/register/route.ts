import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      parentName,
      childName,
      email,
      phone,
      address,
      childAge,
      startDate,
      notes
    } = body

    // Validate required fields
    if (!parentName || !childName || !email || !phone || !address || !childAge || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a unique ID
    const id = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insert registration using Supabase REST API
    const { data, error } = await supabase
      .from('daycare_registrations')
      .insert([
        {
          id,
          parentName: parentName.trim(),
          childName: childName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          childAge: childAge.trim(),
          startDate: new Date(startDate).toISOString(),
          status: 'pending',
          notes: notes?.trim() || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
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