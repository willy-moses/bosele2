import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request) {
  try {
    // Allow public access - no session required
    // This lets visitors see there are unread messages before logging in
    
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    return NextResponse.json({ count: count || 0 }, { status: 200 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}