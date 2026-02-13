'use client'
import { useState, useEffect } from 'react'
import { FileDown, RefreshCw } from 'lucide-react'

export default function ElderlySchoolersManagement() {
  const [schoolers, setSchoolers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
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

  // ── Export PDF ────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (schoolers.length === 0) return
    setExportingPdf(true)
    try {
      const res = await fetch('/api/elderly-schoolers/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolers }),
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
      a.download = `elderly-schoolers-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Network error — please try again.')
    } finally {
      setExportingPdf(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', age: '', grade: '', guardianName: '', guardianContact: '', medicalInfo: '', notes: '' })
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Elderly Schoolers</h2>
          <p className="text-gray-600 mt-1">Manage elderly schooler registrations and information</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Export PDF button */}
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || schoolers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
            ) : (
              <><FileDown className="h-4 w-4" /> Export PDF</>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Schooler'}
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-emerald-500">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Schooler' : 'Add New Schooler'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                <input type="number" required min="1" value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter age" />
                <p className="text-xs text-gray-500 mt-1">For learners who didn't have the chance to attend school earlier (30+)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade/Level *</label>
                <input type="text" required value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Beginner, Intermediate" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guardian/Emergency Contact Name</label>
                <input type="text" value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Guardian Contact Number</label>
                <input type="tel" value={formData.guardianContact}
                  onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Can be added later" />
                <p className="text-xs text-gray-500 mt-1">Optional - Can be provided when available</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                <input type="text" value={formData.medicalInfo}
                  onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Allergies, conditions, medications..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Any additional information..." />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowAddForm(false); resetForm() }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                {editingId ? 'Update Schooler' : 'Add Schooler'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schoolers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {schoolers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schoolers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new elderly schooler.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Age', 'Grade', 'Guardian', 'Contact', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schoolers.map((schooler) => (
                  <tr key={schooler.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schooler.guardianName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schooler.guardianContact || '-'}</td>
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Schoolers</div>
          <div className="text-2xl font-bold text-emerald-600">{schoolers.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Average Age</div>
          <div className="text-2xl font-bold text-blue-600">
            {schoolers.length > 0
              ? Math.round(schoolers.reduce((sum, s) => sum + s.age, 0) / schoolers.length)
              : 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">With Medical Info</div>
          <div className="text-2xl font-bold text-orange-600">
            {schoolers.filter(s => s.medicalInfo).length}
          </div>
        </div>
      </div>
    </div>
  )
}