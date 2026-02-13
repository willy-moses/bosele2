import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'


const DAYCARE_ROLES = ['DAY-CARE-PRINCIPAL', 'DAY-CARE-TEACHER']

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only daycare roles should hit this endpoint
    const userRole = session.user?.role?.toUpperCase()
    if (!DAYCARE_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }


    console.log('📊 GET /api/daycare/notifications/count called')
    console.log('👤 Role:', userRole)

    // Get all unread daycare notifications
    const { data: notifications, error } = await supabase
      .from('daycare_notifications')
      .select('*')
      .eq('is_read', false)

    if (error) {
      console.error('❌ Error fetching daycare notifications:', error)
      throw error
    }

    console.log('📋 Raw daycare notifications:', notifications)

    // Count by type — adjust field names to match your actual table columns
    const messageNotifications      = notifications?.filter(n => n.parent_message_id != null) || []
    const childAlertNotifications   = notifications?.filter(n => n.child_alert_id    != null) || []

    const messageCount    = messageNotifications.length
    const childCount      = childAlertNotifications.length
    const totalCount      = notifications?.length || 0

    console.log('🔍 Message notifications:',     messageNotifications)
    console.log('🔍 Child alert notifications:', childAlertNotifications)
    console.log('✅ Daycare notification counts:', {
      total:    totalCount,
      message:  messageCount,
      child:    childCount,
    })

    // Debug helper — warn if totals don't add up as expected
    if (totalCount > 0 && messageCount === 0 && childCount === 0) {
      console.log('⚠️ Warning: Total count is', totalCount, 'but no typed notifications found')
      console.log('⚠️ Notification structure sample:', notifications[0])
    }

    return NextResponse.json({
      count:         totalCount,
      messageCount:  messageCount,
      childCount:    childCount,
      notifications: notifications,
    })
  } catch (error) {
    console.error('❌ Daycare notifications error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}