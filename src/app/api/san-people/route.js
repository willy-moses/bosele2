// app/api/san-people/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Numeric fields — empty strings must become null, not ""
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
  // Strip empty strings from date fields too
  if (clean.date_of_birth === '') clean.date_of_birth = null
  return clean
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const disability = searchParams.get('disability')
    const education = searchParams.get('education')
    const employment = searchParams.get('employment')
    const housing = searchParams.get('housing')
    const status = searchParams.get('status') || 'active'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let query = supabase
      .from('san_people')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,id_number.ilike.%${search}%,village_town.ilike.%${search}%`
      )
    }

    if (disability === 'true') query = query.eq('has_disability', true)
    if (education) query = query.eq('education_level', education)
    if (employment) query = query.eq('employment_status', employment)
    if (housing) query = query.eq('housing_type', housing)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, count, page, limit })
  } catch (error) {
    console.error('GET /api/san-people error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    let body = sanitizeBody(await request.json())

    // Auto-calculate age if DOB provided and age is still null
    if (body.date_of_birth && !body.age) {
      const dob = new Date(body.date_of_birth)
      const today = new Date()
      body.age = today.getFullYear() - dob.getFullYear()
    }

    const { data, error } = await supabase
      .from('san_people')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/san-people error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}