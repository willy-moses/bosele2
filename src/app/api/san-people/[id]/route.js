// app/api/san-people/[id]/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const NUMERIC_FIELDS = ['age', 'household_size', 'number_of_rooms', 'land_size_hectares']

function sanitizeBody(body) {
  const clean = { ...body }
  for (const field of NUMERIC_FIELDS) {
    if (clean[field] === '' || clean[field] === undefined) {
      clean[field] = null
    } else if (clean[field] !== null) {
      clean[field] = Number(clean[field])
    }
  }
  if (clean.date_of_birth === '') clean.date_of_birth = null
  return clean
}

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('san_people')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    let body = sanitizeBody(await request.json())

    if (body.date_of_birth && !body.age) {
      const dob = new Date(body.date_of_birth)
      const today = new Date()
      body.age = today.getFullYear() - dob.getFullYear()
    }

    body.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('san_people')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await supabase
      .from('san_people')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}