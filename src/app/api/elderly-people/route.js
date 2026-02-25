// ========================================
// FILE: app/api/elderly-people/route.js
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
      .from('elderly_people')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    const people = (data || []).map(p => ({
      id:                    p.id,
      firstName:             p.first_name,
      lastName:              p.last_name,
      idNumber:              p.id_number,
      dateOfBirth:           p.date_of_birth,
      age:                   p.age,
      gender:                p.gender,
      categories:            p.categories || [],        // ← new
      villageTown:           p.village_town,
      district:              p.district,
      address:               p.address,
      phone:                 p.phone,
      nextOfKinName:         p.next_of_kin_name,
      nextOfKinPhone:        p.next_of_kin_phone,
      nextOfKinRelationship: p.next_of_kin_relationship,
      medicalInfo:           p.medical_info,
      notes:                 p.notes,
      createdAt:             p.created_at,
      updatedAt:             p.updated_at,
    }));

    return NextResponse.json({ people }, { status: 200 });
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
      firstName, lastName, idNumber, dateOfBirth, age, gender,
      categories,                                        // ← new
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

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      );
    }

    // Duplicate check on ID number
    if (idNumber && idNumber.trim() !== '') {
      const { data: existing } = await supabaseAdmin
        .from('elderly_people')
        .select('id, first_name, last_name')
        .eq('id_number', idNumber.trim())
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: `ID number "${idNumber.trim()}" is already registered to ${existing.first_name} ${existing.last_name}.`,
            duplicate: true,
            existingRecord: { id: existing.id, name: `${existing.first_name} ${existing.last_name}` },
          },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('elderly_people')
      .insert([{
        first_name:               firstName,
        last_name:                lastName,
        id_number:                idNumber              || null,
        date_of_birth:            dateOfBirth           || null,
        age:                      age ? parseInt(age)   : null,
        gender:                   gender                || null,
        categories:               categories            || [],   // ← new
        village_town:             villageTown,
        district:                 district              || null,
        address:                  address               || null,
        phone:                    phone                 || null,
        next_of_kin_name:         nextOfKinName         || null,
        next_of_kin_phone:        nextOfKinPhone        || null,
        next_of_kin_relationship: nextOfKinRelationship || null,
        medical_info:             medicalInfo           || null,
        notes:                    notes                 || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating record:', error);
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }

    return NextResponse.json({ person: data }, { status: 201 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}