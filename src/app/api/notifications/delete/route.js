import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { supabaseAdmin } from '@/lib/supabase'


export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reference_id, reference_type } = await request.json()

    console.log('🗑️ DELETE /api/notifications/delete called')
    console.log('📋 Request params:', { 
      reference_id, 
      reference_type,
      reference_id_type: typeof reference_id 
    })

    // STRATEGY 1: Get ALL notifications for this type first
    const { data: allNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('reference_type', reference_type)

    if (fetchError) {
      console.error('❌ Error fetching notifications:', fetchError)
      throw fetchError
    }

    console.log('📋 All notifications for type "' + reference_type + '":', allNotifications)

    // STRATEGY 2: Find matching notifications manually (handles type mismatches)
    const matchingNotifications = allNotifications?.filter(notif => {
      const matches = String(notif.reference_id) === String(reference_id)
      console.log(`🔍 Comparing: "${notif.reference_id}" (${typeof notif.reference_id}) === "${reference_id}" (${typeof reference_id}) = ${matches}`)
      return matches
    })

    console.log('🎯 Found', matchingNotifications?.length || 0, 'matching notifications:', matchingNotifications)

    if (!matchingNotifications || matchingNotifications.length === 0) {
      console.log('⚠️ No matching notifications found to delete')
      return NextResponse.json({ 
        success: true, 
        message: 'No notifications found',
        deletedCount: 0 
      })
    }

    // STRATEGY 3: Delete by notification ID (most reliable)
    const notificationIds = matchingNotifications.map(n => n.id)
    
    console.log('🗑️ Deleting notifications with IDs:', notificationIds)

    const { data: deletedData, error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds)
      .select()

    if (deleteError) {
      console.error('❌ Error deleting notifications:', deleteError)
      throw deleteError
    }

    console.log('✅ Successfully deleted', deletedData?.length || 0, 'notification(s)')
    console.log('✅ Deleted notifications:', deletedData)

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedData?.length || 0,
      deletedNotifications: deletedData
    })
  } catch (error) {
    console.error('❌ Error in DELETE /api/notifications/delete:', error)
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 })
  }
}
