// app/api/casual-labour/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('casual_labour_waitlist')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ workers: data || [] })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { fullName, idNumber, gender, age, villageTown, phone, skills, notes } = body

    if (!fullName) return NextResponse.json({ error: 'Full name is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('casual_labour_waitlist')
      .insert([{
        full_name:     fullName,
        id_number:     idNumber    || null,
        gender:        gender      || null,
        age:           age ? parseInt(age) : null,
        village_town:  villageTown || null,
        phone:         phone       || null,
        skills:        skills      || null,
        notes:         notes       || null,
        status:        'waiting',
        registered_by: session?.user?.name || session?.user?.email || null,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, worker: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, fullName, idNumber, gender, age, villageTown, phone, skills, status, notes } = body

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('casual_labour_waitlist')
      .update({
        full_name:    fullName    || null,
        id_number:    idNumber    || null,
        gender:       gender      || null,
        age:          age ? parseInt(age) : null,
        village_town: villageTown || null,
        phone:        phone       || null,
        skills:       skills      || null,
        status:       status      || 'waiting',
        notes:        notes       || null,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, worker: data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const { error } = await supabase
      .from('casual_labour_waitlist')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}