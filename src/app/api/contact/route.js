export const runtime = 'edge'; // or 'nodejs'
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function POST(request) {
  try {
    const body = await request.json()

    const { firstName, lastName, email, phone, subject, message } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message, status)
      VALUES (${firstName}, ${lastName}, ${email}, ${phone || ''}, ${subject}, ${message}, 'unread')
      RETURNING id
    `

    return NextResponse.json(
      { success: true, id: result.rows[0].id, message: 'Message sent successfully' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}