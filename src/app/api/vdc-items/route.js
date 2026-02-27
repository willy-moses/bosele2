// app/api/vdc-items/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET /api/vdc-items
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('vdc_items')
      .select('*')
      .order('item_number', { ascending: true })

    if (error) throw error
    return NextResponse.json({ items: data })
  } catch (error) {
    console.error('GET /api/vdc-items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/vdc-items
export async function POST(request) {
  try {
    const {
      item_name, category, serial_number, quantity,
      condition, status, assigned_to, location,
      purchase_date, purchase_price, supplier,
      warranty_expiry, notes,
    } = await request.json()

    if (!item_name?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: 'item_name and category are required' },
        { status: 400 }
      )
    }

    // NOTE: do NOT include item_number — it is GENERATED ALWAYS AS IDENTITY
    const { data, error } = await supabase
      .from('vdc_items')
      .insert([{
        item_name:      item_name.trim(),
        category,
        serial_number:  serial_number  || null,
        quantity:       quantity        ?? 1,
        condition:      condition       || 'Good',
        status:         status          || 'Available',
        assigned_to:    assigned_to     || null,
        location:       location        || null,
        purchase_date:  purchase_date   || null,
        purchase_price: purchase_price  ? parseFloat(purchase_price) : null,
        supplier:       supplier        || null,
        warranty_expiry:warranty_expiry || null,
        notes:          notes           || null,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/vdc-items:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}