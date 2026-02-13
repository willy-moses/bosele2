import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '@/lib/supabase'


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference_id, reference_type } = await request.json()

    // Mark notifications as read based on reference
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('reference_id', reference_id)
      .eq('reference_type', reference_type)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}