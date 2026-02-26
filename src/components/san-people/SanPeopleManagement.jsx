'use client'
import { useState, useEffect, useCallback } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const EDUCATION_LEVELS = [
  { value: 'none', label: 'No Formal Education' },
  { value: 'primary', label: 'Primary (Std 1–7)' },
  { value: 'junior_secondary', label: 'Junior Secondary (Form 1–3)' },
  { value: 'senior_secondary', label: 'Senior Secondary (Form 4–5)' },
  { value: 'vocational', label: 'Vocational / Technical' },
  { value: 'tertiary', label: 'Tertiary / University' },
]

const EMPLOYMENT_STATUSES = [
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'employed_formal', label: 'Formally Employed' },
  { value: 'employed_informal', label: 'Informally Employed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
]

const HOUSING_TYPES = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'modern', label: 'Modern / Brick' },
  { value: 'shack', label: 'Shack / Makeshift' },
  { value: 'rented', label: 'Rented' },
  { value: 'government_provided', label: 'Government Provided' },
  { value: 'homeless', label: 'Homeless / No Fixed Abode' },
]

const DISABILITY_TYPES = [
  { value: 'physical', label: 'Physical' },
  { value: 'visual', label: 'Visual / Blind' },
  { value: 'hearing', label: 'Hearing / Deaf' },
  { value: 'intellectual', label: 'Intellectual' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'multiple', label: 'Multiple Disabilities' },
]

const LAND_OWNERSHIP_TYPES = [
  { value: 'customary', label: 'Customary Land Rights' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'freehold', label: 'Freehold' },
  { value: 'communal', label: 'Communal' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'none', label: 'No Rights' },
]

const INCOME_RANGES = [
  { value: 'none', label: 'No Income' },
  { value: '0-500', label: 'BWP 1 – 500' },
  { value: '501-1000', label: 'BWP 501 – 1,000' },
  { value: '1001-2000', label: 'BWP 1,001 – 2,000' },
  { value: '2001+', label: 'BWP 2,001+' },
]

const PERSON_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deceased', label: 'Deceased' },
  { value: 'relocated', label: 'Relocated' },
]

const EMPTY_FORM = {
  first_name: '', last_name: '', id_number: '', date_of_birth: '', age: '',
  gender: '', village_town: '', district: 'Central', ward: 'Bosele',
  address: '', phone: '', household_size: '',
  next_of_kin_name: '', next_of_kin_phone: '', next_of_kin_relationship: '',
  has_disability: false, disability_type: '', disability_details: '', disability_card_number: '',
  education_level: '', school_name: '', currently_enrolled: false, highest_qualification: '',
  employment_status: '', occupation: '', employer_name: '', monthly_income_range: '',
  has_chronic_illness: false, chronic_illness_details: '',
  has_hiv_aids: false, on_art: false,
  has_mental_health_condition: false, mental_health_details: '', other_medical_notes: '',
  housing_type: '', housing_ownership: '',
  has_electricity: false, has_clean_water: false, has_sanitation: false, number_of_rooms: '',
  has_land: false, land_size_hectares: '', land_ownership_type: '',
  land_location: '', land_conflict: false, land_conflict_details: '',
  ngo_program: '', beneficiary_number: '', notes: '', status: 'active',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-800',
    teal: 'bg-teal-100 text-teal-800',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-amber-200">
    <span className="text-lg">{icon}</span>
    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">{title}</h3>
  </div>
)

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
)

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"

const Toggle = ({ label, checked, onChange, sublabel }) => (
  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-amber-50 transition-colors">
    <div className="relative flex-shrink-0 mt-0.5">
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-gray-300'}`} />
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </div>
    <div>
      <div className="text-sm font-medium text-gray-800">{label}</div>
      {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
    </div>
  </label>
)

// ─── Stats Card ───────────────────────────────────────────────────────────────

const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[
      { label: 'Total Registered', value: stats.total, icon: '👥', color: 'bg-amber-50 border-amber-200 text-amber-700' },
      { label: 'With Disability', value: stats.disabled, icon: '♿', color: 'bg-blue-50 border-blue-200 text-blue-700' },
      { label: 'Unemployed', value: stats.unemployed, icon: '💼', color: 'bg-red-50 border-red-200 text-red-700' },
      { label: 'Land Rights Issues', value: stats.landConflict, icon: '🌍', color: 'bg-green-50 border-green-200 text-green-700' },
    ].map(({ label, value, icon, color }) => (
      <div key={label} className={`rounded-xl border p-4 ${color}`}>
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-2xl font-bold">{value ?? '–'}</div>
        <div className="text-xs font-medium opacity-80">{label}</div>
      </div>
    ))}
  </div>
)

// ─── Person Row ───────────────────────────────────────────────────────────────

const PersonRow = ({ person, onView, onEdit, onDelete }) => {
  const categoryBadges = []
  if (person.has_disability) categoryBadges.push({ label: '♿ Disabled', color: 'blue' })
  if (person.employment_status === 'unemployed') categoryBadges.push({ label: '💼 Unemployed', color: 'red' })
  if (person.has_land) categoryBadges.push({ label: '🌍 Has Land', color: 'green' })
  if (person.land_conflict) categoryBadges.push({ label: '⚠️ Land Conflict', color: 'orange' })
  if (person.currently_enrolled) categoryBadges.push({ label: '📚 In School', color: 'purple' })
  if (person.has_chronic_illness) categoryBadges.push({ label: '🏥 Chronic Illness', color: 'yellow' })

  return (
    <tr className="hover:bg-amber-50 transition-colors border-b border-gray-100">
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900 text-sm">{person.first_name} {person.last_name}</div>
        <div className="text-xs text-gray-500">{person.id_number || 'No ID'}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">{person.age || '–'}</td>
      <td className="px-4 py-3 text-sm text-gray-700">{person.village_town}</td>
      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{(person.education_level || '').replace(/_/g, ' ') || '–'}</td>
      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{(person.employment_status || '').replace(/_/g, ' ') || '–'}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {categoryBadges.slice(0, 3).map(({ label, color }) => (
            <Badge key={label} color={color}>{label}</Badge>
          ))}
          {categoryBadges.length > 3 && <Badge color="gray">+{categoryBadges.length - 3}</Badge>}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <button onClick={() => onView(person)} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" title="View">👁</button>
          <button onClick={() => onEdit(person)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">✏️</button>
          <button onClick={() => onDelete(person)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Remove">🗑</button>
        </div>
      </td>
    </tr>
  )
}

// ─── Registration Form ────────────────────────────────────────────────────────

const RegistrationForm = ({ initial, onSave, onCancel, saving }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [activeSection, setActiveSection] = useState('personal')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setDOB = (dob) => {
    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : ''
    setForm(f => ({ ...f, date_of_birth: dob, age }))
  }

  const sections = [
    { id: 'personal', label: '👤 Personal', icon: '👤' },
    { id: 'disability', label: '♿ Disability', icon: '♿' },
    { id: 'education', label: '📚 Education', icon: '📚' },
    { id: 'employment', label: '💼 Employment', icon: '💼' },
    { id: 'health', label: '🏥 Health', icon: '🏥' },
    { id: 'housing', label: '🏠 Housing', icon: '🏠' },
    { id: 'land', label: '🌍 Land', icon: '🌍' },
    { id: 'ngo', label: '🤝 NGO', icon: '🤝' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-t-2xl p-6 text-white">
          <h2 className="text-xl font-bold">{initial?.id ? 'Edit' : 'Register'} San / Basarwa Person</h2>
          <p className="text-amber-100 text-sm mt-1">Bosele Ward — Indigenous People Registry</p>
        </div>

        {/* Section Nav */}
        <div className="flex gap-1 p-3 bg-amber-50 border-b overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSection === s.id
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-800 hover:bg-amber-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">

            {/* PERSONAL */}
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <SectionTitle icon="👤" title="Personal Information" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input required className={inputClass} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" />
                  </Field>
                  <Field label="Last Name" required>
                    <input required className={inputClass} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" />
                  </Field>
                  <Field label="Omang / ID Number">
                    <input className={inputClass} value={form.id_number} onChange={e => set('id_number', e.target.value)} placeholder="National ID number" />
                  </Field>
                  <Field label="Gender">
                    <select className={selectClass} value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" className={inputClass} value={form.date_of_birth} onChange={e => setDOB(e.target.value)} />
                  </Field>
                  <Field label="Age">
                    <input type="number" className={inputClass} value={form.age} onChange={e => set('age', e.target.value)} placeholder="Auto-calculated from DOB" />
                  </Field>
                  <Field label="Village / Town" required>
                    <input required className={inputClass} value={form.village_town} onChange={e => set('village_town', e.target.value)} placeholder="e.g. New Xade" />
                  </Field>
                  <Field label="Ward">
                    <input className={inputClass} value={form.ward} onChange={e => set('ward', e.target.value)} />
                  </Field>
                  <Field label="District">
                    <input className={inputClass} value={form.district} onChange={e => set('district', e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+267..." />
                  </Field>
                  <Field label="Household Size">
                    <input type="number" className={inputClass} value={form.household_size} onChange={e => set('household_size', e.target.value)} placeholder="No. of people in household" min="1" />
                  </Field>
                  <Field label="Status">
                    <select className={selectClass} value={form.status} onChange={e => set('status', e.target.value)}>
                      {PERSON_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Physical Address">
                  <textarea rows={2} className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Residential address or plot number" />
                </Field>
                <SectionTitle icon="🆘" title="Next of Kin" />
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Name">
                    <input className={inputClass} value={form.next_of_kin_name} onChange={e => set('next_of_kin_name', e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <input className={inputClass} value={form.next_of_kin_phone} onChange={e => set('next_of_kin_phone', e.target.value)} />
                  </Field>
                  <Field label="Relationship">
                    <input className={inputClass} value={form.next_of_kin_relationship} onChange={e => set('next_of_kin_relationship', e.target.value)} placeholder="e.g. Spouse, Child" />
                  </Field>
                </div>
              </div>
            )}

            {/* DISABILITY */}
            {activeSection === 'disability' && (
              <div className="space-y-4">
                <SectionTitle icon="♿" title="Disability Information" />
                <Toggle
                  label="Person has a disability"
                  sublabel="Check all that apply in the fields below"
                  checked={form.has_disability}
                  onChange={v => set('has_disability', v)}
                />
                {form.has_disability && (
                  <div className="space-y-4 pl-4 border-l-4 border-amber-300">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Disability Type">
                        <select className={selectClass} value={form.disability_type} onChange={e => set('disability_type', e.target.value)}>
                          <option value="">Select type</option>
                          {DISABILITY_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Disability Card Number">
                        <input className={inputClass} value={form.disability_card_number} onChange={e => set('disability_card_number', e.target.value)} placeholder="If registered with DSW" />
                      </Field>
                    </div>
                    <Field label="Disability Details">
                      <textarea rows={3} className={inputClass} value={form.disability_details} onChange={e => set('disability_details', e.target.value)} placeholder="Describe the disability and its impact..." />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {/* EDUCATION */}
            {activeSection === 'education' && (
              <div className="space-y-4">
                <SectionTitle icon="📚" title="Education" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Highest Education Level">
                    <select className={selectClass} value={form.education_level} onChange={e => set('education_level', e.target.value)}>
                      <option value="">Select level</option>
                      {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </Field>
                  <Field label="School / Institution Name">
                    <input className={inputClass} value={form.school_name} onChange={e => set('school_name', e.target.value)} />
                  </Field>
                  <Field label="Highest Qualification / Certificate">
                    <input className={inputClass} value={form.highest_qualification} onChange={e => set('highest_qualification', e.target.value)} placeholder="e.g. BGCSE, BCA, COSC" />
                  </Field>
                </div>
                <Toggle
                  label="Currently enrolled in school / training"
                  checked={form.currently_enrolled}
                  onChange={v => set('currently_enrolled', v)}
                />
              </div>
            )}

            {/* EMPLOYMENT */}
            {activeSection === 'employment' && (
              <div className="space-y-4">
                <SectionTitle icon="💼" title="Employment & Income" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Employment Status">
                    <select className={selectClass} value={form.employment_status} onChange={e => set('employment_status', e.target.value)}>
                      <option value="">Select status</option>
                      {EMPLOYMENT_STATUSES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Occupation / Job Title">
                    <input className={inputClass} value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Farmer, Craftsperson" />
                  </Field>
                  <Field label="Employer Name">
                    <input className={inputClass} value={form.employer_name} onChange={e => set('employer_name', e.target.value)} />
                  </Field>
                  <Field label="Monthly Income Range">
                    <select className={selectClass} value={form.monthly_income_range} onChange={e => set('monthly_income_range', e.target.value)}>
                      <option value="">Select range</option>
                      {INCOME_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* HEALTH */}
            {activeSection === 'health' && (
              <div className="space-y-2">
                <SectionTitle icon="🏥" title="Health & Medical" />
                <Toggle label="Has chronic illness / condition" checked={form.has_chronic_illness} onChange={v => set('has_chronic_illness', v)} />
                {form.has_chronic_illness && (
                  <Field label="Chronic Illness Details">
                    <textarea rows={2} className={inputClass} value={form.chronic_illness_details} onChange={e => set('chronic_illness_details', e.target.value)} placeholder="e.g. Diabetes, Hypertension, TB..." />
                  </Field>
                )}
                <Toggle label="Living with HIV/AIDS" checked={form.has_hiv_aids} onChange={v => set('has_hiv_aids', v)} />
                {form.has_hiv_aids && (
                  <Toggle label="Currently on ART (antiretroviral therapy)" checked={form.on_art} onChange={v => set('on_art', v)} />
                )}
                <Toggle label="Has mental health condition" checked={form.has_mental_health_condition} onChange={v => set('has_mental_health_condition', v)} />
                {form.has_mental_health_condition && (
                  <Field label="Mental Health Details">
                    <textarea rows={2} className={inputClass} value={form.mental_health_details} onChange={e => set('mental_health_details', e.target.value)} />
                  </Field>
                )}
                <Field label="Other Medical Notes">
                  <textarea rows={3} className={inputClass} value={form.other_medical_notes} onChange={e => set('other_medical_notes', e.target.value)} placeholder="Allergies, medications, special needs..." />
                </Field>
              </div>
            )}

            {/* HOUSING */}
            {activeSection === 'housing' && (
              <div className="space-y-4">
                <SectionTitle icon="🏠" title="Housing Situation" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Housing Type">
                    <select className={selectClass} value={form.housing_type} onChange={e => set('housing_type', e.target.value)}>
                      <option value="">Select type</option>
                      {HOUSING_TYPES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Ownership Status">
                    <select className={selectClass} value={form.housing_ownership} onChange={e => set('housing_ownership', e.target.value)}>
                      <option value="">Select ownership</option>
                      <option value="owns">Owns</option>
                      <option value="rents">Rents</option>
                      <option value="family_owned">Family Owned</option>
                      <option value="communal">Communal</option>
                      <option value="none">None / Squatting</option>
                    </select>
                  </Field>
                  <Field label="Number of Rooms">
                    <input type="number" className={inputClass} value={form.number_of_rooms} onChange={e => set('number_of_rooms', e.target.value)} min="1" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Toggle label="Has Electricity" checked={form.has_electricity} onChange={v => set('has_electricity', v)} />
                  <Toggle label="Has Clean Water" checked={form.has_clean_water} onChange={v => set('has_clean_water', v)} />
                  <Toggle label="Has Sanitation" checked={form.has_sanitation} onChange={v => set('has_sanitation', v)} />
                </div>
              </div>
            )}

            {/* LAND */}
            {activeSection === 'land' && (
              <div className="space-y-4">
                <SectionTitle icon="🌍" title="Land Rights" />
                <Toggle label="Has or claims land" checked={form.has_land} onChange={v => set('has_land', v)} />
                {form.has_land && (
                  <div className="space-y-4 pl-4 border-l-4 border-amber-300">
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Land Size (Hectares)">
                        <input type="number" step="0.1" className={inputClass} value={form.land_size_hectares} onChange={e => set('land_size_hectares', e.target.value)} />
                      </Field>
                      <Field label="Ownership Type">
                        <select className={selectClass} value={form.land_ownership_type} onChange={e => set('land_ownership_type', e.target.value)}>
                          <option value="">Select type</option>
                          {LAND_OWNERSHIP_TYPES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                      </Field>
                      <Field label="Land Location">
                        <input className={inputClass} value={form.land_location} onChange={e => set('land_location', e.target.value)} placeholder="Village / area where land is located" />
                      </Field>
                    </div>
                  </div>
                )}
                <Toggle label="Land conflict / dispute" checked={form.land_conflict} onChange={v => set('land_conflict', v)} sublabel="Active dispute with third party or government" />
                {form.land_conflict && (
                  <Field label="Land Conflict Details">
                    <textarea rows={3} className={inputClass} value={form.land_conflict_details} onChange={e => set('land_conflict_details', e.target.value)} placeholder="Describe the nature of the conflict..." />
                  </Field>
                )}
              </div>
            )}

            {/* NGO */}
            {activeSection === 'ngo' && (
              <div className="space-y-4">
                <SectionTitle icon="🤝" title="NGO Program & Notes" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="NGO Program / Intervention">
                    <input className={inputClass} value={form.ngo_program} onChange={e => set('ngo_program', e.target.value)} placeholder="e.g. Livelihood Support, Legal Aid" />
                  </Field>
                  <Field label="Beneficiary Number">
                    <input className={inputClass} value={form.beneficiary_number} onChange={e => set('beneficiary_number', e.target.value)} placeholder="NGO beneficiary reference" />
                  </Field>
                </div>
                <Field label="Additional Notes">
                  <textarea rows={4} className={inputClass} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any other relevant information..." />
                </Field>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 rounded-b-2xl border-t">
            <div className="flex gap-1">
              {sections.map((s, i) => (
                <button key={s.id} type="button" onClick={() => setActiveSection(s.id)}
                  className={`w-2 h-2 rounded-full transition-all ${activeSection === s.id ? 'bg-amber-500 w-4' : 'bg-gray-300'}`} />
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-semibold disabled:opacity-50">
                {saving ? 'Saving...' : initial?.id ? 'Update Record' : 'Register Person'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── View Modal ───────────────────────────────────────────────────────────────

const ViewModal = ({ person, onClose, onEdit }) => {
  if (!person) return null

  const Row = ({ label, value }) => value ? (
    <div className="flex gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
    </div>
  ) : null

  const Section = ({ title, icon, children }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">{title}</h4>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">{children}</div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="bg-gradient-to-r from-amber-700 to-amber-500 rounded-t-2xl p-6 text-white flex justify-between">
          <div>
            <h2 className="text-xl font-bold">{person.first_name} {person.last_name}</h2>
            <p className="text-amber-100 text-sm">{person.village_town} · {person.ward} Ward · ID: {person.id_number || 'N/A'}</p>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white text-2xl">×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <Section title="Personal" icon="👤">
            <Row label="Age / Gender" value={[person.age, person.gender].filter(Boolean).join(' · ')} />
            <Row label="Date of Birth" value={person.date_of_birth} />
            <Row label="Phone" value={person.phone} />
            <Row label="Address" value={person.address} />
            <Row label="Household Size" value={person.household_size} />
            <Row label="Next of Kin" value={person.next_of_kin_name ? `${person.next_of_kin_name} (${person.next_of_kin_relationship || ''}) ${person.next_of_kin_phone || ''}` : null} />
          </Section>
          {person.has_disability && (
            <Section title="Disability" icon="♿">
              <Row label="Type" value={person.disability_type?.replace(/_/g, ' ')} />
              <Row label="Card Number" value={person.disability_card_number} />
              <Row label="Details" value={person.disability_details} />
            </Section>
          )}
          <Section title="Education" icon="📚">
            <Row label="Level" value={person.education_level?.replace(/_/g, ' ')} />
            <Row label="School" value={person.school_name} />
            <Row label="Qualification" value={person.highest_qualification} />
            <Row label="Enrolled" value={person.currently_enrolled ? 'Yes' : 'No'} />
          </Section>
          <Section title="Employment" icon="💼">
            <Row label="Status" value={person.employment_status?.replace(/_/g, ' ')} />
            <Row label="Occupation" value={person.occupation} />
            <Row label="Employer" value={person.employer_name} />
            <Row label="Income" value={person.monthly_income_range ? `BWP ${person.monthly_income_range}/month` : null} />
          </Section>
          <Section title="Health" icon="🏥">
            <Row label="Chronic Illness" value={person.has_chronic_illness ? (person.chronic_illness_details || 'Yes') : 'No'} />
            <Row label="HIV/AIDS" value={person.has_hiv_aids ? `Yes${person.on_art ? ' (on ART)' : ''}` : 'No'} />
            <Row label="Mental Health" value={person.has_mental_health_condition ? (person.mental_health_details || 'Yes') : 'No'} />
            <Row label="Other Notes" value={person.other_medical_notes} />
          </Section>
          <Section title="Housing" icon="🏠">
            <Row label="Type" value={person.housing_type?.replace(/_/g, ' ')} />
            <Row label="Ownership" value={person.housing_ownership?.replace(/_/g, ' ')} />
            <Row label="Rooms" value={person.number_of_rooms} />
            <Row label="Utilities" value={[person.has_electricity && 'Electricity', person.has_clean_water && 'Water', person.has_sanitation && 'Sanitation'].filter(Boolean).join(', ') || 'None'} />
          </Section>
          <Section title="Land" icon="🌍">
            <Row label="Has Land" value={person.has_land ? 'Yes' : 'No'} />
            {person.has_land && <>
              <Row label="Size" value={person.land_size_hectares ? `${person.land_size_hectares} ha` : null} />
              <Row label="Ownership" value={person.land_ownership_type?.replace(/_/g, ' ')} />
              <Row label="Location" value={person.land_location} />
            </>}
            <Row label="Land Conflict" value={person.land_conflict ? (person.land_conflict_details || 'Yes') : 'No'} />
          </Section>
          {(person.ngo_program || person.beneficiary_number || person.notes) && (
            <Section title="NGO & Notes" icon="🤝">
              <Row label="Program" value={person.ngo_program} />
              <Row label="Beneficiary #" value={person.beneficiary_number} />
              <Row label="Notes" value={person.notes} />
            </Section>
          )}
        </div>
        <div className="flex gap-3 justify-end px-6 py-4 border-t">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Close</button>
          <button onClick={() => { onClose(); onEdit(person) }} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700">Edit Record</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SanPeopleManagement() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({})
  const [page, setPage] = useState(1)

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editPerson, setEditPerson] = useState(null)
  const [viewPerson, setViewPerson] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterDisability, setFilterDisability] = useState('')
  const [filterEducation, setFilterEducation] = useState('')
  const [filterEmployment, setFilterEmployment] = useState('')
  const [filterHousing, setFilterHousing] = useState('')

  const fetchPeople = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (search) params.set('search', search)
      if (filterDisability) params.set('disability', filterDisability)
      if (filterEducation) params.set('education', filterEducation)
      if (filterEmployment) params.set('employment', filterEmployment)
      if (filterHousing) params.set('housing', filterHousing)

      const res = await fetch(`/api/san-people?${params}`)
      const data = await res.json()
      setPeople(data.data || [])
      setTotal(data.count || 0)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, filterDisability, filterEducation, filterEmployment, filterHousing])

  const fetchStats = async () => {
    try {
      // Fetch stats: total, disabled, unemployed, land conflict
      const [all, disabled, unemployed, landConflict] = await Promise.all([
        fetch('/api/san-people?limit=1').then(r => r.json()),
        fetch('/api/san-people?disability=true&limit=1').then(r => r.json()),
        fetch('/api/san-people?employment=unemployed&limit=1').then(r => r.json()),
        // No filter for land conflict directly; fallback to total
        fetch('/api/san-people?limit=1').then(r => r.json()),
      ])
      setStats({
        total: all.count || 0,
        disabled: disabled.count || 0,
        unemployed: unemployed.count || 0,
        landConflict: '–',
      })
    } catch {}
  }

  useEffect(() => { fetchPeople() }, [fetchPeople])
  useEffect(() => { fetchStats() }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const isEdit = !!form.id
      const url = isEdit ? `/api/san-people/${form.id}` : '/api/san-people'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Save failed')

      setShowForm(false)
      setEditPerson(null)
      fetchPeople()
      fetchStats()
    } catch (err) {
      alert('Error saving record: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (person) => {
    try {
      await fetch(`/api/san-people/${person.id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      fetchPeople()
      fetchStats()
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterDisability) params.set('disability', filterDisability)
    if (filterEducation) params.set('education', filterEducation)
    if (filterEmployment) params.set('employment', filterEmployment)
    window.open(`/api/san-people/export?${params}`, '_blank')
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">San / Basarwa Registry</h2>
            <p className="text-amber-100 mt-1">Bosele Ward · Indigenous People Empowerment Programme</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => { setEditPerson(null); setShowForm(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-amber-800 rounded-lg text-sm font-bold hover:bg-amber-50 transition-colors shadow"
            >
              + Register Person
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="🔍  Search by name, ID, village..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={filterDisability} onChange={e => { setFilterDisability(e.target.value); setPage(1) }}>
            <option value="">All — Disability</option>
            <option value="true">♿ Has Disability</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={filterEducation} onChange={e => { setFilterEducation(e.target.value); setPage(1) }}>
            <option value="">All — Education</option>
            {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={filterEmployment} onChange={e => { setFilterEmployment(e.target.value); setPage(1) }}>
            <option value="">All — Employment</option>
            {EMPLOYMENT_STATUSES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={filterHousing} onChange={e => { setFilterHousing(e.target.value); setPage(1) }}>
            <option value="">All — Housing</option>
            {HOUSING_TYPES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
          </select>
          {(search || filterDisability || filterEducation || filterEmployment || filterHousing) && (
            <button onClick={() => { setSearch(''); setFilterDisability(''); setFilterEducation(''); setFilterEmployment(''); setFilterHousing(''); setPage(1) }}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200">
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
          <span className="text-sm text-gray-600 font-medium">{total} {total === 1 ? 'person' : 'people'} registered</span>
          {totalPages > 1 && (
            <div className="flex gap-2 items-center">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100">←</button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-100">→</button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin text-3xl">⏳</div>
          </div>
        ) : people.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-gray-500 font-medium">No people registered yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Register Person" to add the first record</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-amber-50 text-amber-900">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Name / ID</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Village</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Education</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Employment</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Categories</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {people.map(person => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    onView={setViewPerson}
                    onEdit={(p) => { setEditPerson(p); setShowForm(true) }}
                    onDelete={setDeleteConfirm}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <RegistrationForm
          initial={editPerson}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditPerson(null) }}
          saving={saving}
        />
      )}

      {viewPerson && (
        <ViewModal
          person={viewPerson}
          onClose={() => setViewPerson(null)}
          onEdit={(p) => { setEditPerson(p); setShowForm(true) }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-900">Remove Record?</h3>
              <p className="text-gray-600 text-sm mt-2">
                This will mark <strong>{deleteConfirm.first_name} {deleteConfirm.last_name}</strong> as inactive. The record will not be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
