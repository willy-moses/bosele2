import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export async function GET(request) {
  try {
    console.log('📊 GET /api/contact called')
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Session valid:', session.user.email)

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    console.log('✅ Found', data?.length || 0, 'messages')

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    console.log('📨 POST /api/contact called')
    
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message } = body

    console.log('📧 Contact form submission:', { firstName, lastName, email, subject })

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Insert message into database
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone || null,
          subject: subject,
          message: message,
          status: 'unread'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ Error saving message:', error)
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    console.log('✅ Message saved successfully:', data.id)

    // ✅ Notification is automatically created by database trigger
    // No need to manually create notification here

    return NextResponse.json(
      { success: true, message: 'Message sent successfully', id: data.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error in POST /api/contact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    console.log('🗑️ DELETE /api/contact called')
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting message:', id)

    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting message:', error)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    console.log('✅ Message deleted successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating message:', error)
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: data })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}