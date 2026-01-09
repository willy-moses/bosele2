import { NextResponse } from 'next/server'
import { adminDb } from '../../../lib/firebase-admin.js'

export async function POST(req) {
  try {
    const data = await req.json()

    // Validate that data is an object and not empty
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty data' },
        { status: 400 }
      )
    }

    // Add to Firestore
    const docRef = await adminDb.collection("submissions").add({
      ...data,
      createdAt: new Date(),
      status: 'pending',
    })

    return NextResponse.json({ 
      success: true, 
      id: docRef.id 
    }, { status: 201 })

  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    )
  }
}