// src/app/api/register/route.js

import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

    const docRef = await addDoc(collection(db, 'registrations'), {
      parentName,
      childName,
      email,
      phone,
      address,
      childAge: parseInt(childAge),
      startDate,
      createdAt: serverTimestamp(),
      status: 'pending'
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration submitted successfully',
        id: docRef.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to submit registration: ' + error.message },
      { status: 500 }
    )
  }
}