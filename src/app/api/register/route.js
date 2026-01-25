// app/api/register/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Install: npm install @supabase/supabase-js

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side
)

export async function POST(request) {
  try {
    const formData = await request.json()
    
    // Validate required fields
    const requiredFields = ['parentName', 'childName', 'email', 'phone', 'address', 'childAge', 'startDate']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          parent_name: formData.parentName,
          child_name: formData.childName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          child_age: parseInt(formData.childAge),
          start_date: formData.startDate,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      data: data[0]
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process registration. Please try again.' },
      { status: 500 }
    )
  }
}