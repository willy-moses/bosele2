// src/app/api/notifications/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'


// GET - Fetch notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    return NextResponse.json({ 
      success: true, 
      notifications,
      unreadCount 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Mark notification as read
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all as read
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString(),
          read_by: session.user.id 
        })
        .eq('is_read', false)

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to mark notifications as read' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString(),
        read_by: session.user.id 
      })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to mark notification as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, notification: data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}