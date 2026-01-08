// src/app/api/contact/route.js

import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

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
      { success: true, id: docRef.id },
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
