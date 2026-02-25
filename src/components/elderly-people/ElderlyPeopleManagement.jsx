'use client'
import { useState, useEffect, useMemo } from 'react'
import { FileDown, RefreshCw, MapPin, Users, Filter, X, Search, Tag } from 'lucide-react'

// ── Category config ───────────────────────────────────────────
const ALL_CATEGORIES = [
  { value: 'Elderly',    label: 'Elderly',    color: 'amber',  icon: '👴' },
  { value: 'Disabled',   label: 'Disabled',   color: 'blue',   icon: '♿' },
  { value: 'Vulnerable', label: 'Vulnerable', color: 'orange', icon: '🛡️' },
  { value: 'Orphan',     label: 'Orphan',     color: 'purple', icon: '🧒' },
]

const CATEGORY_STYLES = {
  Elderly:    'bg-amber-100 text-amber-700 border-amber-200',
  Disabled:   'bg-blue-100 text-blue-700 border-blue-200',
  Vulnerable: 'bg-orange-100 text-orange-700 border-orange-200',
  Orphan:     'bg-purple-100 text-purple-700 border-purple-200',
}

// ── Helper: detect gender from Omang ID (5th digit: 1=Male, 2=Female) ──
function detectGenderFromId(idNumber) {
  if (!idNumber || idNumber.length < 5) return ''
  const digit = idNumber[4]
  if (digit === '1') return 'Male'
  if (digit === '2') return 'Female'
  return ''
}

// ── Helper: calculate age from a date string ──────────────────
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return ''
  const dob = new Date(dateOfBirth)
  if (isNaN(dob)) return ''
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--
  return age >= 0 ? age.toString() : ''
}

const EMPTY_FORM = {
  firstName: '', lastName: '', idNumber: '', dateOfBirth: '', age: '',
  gender: '', categories: [],
  villageTown: '', district: '', address: '', phone: '',
  nextOfKinName: '', nextOfKinPhone: '', nextOfKinRelationship: '',
  medicalInfo: '', notes: '',
}

export default function PeopleRegistry() {
  const [people, setPeople]                   = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showAddForm, setShowAddForm]         = useState(false)
  const [editingId, setEditingId]             = useState(null)
  const [exportingPdf, setExportingPdf]       = useState(false)
  const [exportingVillagePdf, setExportingVillagePdf] = useState(false)

  // ── Filters ───────────────────────────────────────────────────
  const [selectedVillage,    setSelectedVillage]    = useState('all')
  const [selectedCategories, setSelectedCategories] = useState([]) // empty = show all
  const [searchQuery,        setSearchQuery]        = useState('')

  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => { fetchPeople() }, [])

  const fetchPeople = async () => {
    try {
      const res  = await fetch('/api/elderly-people')
      const data = await res.json()
      setPeople(data.people || [])
    } catch (error) {
      console.error('❌ Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Unique villages ───────────────────────────────────────────
  const villages = useMemo(() => {
    const set = new Set(people.map(p => p.villageTown?.trim()).filter(Boolean))
    return Array.from(set).sort()
  }, [people])

  // ── Filtered list ─────────────────────────────────────────────
  const filteredPeople = useMemo(() => {
    let list = people

    // Village filter
    if (selectedVillage !== 'all') {
      list = list.filter(p => p.villageTown?.trim() === selectedVillage)
    }

    // Category filter — person must have ALL selected categories (OR logic: any match)
    if (selectedCategories.length > 0) {
      list = list.filter(p =>
        selectedCategories.some(cat => (p.categories || []).includes(cat))
      )
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.idNumber?.toLowerCase().includes(q) ||
        p.villageTown?.toLowerCase().includes(q)
      )
    }

    return list
  }, [people, selectedVillage, selectedCategories, searchQuery])

  // ── Category filter toggle ────────────────────────────────────
  const toggleCategoryFilter = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  // ── Form handlers ─────────────────────────────────────────────
  const handleIdChange = (e) => {
    const idNumber = e.target.value
    const detectedGender = detectGenderFromId(idNumber)
    setFormData(prev => ({
      ...prev,
      idNumber,
      ...(detectedGender ? { gender: detectedGender } : {}),
    }))
  }

  const handleDobChange = (e) => {
    const dateOfBirth = e.target.value
    const age = calculateAge(dateOfBirth)
    setFormData(prev => ({ ...prev, dateOfBirth, age }))
  }

  const handleCategoryToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter(c => c !== value)
        : [...prev.categories, value],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url    = editingId ? `/api/elderly-people/${editingId}` : '/api/elderly-people'
      const method = editingId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await res.json()
      if (res.ok) {
        fetchPeople()
        resetForm()
        setShowAddForm(false)
      } else {
        alert(result.error || 'Failed to save record')
      }
    } catch {
      alert('An error occurred while saving')
    }
  }

  const handleEdit = (person) => {
    const dateOfBirth    = person.dateOfBirth ? person.dateOfBirth.split('T')[0] : ''
    const age            = dateOfBirth ? calculateAge(dateOfBirth) : (person.age?.toString() || '')
    const idNumber       = person.idNumber || ''
    const detectedGender = detectGenderFromId(idNumber)
    setFormData({
      firstName:             person.firstName || '',
      lastName:              person.lastName  || '',
      idNumber,
      dateOfBirth,
      age,
      gender:                detectedGender || person.gender || '',
      categories:            person.categories || [],
      villageTown:           person.villageTown           || '',
      district:              person.district              || '',
      address:               person.address               || '',
      phone:                 person.phone                 || '',
      nextOfKinName:         person.nextOfKinName         || '',
      nextOfKinPhone:        person.nextOfKinPhone        || '',
      nextOfKinRelationship: person.nextOfKinRelationship || '',
      medicalInfo:           person.medicalInfo           || '',
      notes:                 person.notes                 || '',
    })
    setEditingId(person.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const res    = await fetch(`/api/elderly-people/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (res.ok) fetchPeople()
      else alert(result.error || 'Failed to delete record')
    } catch {
      alert('An error occurred while deleting')
    }
  }

  // ── PDF ───────────────────────────────────────────────────────
  const handleExportAllPdf = async () => {
    if (!people.length) return
    setExportingPdf(true)
    await triggerPdfDownload(people, 'all-people-registry')
    setExportingPdf(false)
  }

  const handleExportViewPdf = async () => {
    if (!filteredPeople.length) return
    setExportingVillagePdf(true)
    const label = [
      selectedVillage !== 'all' ? selectedVillage : '',
      selectedCategories.length ? selectedCategories.join('-') : '',
    ].filter(Boolean).join('-') || 'all'
    await triggerPdfDownload(filteredPeople, `people-registry-${label.toLowerCase().replace(/\s+/g, '-')}`)
    setExportingVillagePdf(false)
  }

  const triggerPdfDownload = async (data, filename) => {
    try {
      const res = await fetch('/api/elderly-people/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people: data }),
      })
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Failed to export PDF'); return }
      const blob = URL.createObjectURL(await res.blob())
      const a    = Object.assign(document.createElement('a'), { href: blob, download: `${filename}-${new Date().toISOString().split('T')[0]}.pdf` })
      a.click()
      URL.revokeObjectURL(blob)
    } catch { alert('Network error — please try again.') }
  }

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingId(null) }

  const isFiltered = selectedVillage !== 'all' || selectedCategories.length > 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Registry</h2>
          <p className="text-gray-600 mt-1">Elderly, Disabled, Vulnerable &amp; Orphan residents</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportAllPdf}
            disabled={exportingPdf || !people.length}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf
              ? <><RefreshCw className="h-4 w-4 animate-spin" />Exporting…</>
              : <><FileDown className="h-4 w-4" />Export All PDF</>}
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm() }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            {showAddForm ? 'Cancel' : '+ Add Person'}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or village…"
            className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
            <Tag className="h-4 w-4 text-emerald-500" />
            Filter by Category:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategories([])}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategories.length === 0
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              All ({people.length})
            </button>
            {ALL_CATEGORIES.map(cat => {
              const count    = people.filter(p => (p.categories || []).includes(cat.value)).length
              const isActive = selectedCategories.includes(cat.value)
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleCategoryFilter(cat.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? `${CATEGORY_STYLES[cat.value]} shadow-sm font-semibold`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Village filter */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-2">
            <Filter className="h-4 w-4 text-emerald-500" />
            Filter by Village:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedVillage('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedVillage === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              All Villages
            </button>
            {villages.map(village => {
              const count = people.filter(p => p.villageTown?.trim() === village).length
              return (
                <button
                  key={village}
                  onClick={() => setSelectedVillage(village)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedVillage === village
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {village} ({count})
                </button>
              )
            })}
            {villages.length === 0 && <span className="text-sm text-gray-400 italic">No villages recorded yet</span>}

            {/* Export current view */}
            <div className="ml-auto">
              <button
                onClick={handleExportViewPdf}
                disabled={exportingVillagePdf || !filteredPeople.length}
                className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportingVillagePdf
                  ? <><RefreshCw className="h-4 w-4 animate-spin" />Exporting…</>
                  : <>
                      <FileDown className="h-4 w-4" />
                      Export View PDF
                      <span className="ml-1 bg-emerald-200 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {filteredPeople.length}
                      </span>
                    </>}
              </button>
            </div>
          </div>
        </div>

        {/* Active filter badges */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Active filters:</span>
            {selectedVillage !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                <MapPin className="h-3 w-3" />
                {selectedVillage}
                <button onClick={() => setSelectedVillage('all')} className="ml-1 hover:text-emerald-900"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategories.map(cat => (
              <span key={cat} className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[cat]}`}>
                {ALL_CATEGORIES.find(c => c.value === cat)?.icon} {cat}
                <button onClick={() => toggleCategoryFilter(cat)} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <span className="text-xs text-gray-500">{filteredPeople.length} of {people.length} people</span>
            <button
              onClick={() => { setSelectedVillage('all'); setSelectedCategories([]) }}
              className="text-xs text-red-500 hover:text-red-700 underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Add / Edit Form ── */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-emerald-500">
          <h3 className="text-xl font-semibold mb-5">
            {editingId ? 'Edit Record' : 'Add New Person'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Category Selection ── */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                Category <span className="text-red-500">*</span>
              </h4>
              <p className="text-xs text-gray-500 mb-3">Select all that apply to this person.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ALL_CATEGORIES.map(cat => {
                  const isChecked = formData.categories.includes(cat.value)
                  return (
                    <label
                      key={cat.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked
                          ? `${CATEGORY_STYLES[cat.value]} border-current`
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="sr-only"
                      />
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{cat.label}</div>
                      </div>
                      {isChecked && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-current flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  )
                })}
              </div>
              {formData.categories.length === 0 && (
                <p className="mt-2 text-xs text-red-500">⚠️ Please select at least one category.</p>
              )}
            </div>

            {/* Personal Info */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" required value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="First name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" required value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Last name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number (Omang)
                    {formData.idNumber.length >= 5 && detectGenderFromId(formData.idNumber) && (
                      <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${
                        detectGenderFromId(formData.idNumber) === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      }`}>
                        {detectGenderFromId(formData.idNumber) === 'Male' ? '♂ Male detected' : '♀ Female detected'}
                      </span>
                    )}
                  </label>
                  <input type="text" value={formData.idNumber} onChange={handleIdChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="National ID / Omang" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={handleDobChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                    {formData.dateOfBirth && (
                      <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">auto-calculated</span>
                    )}
                  </label>
                  <input type="number" min="0" max="150" value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formData.dateOfBirth ? 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold' : 'border-gray-300'
                    }`}
                    placeholder="Age" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                    {formData.idNumber.length >= 5 && detectGenderFromId(formData.idNumber) && (
                      <span className="ml-2 text-xs font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">auto-detected</span>
                    )}
                  </label>
                  <select value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                      formData.idNumber.length >= 5 && detectGenderFromId(formData.idNumber) ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
                    }`}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Village / Town *</label>
                  <input type="text" required value={formData.villageTown}
                    onChange={e => setFormData({ ...formData, villageTown: e.target.value })}
                    list="village-suggestions-ep"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Gaborone, Maun…" />
                  <datalist id="village-suggestions-ep">
                    {villages.map(v => <option key={v} value={v} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input type="text" value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., South East" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                  <input type="text" value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Plot/ward/street" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 71234567" />
                </div>
              </div>
            </div>

            {/* Next of Kin */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Next of Kin</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.nextOfKinName}
                    onChange={e => setFormData({ ...formData, nextOfKinName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Next of kin name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.nextOfKinPhone}
                    onChange={e => setFormData({ ...formData, nextOfKinPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Contact number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input type="text" value={formData.nextOfKinRelationship}
                    onChange={e => setFormData({ ...formData, nextOfKinRelationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Son, Daughter" />
                </div>
              </div>
            </div>

            {/* Health & Notes */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Health &amp; Notes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Information</label>
                  <textarea value={formData.medicalInfo}
                    onChange={e => setFormData({ ...formData, medicalInfo: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Conditions, medications, allergies…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Any other relevant information…" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => { setShowAddForm(false); resetForm() }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={formData.categories.length === 0}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update Record' : 'Add Person'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isFiltered || searchQuery ? 'No matching records' : 'No records yet'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isFiltered || searchQuery
                ? <button onClick={() => { setSelectedVillage('all'); setSelectedCategories([]); setSearchQuery('') }} className="text-emerald-600 underline">Clear filters</button>
                : 'Get started by adding a person.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Full Name', 'Category', 'ID Number', 'Age', 'Gender', 'Village / Town', 'District', 'Phone', 'Next of Kin', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPeople.map((person, idx) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{person.firstName} {person.lastName}</div>
                      {person.medicalInfo && <div className="text-xs text-red-600 mt-0.5">⚕️ Medical Info</div>}
                    </td>

                    {/* Categories cell */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(person.categories || []).length > 0
                          ? (person.categories || []).map(cat => {
                              const def = ALL_CATEGORIES.find(c => c.value === cat)
                              return (
                                <span key={cat} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_STYLES[cat] || 'bg-gray-100 text-gray-600'}`}>
                                  {def?.icon} {cat}
                                </span>
                              )
                            })
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{person.idNumber || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {person.dateOfBirth
                        ? calculateAge(person.dateOfBirth.split('T')[0])
                        : person.age || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {person.gender ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${person.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {person.gender}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {person.villageTown ? (
                        <button
                          onClick={() => setSelectedVillage(person.villageTown.trim())}
                          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
                        >
                          <MapPin className="h-3.5 w-3.5" />{person.villageTown}
                        </button>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{person.district || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{person.phone || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {person.nextOfKinName
                        ? <span title={`${person.nextOfKinRelationship || ''} · ${person.nextOfKinPhone || ''}`}>{person.nextOfKinName}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(person)} className="text-emerald-600 hover:text-emerald-900 mr-3">Edit</button>
                      <button onClick={() => handleDelete(person.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: isFiltered ? 'Filtered' : 'Total', value: filteredPeople.length, color: 'emerald', sub: isFiltered ? `${people.length} total` : null },
          { label: 'Avg Age', value: filteredPeople.length ? Math.round(filteredPeople.reduce((s, p) => s + Number(p.dateOfBirth ? calculateAge(p.dateOfBirth.split('T')[0]) : (p.age || 0)), 0) / filteredPeople.length) : 0, color: 'blue' },
          { label: 'Male',   value: filteredPeople.filter(p => p.gender === 'Male').length,   color: 'indigo' },
          { label: 'Female', value: filteredPeople.filter(p => p.gender === 'Female').length, color: 'pink' },
          ...ALL_CATEGORIES.map(cat => ({
            label: cat.label,
            value: filteredPeople.filter(p => (p.categories || []).includes(cat.value)).length,
            color: cat.color,
            icon:  cat.icon,
          })),
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
            <div className="text-xs text-gray-500 truncate">{stat.icon ? `${stat.icon} ` : ''}{stat.label}</div>
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            {stat.sub && <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>}
          </div>
        ))}
      </div>

    </div>
  )
}