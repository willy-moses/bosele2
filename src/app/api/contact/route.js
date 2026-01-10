// src/app/api/contact/route.js
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { adminDb } from '../../../lib/firebase-admin.js'

export async function POST(request) {
  try {
    const body = await request.json()

    const { firstName, lastName, email, phone, subject, message } = body

    // Validate required fields
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

    // Save to Firestore
    const docRef = await adminDb.collection('contact-messages').add({
      firstName,
      lastName,
      email,
      phone: phone || '',
      subject,
      message,
      createdAt: new Date(),
      status: 'unread',
    })

    return NextResponse.json(
      { success: true, id: docRef.id, message: 'Message sent successfully' },
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