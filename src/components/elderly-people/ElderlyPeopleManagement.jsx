'use client'
import { useState, useEffect, useMemo } from 'react'
import { FileDown, RefreshCw, MapPin, Users, Filter, X, Search } from 'lucide-react'

export default function ElderlyPeopleManagement() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingVillagePdf, setExportingVillagePdf] = useState(false)
  const [selectedVillage, setSelectedVillage] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    villageTown: '',
    district: '',
    address: '',
    phone: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    medicalInfo: '',
    notes: '',
  })

  useEffect(() => {
    fetchPeople()
  }, [])

  const fetchPeople = async () => {
    try {
      const res = await fetch('/api/elderly-people')
      const data = await res.json()
      setPeople(data.people || [])
    } catch (error) {
      console.error('❌ Error fetching elderly people:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Unique villages ───────────────────────────────────────────
  const villages = useMemo(() => {
    const set = new Set(
      people.map(p => p.villageTown?.trim()).filter(Boolean)
    )
    return Array.from(set).sort()
  }, [people])

  // ── Filtered + searched list ──────────────────────────────────
  const filteredPeople = useMemo(() => {
    let list = people
    if (selectedVillage !== 'all') {
      list = list.filter(p => p.villageTown?.trim() === selectedVillage)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.idNumber?.toLowerCase().includes(q) ||
        p.villageTown?.toLowerCase().includes(q)
      )
    }
    return list
  }, [people, selectedVillage, searchQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/elderly-people/${editingId}` : '/api/elderly-people'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
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
    setFormData({
      firstName:             person.firstName || '',
      lastName:              person.lastName || '',
      idNumber:              person.idNumber || '',
      dateOfBirth:           person.dateOfBirth ? person.dateOfBirth.split('T')[0] : '',
      age:                   person.age?.toString() || '',
      gender:                person.gender || '',
      villageTown:           person.villageTown || '',
      district:              person.district || '',
      address:               person.address || '',
      phone:                 person.phone || '',
      nextOfKinName:         person.nextOfKinName || '',
      nextOfKinPhone:        person.nextOfKinPhone || '',
      nextOfKinRelationship: person.nextOfKinRelationship || '',
      medicalInfo:           person.medicalInfo || '',
      notes:                 person.notes || '',
    })
    setEditingId(person.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    try {
      const res = await fetch(`/api/elderly-people/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (res.ok) {
        fetchPeople()
      } else {
        alert(result.error || 'Failed to delete record')
      }
    } catch {
      alert('An error occurred while deleting')
    }
  }

  // ── PDF helpers ───────────────────────────────────────────────
  const handleExportAllPdf = async () => {
    if (!people.length) return
    setExportingPdf(true)
    await triggerPdfDownload(people, 'all-elderly-people')
    setExportingPdf(false)
  }

  const handleExportVillagePdf = async () => {
    if (!filteredPeople.length) return
    setExportingVillagePdf(true)
    const label = selectedVillage === 'all'
      ? 'all-villages'
      : selectedVillage.toLowerCase().replace(/\s+/g, '-')
    await triggerPdfDownload(filteredPeople, `elderly-people-${label}`)
    setExportingVillagePdf(false)
  }

  const triggerPdfDownload = async (data, filename) => {
    try {
      const res = await fetch('/api/elderly-people/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people: data }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to export PDF')
        return
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Network error — please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', idNumber: '', dateOfBirth: '', age: '',
      gender: '', villageTown: '', district: '', address: '', phone: '',
      nextOfKinName: '', nextOfKinPhone: '', nextOfKinRelationship: '',
      medicalInfo: '', notes: '',
    })
    setEditingId(null)
  }

  const isFiltered = selectedVillage !== 'all'

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
          <h2 className="text-2xl font-bold text-gray-900">Elderly People Registry</h2>
          <p className="text-gray-600 mt-1">Village elderly residents — records and information</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportAllPdf}
            disabled={exportingPdf || !people.length}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
              : <><FileDown className="h-4 w-4" /> Export All PDF</>}
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm() }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            {showAddForm ? 'Cancel' : '+ Add Person'}
          </button>
        </div>
      </div>

      {/* ── Village Filter + Search Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or village…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Village pills + Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mr-1">
            <Filter className="h-4 w-4 text-emerald-500" />
            Filter by Village:
          </div>

          <button
            onClick={() => setSelectedVillage('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedVillage === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            All ({people.length})
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

          {villages.length === 0 && (
            <span className="text-sm text-gray-400 italic">No villages recorded yet</span>
          )}

          <div className="ml-auto">
            <button
              onClick={handleExportVillagePdf}
              disabled={exportingVillagePdf || !filteredPeople.length}
              className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingVillagePdf
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
                : <>
                    <FileDown className="h-4 w-4" />
                    {isFiltered ? `Export "${selectedVillage}" PDF` : 'Export View PDF'}
                    <span className="ml-1 bg-emerald-200 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {filteredPeople.length}
                    </span>
                  </>}
            </button>
          </div>
        </div>

        {/* Active filter badge */}
        {isFiltered && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              {selectedVillage}
              <button onClick={() => setSelectedVillage('all')} className="ml-1 hover:text-emerald-900">
                <X className="h-3 w-3" />
              </button>
            </span>
            <span className="text-xs text-gray-500">{filteredPeople.length} of {people.length} people</span>
          </div>
        )}
      </div>

      {/* ── Add / Edit Form ── */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-emerald-500">
          <h3 className="text-xl font-semibold mb-5">
            {editingId ? 'Edit Record' : 'Add New Elderly Person'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number (Omang)</label>
                  <input type="text" value={formData.idNumber}
                    onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="National ID / Omang" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" min="0" value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Age" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
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
              <h4 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Health & Notes</h4>
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
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold">
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
                ? <button onClick={() => { setSelectedVillage('all'); setSearchQuery('') }} className="text-emerald-600 underline">Clear filters</button>
                : 'Get started by adding an elderly person.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Full Name', 'ID Number', 'Age', 'Gender', 'Village / Town', 'District', 'Phone', 'Next of Kin', 'Actions'].map(h => (
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
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{person.idNumber || <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{person.age || <span className="text-gray-300">—</span>}</td>
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
                          title={`Filter by ${person.villageTown}`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {person.villageTown}
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: isFiltered ? `In "${selectedVillage}"` : 'Total Registered', value: filteredPeople.length, color: 'emerald', sub: isFiltered ? `${people.length} total` : null },
          { label: 'Average Age', value: filteredPeople.length ? Math.round(filteredPeople.reduce((s, p) => s + Number(p.age || 0), 0) / filteredPeople.length) : 0, color: 'blue' },
          { label: 'Male', value: filteredPeople.filter(p => p.gender === 'Male').length, color: 'indigo' },
          { label: 'Female', value: filteredPeople.filter(p => p.gender === 'Female').length, color: 'pink' },
          { label: 'Villages / Towns', value: villages.length, color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
            <div className="text-xs text-gray-500 truncate">{stat.label}</div>
            <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
            {stat.sub && <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>}
          </div>
        ))}
      </div>

    </div>
  )
}