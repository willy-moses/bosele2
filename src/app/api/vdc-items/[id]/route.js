// app/api/vdc-items/[id]/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// PUT /api/vdc-items/:id
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const {
      item_name, category, serial_number, quantity,
      condition, status, assigned_to, location,
      purchase_date, purchase_price, supplier,
      warranty_expiry, notes,
    } = await request.json()

    // NOTE: never update item_number — it is GENERATED ALWAYS AS IDENTITY
    const { data, error } = await supabase
      .from('vdc_items')
      .update({
        item_name:       item_name?.trim(),
        category,
        serial_number:   serial_number   || null,
        quantity:        quantity         ?? 1,
        condition,
        status,
        assigned_to:     assigned_to     || null,
        location:        location        || null,
        purchase_date:   purchase_date   || null,
        purchase_price:  purchase_price  ? parseFloat(purchase_price) : null,
        supplier:        supplier        || null,
        warranty_expiry: warranty_expiry || null,
        notes:           notes           || null,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('PUT /api/vdc-items/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/vdc-items/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const { error } = await supabase.from('vdc_items').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/vdc-items/[id]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}