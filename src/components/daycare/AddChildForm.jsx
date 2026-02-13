'use client'
import { useState, useEffect } from 'react'
import { Baby, User, AlertCircle, Heart, CheckCircle, RefreshCw, ChevronLeft } from 'lucide-react'

const inputCls = 'w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white placeholder-gray-400 transition'
const selectCls = 'w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white transition'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHeading({ icon: Icon, label, color = 'amber' }) {
  const colors = {
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    pink:   'bg-pink-50 border-pink-200 text-pink-700',
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red:    'bg-red-50 border-red-200 text-red-700',
  }
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold mb-4 ${colors[color]}`}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  )
}

const EMPTY = {
  surname: '', firstName: '', sex: '', nickname: '', class: '',
  dobDay: '', dobMonth: '', dobYear: '',
  evidenceOfBirthdate: '', villageTown: '', district: '',
  admissionDay: '', admissionMonth: '', admissionYear: '',
  parentFirstName: '', parentLastName: '', parentEmail: '', parentPhone: '',
  residentialAddress: '', postalAddress: '',
  emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelationship: '',
  hasMedicineAllergies: 'No', medicineAllergiesDetails: '',
  hasFoodAllergies: 'No', foodAllergiesDetails: '',
  otherMedicalNotes: '',
}

export default function AddChildForm({ onSuccess, onCancel, editChild = null }) {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const isEditing = !!editChild

  // Populate form when editing
  useEffect(() => {
    if (editChild) {
      const dob = editChild.dateOfBirth ? new Date(editChild.dateOfBirth) : null
      
      // Parse allergies string
      let hasMedicineAllergies = 'No'
      let medicineAllergiesDetails = ''
      let hasFoodAllergies = 'No'
      let foodAllergiesDetails = ''
      
      if (editChild.allergies) {
        const allergies = editChild.allergies.split('; ')
        allergies.forEach(allergy => {
          if (allergy.startsWith('Medicine:')) {
            hasMedicineAllergies = 'Yes'
            medicineAllergiesDetails = allergy.replace('Medicine: ', '')
          } else if (allergy.startsWith('Food:')) {
            hasFoodAllergies = 'Yes'
            foodAllergiesDetails = allergy.replace('Food: ', '')
          }
        })
      }

      setForm({
        surname: editChild.lastName || '',
        firstName: editChild.firstName || '',
        sex: editChild.gender || '',
        nickname: editChild.nickname || '',
        class: editChild.class || '',
        dobDay: dob ? dob.getDate().toString() : '',
        dobMonth: dob ? (dob.getMonth() + 1).toString() : '',
        dobYear: dob ? dob.getFullYear().toString() : '',
        evidenceOfBirthdate: editChild.registerData?.evidenceOfBirthdate || '',
        villageTown: editChild.villageTown || '',
        district: editChild.district || '',
        admissionDay: '',
        admissionMonth: '',
        admissionYear: '',
        parentFirstName: editChild.parentFirstName || '',
        parentLastName: editChild.parentLastName || '',
        parentEmail: editChild.parentEmail || '',
        parentPhone: editChild.parentPhone || '',
        residentialAddress: editChild.address || '',
        postalAddress: editChild.registerData?.postalAddress || '',
        emergencyContactName: editChild.emergencyContact || '',
        emergencyContactPhone: editChild.emergencyPhone || '',
        emergencyContactRelationship: editChild.emergencyContactRelationship || '',
        hasMedicineAllergies,
        medicineAllergiesDetails,
        hasFoodAllergies,
        foodAllergiesDetails,
        otherMedicalNotes: editChild.medicalInfo || '',
      })
    }
  }, [editChild])

  const set = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.surname.trim())               e.surname = 'Required'
    if (!form.firstName.trim())             e.firstName = 'Required'
    if (!form.sex)                          e.sex = 'Required'
    if (!form.dobDay)                       e.dobDay = 'Required'
    if (!form.dobMonth)                     e.dobMonth = 'Required'
    if (!form.dobYear)                      e.dobYear = 'Required'
    if (!form.district.trim())              e.district = 'Required'
    if (!form.parentFirstName.trim())       e.parentFirstName = 'Required'
    if (!form.parentLastName.trim())        e.parentLastName = 'Required'
    if (!form.parentEmail.trim())           e.parentEmail = 'Required'
    if (!form.parentPhone.trim())           e.parentPhone = 'Required'
    if (!form.emergencyContactName.trim())  e.emergencyContactName = 'Required'
    if (!form.emergencyContactPhone.trim()) e.emergencyContactPhone = 'Required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const dob = `${form.dobYear}-${String(form.dobMonth).padStart(2,'0')}-${String(form.dobDay).padStart(2,'0')}`
      
      const payload = {
        childFirstName: form.firstName,
        childLastName:  form.surname,
        dateOfBirth:    dob,
        gender:         form.sex,
        class:          form.class,
        nickname:       form.nickname,
        parentFirstName: form.parentFirstName,
        parentLastName:  form.parentLastName,
        parentEmail:     form.parentEmail,
        parentPhone:     form.parentPhone,
        address:         form.residentialAddress || form.postalAddress,
        emergencyContact: form.emergencyContactName,
        emergencyPhone:   form.emergencyContactPhone,
        emergencyContactRelationship: form.emergencyContactRelationship,
        medicalInfo: form.otherMedicalNotes,
        allergies: [
          form.hasMedicineAllergies === 'Yes' ? `Medicine: ${form.medicineAllergiesDetails}` : '',
          form.hasFoodAllergies     === 'Yes' ? `Food: ${form.foodAllergiesDetails}` : '',
        ].filter(Boolean).join('; '),
        registerData: {
          evidenceOfBirthdate: form.evidenceOfBirthdate,
          villageTown: form.villageTown,
          district: form.district,
          postalAddress: form.postalAddress,
        },
      }

      if (isEditing) {
        payload.id = editChild.id
      }

      const res = await fetch('/api/daycare/children', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        window.dispatchEvent(new Event('notificationUpdate'))
        onSuccess?.()
      } else {
        const err = await res.json()
        alert(err.error || `Failed to ${isEditing ? 'update' : 'add'} child`)
      }
    } catch {
      alert('Network error — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const days   = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const currentYear = new Date().getFullYear()
  const dobYears = Array.from({ length: 10 }, (_, i) => currentYear - 8 + i).reverse()

  const err = (k) => errors[k] ? <p className="text-red-500 text-xs mt-1">{errors[k]}</p> : null

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">
              {isEditing ? 'Edit Child Information' : 'Register New Child'}
            </h2>
            <p className="text-amber-100 text-xs mt-0.5">
              {isEditing ? 'Update child details' : 'Complete the admission form'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onCancel}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">

        {/* ── 1. Child Register Info ── */}
        <div>
          <SectionHeading icon={Baby} label="Child Register Information" color="pink" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Surname" required>
              <input name="surname" value={form.surname} onChange={set} placeholder="e.g. Moeng" className={inputCls} />
              {err('surname')}
            </Field>
            <Field label="First Name(s)" required>
              <input name="firstName" value={form.firstName} onChange={set} placeholder="e.g. Naledi Kefilwe" className={inputCls} />
              {err('firstName')}
            </Field>
            <Field label="Nickname">
              <input name="nickname" value={form.nickname} onChange={set} placeholder="Optional" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Sex" required>
              <select name="sex" value={form.sex} onChange={set} className={selectCls}>
                <option value="">Select…</option>
                <option value="Male">Male (M)</option>
                <option value="Female">Female (F)</option>
              </select>
              {err('sex')}
            </Field>
            <Field label="Class / Group">
              <input name="class" value={form.class} onChange={set} placeholder="e.g. Toddler A, Pre-K" className={inputCls} />
            </Field>
          </div>

          {/* DOB */}
          <div className="bg-amber-50/60 rounded-xl border border-amber-100 p-4 mb-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Date of Birth</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Day" required>
                <select name="dobDay" value={form.dobDay} onChange={set} className={selectCls}>
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {err('dobDay')}
              </Field>
              <Field label="Month" required>
                <select name="dobMonth" value={form.dobMonth} onChange={set} className={selectCls}>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                {err('dobMonth')}
              </Field>
              <Field label="Year" required>
                <select name="dobYear" value={form.dobYear} onChange={set} className={selectCls}>
                  <option value="">Year</option>
                  {dobYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                {err('dobYear')}
              </Field>
            </div>
          </div>

          {/* Location + evidence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Field label="Evidence of Birthdate">
              <select name="evidenceOfBirthdate" value={form.evidenceOfBirthdate} onChange={set} className={selectCls}>
                <option value="">Select…</option>
                <option>Birth Certificate</option>
                <option>Passport</option>
                <option>Hospital Card</option>
                <option>Baptism Certificate</option>
                <option>Affidavit</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Village / Town">
              <input name="villageTown" value={form.villageTown} onChange={set} placeholder="e.g. Gaborone" className={inputCls} />
            </Field>
            <Field label="District" required>
              <input name="district" value={form.district} onChange={set} placeholder="e.g. Ghanzi District" className={inputCls} />
              {err('district')}
            </Field>
          </div>
        </div>

        {/* ── 2. Parent / Guardian ── */}
        <div>
          <SectionHeading icon={User} label="Parent / Guardian" color="blue" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <input name="parentFirstName" value={form.parentFirstName} onChange={set} placeholder="First name" className={inputCls} />
              {err('parentFirstName')}
            </Field>
            <Field label="Last Name" required>
              <input name="parentLastName" value={form.parentLastName} onChange={set} placeholder="Last name" className={inputCls} />
              {err('parentLastName')}
            </Field>
            <Field label="Email" required>
              <input name="parentEmail" type="email" value={form.parentEmail} onChange={set} placeholder="parent@email.com" className={inputCls} />
              {err('parentEmail')}
            </Field>
            <Field label="Cellphone" required>
              <input name="parentPhone" type="tel" value={form.parentPhone} onChange={set} placeholder="+267 7X XXX XXX" className={inputCls} />
              {err('parentPhone')}
            </Field>
            <Field label="Residential Address">
              <input name="residentialAddress" value={form.residentialAddress} onChange={set} placeholder="Street, area" className={inputCls} />
            </Field>
            <Field label="Postal Address">
              <input name="postalAddress" value={form.postalAddress} onChange={set} placeholder="P.O. Box / Bag" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* ── 3. Emergency Contact ── */}
        <div>
          <SectionHeading icon={AlertCircle} label="Emergency Contact" color="orange" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Contact Name" required>
              <input name="emergencyContactName" value={form.emergencyContactName} onChange={set} placeholder="Full name" className={inputCls} />
              {err('emergencyContactName')}
            </Field>
            <Field label="Contact Phone" required>
              <input name="emergencyContactPhone" type="tel" value={form.emergencyContactPhone} onChange={set} placeholder="+267 7X XXX XXX" className={inputCls} />
              {err('emergencyContactPhone')}
            </Field>
            <Field label="Relationship">
              <select name="emergencyContactRelationship" value={form.emergencyContactRelationship} onChange={set} className={selectCls}>
                <option value="">Select…</option>
                <option>Grandmother</option><option>Grandfather</option>
                <option>Aunt</option><option>Uncle</option>
                <option>Sibling</option><option>Family Friend</option><option>Other</option>
              </select>
            </Field>
          </div>
        </div>

        {/* ── 4. Medical ── */}
        <div>
          <SectionHeading icon={Heart} label="Medical Information" color="red" />
          <div className="space-y-4">
            {[
              { key: 'hasMedicineAllergies', detailKey: 'medicineAllergiesDetails', label: 'Any medicine allergies?', placeholder: 'Describe medicine allergies…' },
              { key: 'hasFoodAllergies',     detailKey: 'foodAllergiesDetails',     label: 'Any food allergies / sensitivities?', placeholder: 'Describe food allergies…' },
            ].map(({ key, detailKey, label, placeholder }) => (
              <div key={key} className="bg-red-50/40 rounded-xl border border-red-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <div className="flex gap-4">
                    {['No', 'Yes'].map(v => (
                      <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name={key} value={v} checked={form[key] === v} onChange={set} className="accent-amber-500" />
                        <span className="text-sm">{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {form[key] === 'Yes' && (
                  <textarea name={detailKey} value={form[detailKey]} onChange={set}
                    rows={2} placeholder={placeholder} className={inputCls + ' resize-none'} />
                )}
              </div>
            ))}
            <Field label="Other Medical Notes / Conditions">
              <textarea name="otherMedicalNotes" value={form.otherMedicalNotes} onChange={set}
                rows={3} placeholder="Medications, chronic conditions, special needs…"
                className={inputCls + ' resize-none'} />
            </Field>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pt-4 border-t border-amber-100">
          {!isEditing && (
            <button type="button" onClick={() => setForm(EMPTY)}
              className="px-5 py-2.5 border border-amber-200 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-50 transition">
              Clear form
            </button>
          )}
          <div className={`flex gap-3 ${isEditing ? 'ml-auto' : ''}`}>
            <button type="button" onClick={onCancel}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold shadow hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50">
              {submitting ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> {isEditing ? 'Updating…' : 'Saving…'}</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> {isEditing ? 'Update Child' : 'Register Child'}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}