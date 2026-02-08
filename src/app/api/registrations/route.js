import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request) {
  try {
    console.log('📊 GET /api/registrations called')
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session valid:', session.user.email)

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, try the 'registrations' table (the newer one with proper structure)
    console.log('🔍 Fetching from registrations table...')
    let { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error from registrations table:', error)
      console.log('⚠️ Trying daycare_registrations table...')
      
      // Fallback to daycare_registrations table
      const result = await supabase
        .from('daycare_registrations')
        .select('*')
        .order('createdAt', { ascending: false });
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
    }

    console.log('✅ Found', data?.length || 0, 'registrations from database')
    console.log('📦 Sample data:', data?.[0]) // Log first item to see structure

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    console.log('🗑️ DELETE /api/registrations called')
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      console.log('❌ No ID provided')
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    console.log('🗑️ Attempting to delete registration:', id)

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the registration exists first
    const { data: existing, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking registration:', checkError)
    }

    if (!existing) {
      console.log('⚠️ Registration not found in registrations table, trying daycare_registrations...')
      
      // Try daycare_registrations table
      const { data: existingOld, error: checkOldError } = await supabase
        .from('daycare_registrations')
        .select('*')
        .eq('id', id)
        .single()

      if (existingOld) {
        console.log('✅ Found in daycare_registrations table')
        
        // Delete from daycare_registrations
        const { error: deleteError } = await supabase
          .from('daycare_registrations')
          .delete()
          .eq('id', id)

        if (deleteError) {
          console.error('❌ Error deleting from daycare_registrations:', deleteError)
          return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
        }

        console.log('✅ Registration deleted successfully from daycare_registrations')
        return NextResponse.json({ success: true })
      }
      
      console.log('❌ Registration not found in any table')
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    console.log('✅ Found registration in registrations table:', existing)

    // Delete from registrations table
    const { error: deleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ Error deleting registration:', deleteError)
      return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 })
    }

    console.log('✅ Registration deleted successfully from registrations table')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    console.log('🔄 PATCH /api/registrations called')
    
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status } = body

    console.log('🔄 Updating registration:', { id, status })

    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'waitlist']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check which table the registration is in
    const { data: existing, error: checkError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      console.log('⚠️ Not found in registrations, trying daycare_registrations...')
      
      // Try updating in daycare_registrations table
      const { data, error } = await supabase
        .from('daycare_registrations')
        .update({ 
          status: status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating in daycare_registrations:', error)
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
      }

      console.log('✅ Registration updated successfully in daycare_registrations')
      return NextResponse.json({ success: true, registration: data }, { status: 200 })
    }

    // Update in registrations table
    const { data, error } = await supabase
      .from('registrations')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating registration:', error)
      return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 })
    }

    console.log('✅ Registration updated successfully in registrations table:', data)

    return NextResponse.json({ 
      success: true, 
      registration: data 
    }, { status: 200 })
  } catch (error) {
    console.error('❌ Error in PATCH /api/registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}