import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('📊 GET /api/daycare/notifications/count')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = session.user.role?.toUpperCase().replace(/-/g, '_')
    console.log('📊 User role:', userRole)

    let totalCount = 0
    let registrationCount = 0
    let childCount = 0
    let messageCount = 0

    // 1. Count PENDING REGISTRATIONS
    try {
      const { count, error } = await supabaseAdmin
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (error) throw error
      registrationCount = count || 0
      console.log('✅ Pending registrations:', registrationCount)
    } catch (error) {
      console.warn('⚠️ Error counting registrations:', error.message)
    }

    // 2. Count ACTIVE CHILDREN
    try {
      const { count, error } = await supabaseAdmin
        .from('children')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      childCount = count || 0
      console.log('✅ Total children:', childCount)
    } catch (error) {
      console.warn('⚠️ Error counting children:', error.message)
    }

    // 3. Count UNREAD NOTIFICATIONS (if table exists)
    try {
      const { count, error } = await supabaseAdmin
        .from('DaycareNotification')
        .select('*', { count: 'exact', head: true })
        .eq('isRead', false)

      if (error) {
        if (error.code !== '42P01') { // Ignore "table does not exist" error
          throw error
        }
      } else {
        messageCount = count || 0
        console.log('✅ Unread notifications:', messageCount)
      }
    } catch (error) {
      console.warn('⚠️ DaycareNotification table not available:', error.message)
    }

    totalCount = registrationCount + messageCount

    console.log('📊 Notification counts:', {
      total: totalCount,
      registrationCount,
      childCount,
      messageCount
    })

    return NextResponse.json({
      count: totalCount,
      registrationCount,
      childCount,
      messageCount
    })

  } catch (error) {
    console.error('❌ Error in notifications/count:', error)
    return NextResponse.json(
      { 
        count: 0,
        registrationCount: 0,
        childCount: 0,
        messageCount: 0
      },
      { status: 200 } // Return 200 with zero counts instead of error
    )
  }
}