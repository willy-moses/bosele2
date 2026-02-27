// ========================================
// FILE: app/api/daycare/items/route.js
// PURPOSE: GET all records, POST new record — with categories support
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('daycare_items')
      .select('*')
      .order('item_number', { ascending: true });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    const items = (data || []).map(i => ({
      id:             i.id,
      itemNumber:     i.item_number,
      itemName:       i.item_name,
      categories:     i.categories    || [],
      serialNumber:   i.serial_number,
      quantity:       i.quantity,
      condition:      i.condition,
      status:         i.status,
      assignedTo:     i.assigned_to,
      location:       i.location,
      purchaseDate:   i.purchase_date,
      purchasePrice:  i.purchase_price,
      supplier:       i.supplier,
      warrantyExpiry: i.warranty_expiry,
      notes:          i.notes,
      registeredBy:   i.registered_by,
      createdAt:      i.created_at,
      updatedAt:      i.updated_at,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const {
      itemName, categories, serialNumber, quantity,
      condition, status, assignedTo, location,
      purchaseDate, purchasePrice, supplier,
      warrantyExpiry, notes,
    } = body;

    // ── Validation ────────────────────────────────────────────────
    if (!itemName?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      );
    }

    // ── Duplicate serial number check ─────────────────────────────
    if (serialNumber && serialNumber.trim() !== '') {
      const { data: existing } = await supabaseAdmin
        .from('daycare_items')
        .select('id, item_name, item_number')
        .eq('serial_number', serialNumber.trim())
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: `Serial number "${serialNumber.trim()}" is already registered to ${existing.item_name} (DC-${String(existing.item_number).padStart(4, '0')}).`,
            duplicate: true,
            existingRecord: { id: existing.id, name: existing.item_name },
          },
          { status: 409 }
        );
      }
    }

    // NOTE: do NOT include item_number — GENERATED ALWAYS AS IDENTITY
    const { data, error } = await supabaseAdmin
      .from('daycare_items')
      .insert([{
        item_name:       itemName.trim(),
        categories:      categories      || [],
        serial_number:   serialNumber    || null,
        quantity:        quantity        ?? 1,
        condition:       condition       || 'Good',
        status:          status          || 'Available',
        assigned_to:     assignedTo      || null,
        location:        location        || null,
        purchase_date:   purchaseDate    || null,
        purchase_price:  purchasePrice   ? parseFloat(purchasePrice) : null,
        supplier:        supplier        || null,
        warranty_expiry: warrantyExpiry  || null,
        notes:           notes           || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating record:', error);
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}