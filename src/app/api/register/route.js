export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { adminDb } from '../../../lib/firebase-admin.js'

export async function POST(request) {
  try {
    // Handle empty body during build
    let body
    try {
      const text = await request.text()
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { error: 'Request body is empty' },
          { status: 400 }
        )
      }
      body = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    const { parentName, childName, email, phone, address, childAge, startDate } = body

    // Validate all required fields
    if (!parentName || !childName || !email || !phone || !address || !childAge || !startDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Save to Firestore
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

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}