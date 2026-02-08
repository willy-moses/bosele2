import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('📊 GET /api/notifications/count called')

    // Get all unread notifications
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)

    if (error) {
      console.error('❌ Error fetching notifications:', error)
      throw error
    }

    console.log('📋 Raw notifications:', notifications)

    // Count by type with detailed logging
    const contactNotifications = notifications?.filter(n => n.contact_message_id != null) || []
    const registrationNotifications = notifications?.filter(n => n.registration_id != null) || []
    
    const contactCount = contactNotifications.length
    const registrationCount = registrationNotifications.length
    const totalCount = notifications?.length || 0

    console.log('🔍 Contact notifications:', contactNotifications)
    console.log('🔍 Registration notifications:', registrationNotifications)
    console.log('✅ Notification counts:', { 
      total: totalCount,
      contact: contactCount, 
      registration: registrationCount 
    })

    // Additional debug: Check if notifications exist but with different field names
    if (totalCount > 0 && registrationCount === 0) {
      console.log('⚠️ Warning: Total count is', totalCount, 'but no registration notifications found')
      console.log('⚠️ Notification structure sample:', notifications[0])
    }

    return NextResponse.json({ 
      count: totalCount,
      contactCount: contactCount,
      registrationCount: registrationCount,
      notifications: notifications
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}