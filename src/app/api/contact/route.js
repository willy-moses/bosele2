// src/app/api/contact/route.js

import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

    const docRef = await addDoc(collection(db, 'contact-messages'), {
      firstName,
      lastName,
      email,
      phone: phone || '',
      subject,
      message,
      createdAt: serverTimestamp(),
      status: 'unread'
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        id: docRef.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message: ' + error.message },
      { status: 500 }
    )
  }
}