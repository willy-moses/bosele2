import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentName, childName, email, phone, address, childAge, startDate } = body

    if (!parentName || !childName || !email || !phone || !address || !childAge || !startDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const age = parseInt(childAge)
    if (isNaN(age) || age < 0 || age > 10) {
      return NextResponse.json(
        { error: 'Child age must be between 0 and 10 years' },
        { status: 400 }
      )
    }

    const registration = await prisma.daycareRegistration.create({
      data: {
        parentName: parentName.trim(),
        childName: childName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        childAge: age,
        startDate: new Date(startDate),
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        id: registration.id,
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit application. Please try again later.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const registrations = await prisma.daycareRegistration.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        parentName: true,
        childName: true,
        email: true,
        phone: true,
        childAge: true,
        startDate: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json(registrations, { status: 200 })

  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}