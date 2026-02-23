// ========================================
// FILE: app/api/elderly-schoolers/[id]/route.js
// PURPOSE: Individual elderly schooler operations (PUT update, DELETE)
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// PUT - Update elderly schooler
export async function PUT(request, { params }) {
  try {
    console.log('🔄 PUT /api/elderly-schoolers/[id] called');

    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      age,
      grade,
      idNumber,
      villageTown,
      guardianName,
      guardianContact,
      medicalInfo,
      notes,
    } = body;

    console.log('🔄 Updating schooler:', { id, name, age, grade, idNumber, villageTown });

    if (!name || !age || !grade) {
      return NextResponse.json(
        { error: 'Name, age, and grade are required' },
        { status: 400 }
      );
    }

    // Check if schooler exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('elderly_schoolers')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      console.log('❌ Schooler not found:', id);
      return NextResponse.json({ error: 'Schooler not found' }, { status: 404 });
    }

    // ── Duplicate check on ID number (exclude the record being edited) ──
    if (idNumber && idNumber.trim() !== '') {
      const { data: duplicate, error: dupError } = await supabaseAdmin
        .from('elderly_schoolers')
        .select('id, name, id_number')
        .eq('id_number', idNumber.trim())
        .neq('id', id)           // ← exclude current record from check
        .maybeSingle();

      if (dupError) {
        console.error('❌ Error checking duplicate ID number:', dupError);
        return NextResponse.json({ error: 'Failed to validate ID number' }, { status: 500 });
      }

      if (duplicate) {
        console.log('⚠️ Duplicate ID number found on update:', duplicate);
        return NextResponse.json(
          {
            error: `ID number "${idNumber.trim()}" is already assigned to ${duplicate.name}. Please use a different ID number.`,
            duplicate: true,
            existingRecord: { id: duplicate.id, name: duplicate.name },
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('elderly_schoolers')
      .update({
        name,
        age: parseInt(age),
        grade,
        id_number:        idNumber        || null,
        village_town:     villageTown     || null,
        guardian_name:    guardianName    || null,
        guardian_contact: guardianContact || null,
        medical_info:     medicalInfo     || null,
        notes:            notes           || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating schooler:', error);
      return NextResponse.json({ error: 'Failed to update schooler' }, { status: 500 });
    }

    console.log('✅ Schooler updated successfully:', data);

    return NextResponse.json({ schooler: data }, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete elderly schooler
export async function DELETE(request, { params }) {
  try {
    console.log('🗑️ DELETE /api/elderly-schoolers/[id] called');

    const session = await getServerSession(authOptions);

    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    console.log('🗑️ Attempting to delete schooler:', id);

    const { data: existing, error: checkError } = await supabaseAdmin
      .from('elderly_schoolers')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      console.log('❌ Schooler not found:', id);
      return NextResponse.json({ error: 'Schooler not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('elderly_schoolers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting schooler:', error);
      return NextResponse.json({ error: 'Failed to delete schooler' }, { status: 500 });
    }

    console.log('✅ Schooler deleted successfully');

    return NextResponse.json(
      { success: true, message: 'Schooler deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}