// File: src/app/api/daycare/registrations/[id]/route.js

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body = await request.json()

    // ✅ Update the correct table
    const updated = await prisma.registration.update({
      where: { id },
      data: { 
        status: body.status,
        updated_at: new Date()
      }
    })

    return Response.json({ success: true, registration: updated })
  } catch (error) {
    console.error('❌ PATCH error:', error)
    return Response.json({ error: 'Failed to update registration' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    // ✅ Delete from correct table
    await prisma.registration.delete({
      where: { id }
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('❌ DELETE error:', error)
    return Response.json({ error: 'Failed to delete registration' }, { status: 500 })
  }
}