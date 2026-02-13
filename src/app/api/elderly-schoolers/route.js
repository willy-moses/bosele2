// ========================================
// FILE: app/api/elderly-schoolers/route.js
// PURPOSE: Main API route for elderly schoolers (GET all, POST new)
// ========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all elderly schoolers
export async function GET(request) {
  try {
    console.log('📊 GET /api/elderly-schoolers called');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session valid:', session.user.email);

    console.log('🔍 Fetching from elderly_schoolers table...');
    const { data, error } = await supabaseAdmin
      .from('elderly_schoolers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch schoolers' }, { status: 500 });
    }

    console.log('✅ Found', data?.length || 0, 'elderly schoolers from database');
    console.log('📦 Sample data:', data?.[0]);

    return NextResponse.json({ schoolers: data || [] }, { status: 200 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new elderly schooler
export async function POST(request) {
  try {
    console.log('➕ POST /api/elderly-schoolers called');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, age, grade, guardianName, guardianContact, medicalInfo, notes } = body;

    console.log('📝 Creating new schooler:', { name, age, grade });

    if (!name || !age || !grade) {
      return NextResponse.json(
        { error: 'Name, age, and grade are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('elderly_schoolers')
      .insert([
        {
          name,
          age: parseInt(age),
          grade,
          guardian_name: guardianName || null,
          guardian_contact: guardianContact || null,
          medical_info: medicalInfo || null,
          notes: notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating schooler:', error);
      return NextResponse.json({ error: 'Failed to create schooler' }, { status: 500 });
    }

    console.log('✅ Schooler created successfully:', data);

    return NextResponse.json({ schooler: data }, { status: 201 });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}