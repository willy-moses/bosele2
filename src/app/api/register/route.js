import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase.js'

export async function POST(request) {
  try {
    const body = await request.json()

    const { parentName, childName, email, phone, address, childAge, startDate } = body

    if (!parentName || !childName || !email || !phone || !address || !childAge || !startDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          parent_name: parentName,
          child_name: childName,
          email,
          phone,
          address,
          child_age: Number(childAge),
          start_date: startDate,
          status: 'pending',
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to submit registration' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, id: data[0].id },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}