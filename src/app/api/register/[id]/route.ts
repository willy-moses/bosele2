import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { AuthOptions } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions as AuthOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { status } = await request.json()
    const { id } = await params

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}