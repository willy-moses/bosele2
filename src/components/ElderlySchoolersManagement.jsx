'use client'
import { useState, useEffect, useMemo } from 'react'
import { FileDown, RefreshCw, MapPin, Users, Filter, X } from 'lucide-react'

export default function ElderlySchoolersManagement() {
  const [schoolers, setSchoolers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingVillagePdf, setExportingVillagePdf] = useState(false)
  const [selectedVillage, setSelectedVillage] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    idNumber: '',
    villageTown: '',
    guardianName: '',
    guardianContact: '',
    medicalInfo: '',
    notes: ''
  })

  useEffect(() => {
    fetchSchoolers()
  }, [])

  const fetchSchoolers = async () => {
    try {
      const res = await fetch('/api/elderly-schoolers')
      const data = await res.json()
      const mappedSchoolers = (data.schoolers || []).map(schooler => ({
        id: schooler.id,
        name: schooler.name,
        age: schooler.age,
        grade: schooler.grade,
        idNumber: schooler.id_number,
        villageTown: schooler.village_town,
        guardianName: schooler.guardian_name,
        guardianContact: schooler.guardian_contact,
        medicalInfo: schooler.medical_info,
        notes: schooler.notes,
        createdAt: schooler.created_at,
        updatedAt: schooler.updated_at
      }))
      setSchoolers(mappedSchoolers)
    } catch (error) {
      console.error('❌ Error fetching schoolers:', error)
    } finally {
      setLoading(false)
    }
  }

  // ── Derived: unique villages ──────────────────────────────────
  const villages = useMemo(() => {
    const set = new Set(
      schoolers
        .map(s => s.villageTown?.trim())
        .filter(Boolean)
    )
    return Array.from(set).sort()
  }, [schoolers])

  // ── Derived: filtered list ────────────────────────────────────
  const filteredSchoolers = useMemo(() => {
    if (selectedVillage === 'all') return schoolers
    return schoolers.filter(
      s => s.villageTown?.trim() === selectedVillage
    )
  }, [schoolers, selectedVillage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/elderly-schoolers/${editingId}` : '/api/elderly-schoolers'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await res.json()
      if (res.ok) {
        fetchSchoolers()
        resetForm()
        setShowAddForm(false)
      } else {
        alert(result.error || 'Failed to save schooler')
      }
    } catch (error) {
      alert('An error occurred while saving')
    }
  }

  const handleEdit = (schooler) => {
    setFormData({
      name: schooler.name,
      age: schooler.age.toString(),
      grade: schooler.grade,
      idNumber: schooler.idNumber || '',
      villageTown: schooler.villageTown || '',
      guardianName: schooler.guardianName || '',
      guardianContact: schooler.guardianContact || '',
      medicalInfo: schooler.medicalInfo || '',
      notes: schooler.notes || ''
    })
    setEditingId(schooler.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schooler?')) return
    try {
      const res = await fetch(`/api/elderly-schoolers/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (res.ok) {
        fetchSchoolers()
      } else {
        alert(result.error || 'Failed to delete schooler')
      }
    } catch (error) {
      alert('An error occurred while deleting')
    }
  }

  // ── Export ALL as PDF ─────────────────────────────────────────
  const handleExportPdf = async () => {
    if (schoolers.length === 0) return
    setExportingPdf(true)
    await triggerPdfDownload(schoolers, 'all-elderly-schoolers')
    setExportingPdf(false)
  }

  // ── Export FILTERED (by village) as PDF ──────────────────────
  const handleExportVillagePdf = async () => {
    if (filteredSchoolers.length === 0) return
    setExportingVillagePdf(true)
    const label = selectedVillage === 'all'
      ? 'all-villages'
      : selectedVillage.toLowerCase().replace(/\s+/g, '-')
    await triggerPdfDownload(filteredSchoolers, `elderly-schoolers-${label}`)
    setExportingVillagePdf(false)
  }

  // ── Shared PDF trigger ────────────────────────────────────────
  const triggerPdfDownload = async (data, filename) => {
    try {
      const res = await fetch('/api/elderly-schoolers/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolers: data }),
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
      name: '',
      age: '',
      grade: '',
      idNumber: '',
      villageTown: '',
      guardianName: '',
      guardianContact: '',
      medicalInfo: '',
      notes: ''
    })
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  const isFiltered = selectedVillage !== 'all'

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Elderly Schoolers</h2>
          <p className="text-gray-600 mt-1">Manage elderly schooler registrations and information</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export ALL PDF */}
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || schoolers.length === 0}
            title="Export all schoolers as PDF"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
            ) : (
              <><FileDown className="h-4 w-4" /> Export All PDF</>
            )}
          </button>

          {/* Add Schooler */}
          <button
            onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm() }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            {showAddForm ? 'Cancel' : '+ Add Schooler'}
          </button>
        </div>
      </div>

      {/* ── Village Filter Bar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mr-1">
            <Filter className="h-4 w-4 text-emerald-500" />
            Filter by Village:
          </div>

          {/* All button */}
          <button
            onClick={() => setSelectedVillage('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedVillage === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            All ({schoolers.length})
          </button>

          {/* Per-village pill buttons */}
          {villages.map(village => {
            const count = schoolers.filter(s => s.villageTown?.trim() === village).length
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

          {/* Export filtered / current view PDF */}
          <div className="ml-auto">
            <button
              onClick={handleExportVillagePdf}
              disabled={exportingVillagePdf || filteredSchoolers.length === 0}
              title={isFiltered ? `Export PDF for ${selectedVillage}` : 'Export PDF for current view'}
              className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingVillagePdf ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  {isFiltered ? `Export "${selectedVillage}" PDF` : 'Export View PDF'}
                  <span className="ml-1 bg-emerald-200 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {filteredSchoolers.length}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active filter badge */}
        {isFiltered && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Showing:</span>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <MapPin className="h-3 w-3" />
              {selectedVillage}
              <button
                onClick={() => setSelectedVillage('all')}
                className="ml-1 hover:text-emerald-900"
                title="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
            <span className="text-xs text-gray-500">{filteredSchoolers.length} of {schoolers.length} schoolers</span>
          </div>
        )}
      </div>

      {/* ── Add/Edit Form ── */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-emerald-500">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Schooler' : 'Add New Schooler'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                <input
                  type="number" required min="1" value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter age"
                />
                <p className="text-xs text-gray-500 mt-1">For learners who didn't have the chance to attend school earlier (30+)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade/Level *</label>
                <input
                  type="text" required value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Beginner, Intermediate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text" value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="National ID / Omang number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village / Town</label>
                <input
                  type="text" value={formData.villageTown}
                  onChange={(e) => setFormData({ ...formData, villageTown: e.target.value })}
                  list="village-suggestions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Gaborone, Maun..."
                />
                {/* Autocomplete from existing villages */}
                <datalist id="village-suggestions">
                  {villages.map(v => <option key={v} value={v} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guardian/Emergency Contact Name</label>
                <input
                  type="text" value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Contact Number</label>
                <input
                  type="tel" value={formData.guardianContact}
                  onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Can be added later"
                />
                <p className="text-xs text-gray-500 mt-1">Optional - Can be provided when available</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                <input
                  type="text" value={formData.medicalInfo}
                  onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Allergies, conditions, medications..."
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Any additional information..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); resetForm() }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                {editingId ? 'Update Schooler' : 'Add Schooler'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Schoolers Table ── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredSchoolers.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {isFiltered ? `No schoolers in "${selectedVillage}"` : 'No schoolers'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isFiltered ? (
                <button onClick={() => setSelectedVillage('all')} className="text-emerald-600 underline">
                  Clear filter
                </button>
              ) : (
                'Get started by adding a new elderly schooler.'
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'Name', 'Age', 'Grade', 'ID Number', 'Village / Town', 'Guardian', 'Contact', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchoolers.map((schooler, idx) => (
                  <tr key={schooler.id} className="hover:bg-gray-50">

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{idx + 1}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{schooler.name}</div>
                      {schooler.medicalInfo && (
                        <div className="text-xs text-red-600 mt-1">⚕️ Medical Info</div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schooler.age}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {schooler.grade}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {schooler.idNumber || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Clickable village — sets filter */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {schooler.villageTown ? (
                        <button
                          onClick={() => setSelectedVillage(schooler.villageTown.trim())}
                          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-900 hover:underline"
                          title={`Filter by ${schooler.villageTown}`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          {schooler.villageTown}
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schooler.guardianName || <span className="text-gray-300">—</span>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schooler.guardianContact || <span className="text-gray-300">—</span>}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEdit(schooler)} className="text-emerald-600 hover:text-emerald-900 mr-4">Edit</button>
                      <button onClick={() => handleDelete(schooler.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">
            {isFiltered ? `Schoolers in "${selectedVillage}"` : 'Total Schoolers'}
          </div>
          <div className="text-2xl font-bold text-emerald-600">{filteredSchoolers.length}</div>
          {isFiltered && (
            <div className="text-xs text-gray-400 mt-1">{schoolers.length} total across all villages</div>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Average Age</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredSchoolers.length > 0
              ? Math.round(filteredSchoolers.reduce((sum, s) => sum + s.age, 0) / filteredSchoolers.length)
              : 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">With Medical Info</div>
          <div className="text-2xl font-bold text-orange-600">
            {filteredSchoolers.filter(s => s.medicalInfo).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Villages / Towns</div>
          <div className="text-2xl font-bold text-purple-600">{villages.length}</div>
        </div>
      </div>

    </div>
  )
}