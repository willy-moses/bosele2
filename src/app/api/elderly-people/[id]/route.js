// ========================================
// FILE: app/api/elderly-people/[id]/route.js
// PURPOSE: PUT update, DELETE individual elderly person record
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      firstName, lastName, idNumber, dateOfBirth, age, gender,
      villageTown, district, address, phone,
      nextOfKinName, nextOfKinPhone, nextOfKinRelationship,
      medicalInfo, notes,
    } = body;

    if (!firstName || !lastName || !villageTown) {
      return NextResponse.json(
        { error: 'First name, last name, and village are required' },
        { status: 400 }
      );
    }

    // Check exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('elderly_people')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // ── Duplicate ID check (exclude self) ─────────────────────────
    if (idNumber && idNumber.trim() !== '') {
      const { data: duplicate } = await supabaseAdmin
        .from('elderly_people')
        .select('id, first_name, last_name')
        .eq('id_number', idNumber.trim())
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          {
            error: `ID number "${idNumber.trim()}" is already assigned to ${duplicate.first_name} ${duplicate.last_name}.`,
            duplicate: true,
            existingRecord: { id: duplicate.id, name: `${duplicate.first_name} ${duplicate.last_name}` },
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('elderly_people')
      .update({
        first_name:               firstName,
        last_name:                lastName,
        id_number:                idNumber              || null,
        date_of_birth:            dateOfBirth           || null,
        age:                      age ? parseInt(age)   : null,
        gender:                   gender                || null,
        village_town:             villageTown,
        district:                 district              || null,
        address:                  address               || null,
        phone:                    phone                 || null,
        next_of_kin_name:         nextOfKinName         || null,
        next_of_kin_phone:        nextOfKinPhone        || null,
        next_of_kin_relationship: nextOfKinRelationship || null,
        medical_info:             medicalInfo           || null,
        notes:                    notes                 || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating record:', error);
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    return NextResponse.json({ person: data }, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const { data: existing, error: checkError } = await supabaseAdmin
      .from('elderly_people')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from('elderly_people')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting record:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}