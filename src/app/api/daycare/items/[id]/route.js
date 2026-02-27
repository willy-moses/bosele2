// ========================================
// FILE: app/api/daycare/items/[id]/route.js
// PURPOSE: PUT update, DELETE — with categories support
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// PUT /api/daycare/items/:id
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await request.json();
    const {
      itemName, categories, serialNumber, quantity,
      condition, status, assignedTo, location,
      purchaseDate, purchasePrice, supplier,
      warrantyExpiry, notes,
    } = body;

    if (!itemName?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      );
    }

    // Duplicate serial check (exclude self)
    if (serialNumber && serialNumber.trim() !== '') {
      const { data: existing } = await supabaseAdmin
        .from('daycare_items')
        .select('id, item_name, item_number')
        .eq('serial_number', serialNumber.trim())
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: `Serial number "${serialNumber.trim()}" is already registered to ${existing.item_name} (DC-${String(existing.item_number).padStart(4, '0')}).`,
            duplicate: true,
          },
          { status: 409 }
        );
      }
    }

    // NOTE: never update item_number — GENERATED ALWAYS AS IDENTITY
    const { data, error } = await supabaseAdmin
      .from('daycare_items')
      .update({
        item_name:       itemName.trim(),
        categories:      categories      || [],
        serial_number:   serialNumber    || null,
        quantity:        quantity        ?? 1,
        condition,
        status,
        assigned_to:     assignedTo      || null,
        location:        location        || null,
        purchase_date:   purchaseDate    || null,
        purchase_price:  purchasePrice   ? parseFloat(purchasePrice) : null,
        supplier:        supplier        || null,
        warranty_expiry: warrantyExpiry  || null,
        notes:           notes           || null,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating record:', error);
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/daycare/items/:id
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const { error } = await supabaseAdmin.from('daycare_items').delete().eq('id', id);

    if (error) {
      console.error('❌ Error deleting record:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}