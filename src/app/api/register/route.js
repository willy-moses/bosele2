import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

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

    const result = await sql`
      INSERT INTO registrations (parent_name, child_name, email, phone, address, child_age, start_date, status)
      VALUES (${parentName}, ${childName}, ${email}, ${phone}, ${address}, ${Number(childAge)}, ${startDate}, 'pending')
      RETURNING id
    `

    return NextResponse.json(
      { success: true, id: result.rows[0].id },
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