import { NextResponse } from 'next/server'
import { adminDb } from '../../../lib/firebase-admin.js'

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

    const docRef = await adminDb.collection('registrations').add({
      parentName,
      childName,
      email,
      phone,
      address,
      childAge: Number(childAge),
      startDate,
      createdAt: new Date(),
      status: 'pending',
    })

    return NextResponse.json(
      { success: true, id: docRef.id },
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