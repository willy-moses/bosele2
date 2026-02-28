// app/api/daycare/children/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data: children, error } = await supabase
      .from('Child')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    const processedChildren = children?.map(child => {
      let parsedMedicalInfo = null
      let registerData = null
      let emergencyContactRelationship = null

      if (child.medicalInfo) {
        try {
          const parsed = JSON.parse(child.medicalInfo)
          if (parsed.notes !== undefined) {
            parsedMedicalInfo = parsed.notes
            registerData = parsed.registerData
            emergencyContactRelationship = parsed.emergencyContactRelationship
          } else {
            parsedMedicalInfo = child.medicalInfo
          }
        } catch {
          parsedMedicalInfo = child.medicalInfo
        }
      }

      return {
        ...child,
        monthlyFee: child.monthly_fee ?? null,   // ← ADDED
        feeNotes:   child.fee_notes   ?? null,   // ← ADDED
        medicalInfo: parsedMedicalInfo,
        registerData: registerData,
        emergencyContactRelationship: emergencyContactRelationship
      }
    })

    return NextResponse.json({ children: processedChildren || [] })
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { registerData, emergencyContactRelationship, ...childData } = body

    const dob = new Date(childData.dateOfBirth)
    const age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000))

    const medicalInfoData = {
      notes: childData.medicalInfo || null,
      registerData: registerData || null,
      emergencyContactRelationship: emergencyContactRelationship || null
    }

    const { data: child, error: childError } = await supabase
      .from('Child')
      .insert([{
        firstName: childData.childFirstName,
        lastName: childData.childLastName,
        nickname: childData.nickname || null,
        dateOfBirth: childData.dateOfBirth,
        gender: childData.gender,
        age: age,
        district: registerData?.district || null,
        villageTown: registerData?.villageTown || null,
        parentFirstName: childData.parentFirstName,
        parentLastName: childData.parentLastName,
        parentEmail: childData.parentEmail,
        parentPhone: childData.parentPhone,
        address: childData.address || registerData?.postalAddress || '',
        emergencyContact: childData.emergencyContact,
        emergencyPhone: childData.emergencyPhone,
        medicalInfo: JSON.stringify(medicalInfoData),
        allergies: childData.allergies || null,
        class: childData.class || null,
        status: 'active',
      }])
      .select()
      .single()

    if (childError) throw new Error(`Failed to create child: ${childError.message}`)

    const { error: notifError } = await supabase
      .from('DaycareNotification')
      .insert([{
        type: 'child_enrolled',
        title: 'New Child Enrolled',
        message: `${childData.childFirstName} ${childData.childLastName} has been enrolled in the daycare`,
        relatedId: child.id,
        relatedType: 'child',
        isRead: false,
        targetRole: 'DAY_CARE_PRINCIPAL'
      }])

    if (notifError) console.error('Notification error:', notifError)

    return NextResponse.json({
      success: true,
      childId: child.id,
      message: 'Child enrolled successfully'
    })

  } catch (error) {
    console.error('Error enrolling child:', error)
    return NextResponse.json({ error: error.message || 'Failed to enroll child' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, registerData, emergencyContactRelationship, ...childData } = body

    if (!id) return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })

    let age = undefined
    if (childData.dateOfBirth) {
      const dob = new Date(childData.dateOfBirth)
      age = Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000))
    }

    const medicalInfoData = {
      notes: childData.medicalInfo || null,
      registerData: registerData || null,
      emergencyContactRelationship: emergencyContactRelationship || null
    }

    const updateData = {
      firstName: childData.childFirstName,
      lastName: childData.childLastName,
      nickname: childData.nickname || null,
      dateOfBirth: childData.dateOfBirth,
      gender: childData.gender,
      age: age,
      district: registerData?.district || childData.district || null,
      villageTown: registerData?.villageTown || childData.villageTown || null,
      parentFirstName: childData.parentFirstName,
      parentLastName: childData.parentLastName,
      parentEmail: childData.parentEmail,
      parentPhone: childData.parentPhone,
      address: childData.address || registerData?.postalAddress || '',
      emergencyContact: childData.emergencyContact,
      emergencyPhone: childData.emergencyPhone,
      medicalInfo: JSON.stringify(medicalInfoData),
      allergies: childData.allergies || null,
      class: childData.class || null,
      status: childData.status || 'active',
    }

    const { data: child, error: updateError } = await supabase
      .from('Child')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(`Failed to update child: ${updateError.message}`)

    return NextResponse.json({ success: true, child, message: 'Child updated successfully' })

  } catch (error) {
    console.error('Error updating child:', error)
    return NextResponse.json({ error: error.message || 'Failed to update child' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })

    const { data: child } = await supabase
      .from('Child')
      .select('firstName, lastName')
      .eq('id', id)
      .single()

    const { error: deleteError } = await supabase
      .from('Child')
      .delete()
      .eq('id', id)

    if (deleteError) throw new Error(`Failed to delete child: ${deleteError.message}`)

    if (child) {
      await supabase
        .from('DaycareNotification')
        .insert([{
          type: 'child_removed',
          title: 'Child Record Removed',
          message: `${child.firstName} ${child.lastName}'s record has been removed from the system`,
          relatedId: id,
          relatedType: 'child',
          isRead: false,
          targetRole: 'DAY_CARE_PRINCIPAL'
        }])
    }

    return NextResponse.json({ success: true, message: 'Child deleted successfully' })

  } catch (error) {
    console.error('Error deleting child:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete child' }, { status: 500 })
  }
}