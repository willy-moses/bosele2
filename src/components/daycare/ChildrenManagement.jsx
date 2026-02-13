'use client'
import { useState, useEffect, useCallback } from 'react'
import { Baby, Search, Plus, RefreshCw, Edit2, Trash2, X, FileDown } from 'lucide-react'
import AddChildForm from './AddChildForm'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  const map = {
    active:   'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
    pending:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  const s = status?.toLowerCase() || 'active'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[s] ?? map.active}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="col-span-1">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-semibold text-amber-900">{value || '—'}</p>
    </div>
  )
}

function DetailRowFull({ label, value }) {
  return (
    <div className="col-span-2">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-semibold text-amber-900">{value || '—'}</p>
    </div>
  )
}

export default function ChildrenManagement() {
  const [view, setView]         = useState('list')
  const [children, setChildren] = useState([])
  const [loading, setLoading]   = useState(true)
  const [searchTerm, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [editingChild, setEditingChild] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const fetchChildren = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daycare/children')
      const data = await res.json()
      setChildren(data.children || data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchChildren() }, [fetchChildren])

  const handleEdit = (child) => {
    setEditingChild(child)
    setView('edit')
    setSelected(null)
  }

  const handleDelete = async (childId) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/daycare/children?id=${childId}`, { method: 'DELETE' })
      if (res.ok) {
        window.dispatchEvent(new Event('notificationUpdate'))
        await fetchChildren()
        setDeleteConfirm(null)
        setSelected(null)
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to delete child')
      }
    } catch {
      alert('Network error — please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Export PDF ────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (children.length === 0) return
    setExportingPdf(true)
    try {
      const res = await fetch('/api/daycare/children/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ children }),
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
      a.download = `children-register-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Network error — please try again.')
    } finally {
      setExportingPdf(false)
    }
  }

  const filtered = children.filter(c => {
    const q = searchTerm.toLowerCase()
    return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
           `${c.parentFirstName} ${c.parentLastName}`.toLowerCase().includes(q)
  })

  if (view === 'add') {
    return (
      <AddChildForm
        onCancel={() => setView('list')}
        onSuccess={() => { fetchChildren(); setView('list') }}
      />
    )
  }

  if (view === 'edit') {
    return (
      <AddChildForm
        editChild={editingChild}
        onCancel={() => { setView('list'); setEditingChild(null) }}
        onSuccess={() => { fetchChildren(); setView('list'); setEditingChild(null) }}
      />
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100">
      {/* Header */}
      <div className="p-6 border-b border-amber-100">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-amber-900">
              Enrolled Children
              {!loading && <span className="ml-2 text-base font-normal text-amber-500">({children.length})</span>}
            </h2>
            <p className="text-sm text-amber-600 mt-0.5">All registered children at the day care</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text" placeholder="Search by name or parent…"
                value={searchTerm} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-56"
              />
            </div>
            <button onClick={fetchChildren} disabled={loading} title="Refresh"
              className="p-2 border border-amber-200 rounded-lg text-amber-600 hover:bg-amber-50 transition disabled:opacity-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export PDF button */}
            <button
              onClick={handleExportPdf}
              disabled={exportingPdf || children.length === 0}
              title="Export children register as PDF"
              className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg text-sm font-semibold hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingPdf ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
              ) : (
                <><FileDown className="h-4 w-4" /> Export PDF</>
              )}
            </button>

            <button onClick={() => setView('add')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:from-amber-600 hover:to-orange-600 transition">
              <Plus className="h-4 w-4" />
              Add Child
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-amber-600 text-sm">Loading children…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Baby className="h-14 w-14 text-amber-200 mx-auto mb-3" />
            <p className="text-amber-700 font-medium">
              {searchTerm ? 'No children match your search' : 'No enrolled children yet'}
            </p>
            {!searchTerm && (
              <button onClick={() => setView('add')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition">
                <Plus className="h-4 w-4" /> Register First Child
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-amber-100 text-left">
                  {['Name', 'DOB', 'Class', 'Parent', 'Contact', 'District', 'Status', 'Actions'].map(h => (
                    <th key={h} className="pb-3 px-3 text-xs font-semibold text-amber-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map(child => (
                  <tr key={child.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-amber-800 font-bold text-xs shrink-0">
                          {child.firstName?.[0]}{child.lastName?.[0]}
                        </div>
                        <span className="font-medium text-amber-900 whitespace-nowrap">
                          {child.firstName} {child.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{formatDate(child.dateOfBirth)}</td>
                    <td className="py-3 px-3 text-gray-600">{child.class || '—'}</td>
                    <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{child.parentFirstName} {child.parentLastName}</td>
                    <td className="py-3 px-3 text-gray-600">{child.parentPhone}</td>
                    <td className="py-3 px-3 text-gray-600">{child.district || '—'}</td>
                    <td className="py-3 px-3"><StatusBadge status={child.status} /></td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(child)}
                          className="text-amber-600 hover:text-amber-900 font-medium text-xs whitespace-nowrap">
                          View
                        </button>
                        <button onClick={() => handleEdit(child)} title="Edit"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirm(child)} title="Delete"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Child detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-5 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg">
                  {selected.firstName?.[0]}{selected.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.firstName} {selected.lastName}</h3>
                  <p className="text-amber-100 text-xs">{selected.class || 'No class assigned'}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div>
                <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-amber-100">
                  <Baby className="h-4 w-4" /> Child Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Surname" value={selected.lastName} />
                  <DetailRow label="First Name(s)" value={selected.firstName} />
                  <DetailRow label="Nickname" value={selected.nickname} />
                  <DetailRow label="Gender" value={selected.gender} />
                  <DetailRow label="Date of Birth" value={formatDate(selected.dateOfBirth)} />
                  <DetailRow label="Age" value={selected.age ? `${selected.age} years` : '—'} />
                  <DetailRow label="Class / Group" value={selected.class} />
                  <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-pink-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-pink-100">
                  Registration Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Village / Town" value={selected.villageTown} />
                  <DetailRow label="District" value={selected.district} />
                  <DetailRow label="Evidence of Birthdate" value={selected.registerData?.evidenceOfBirthdate} />
                  <DetailRow label="Date of Admission" value={formatDate(selected.registerData?.admissionDate || selected.enrollmentDate)} />
                  <DetailRowFull label="Postal Address" value={selected.registerData?.postalAddress} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-blue-100">
                  Parent / Guardian Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="First Name" value={selected.parentFirstName} />
                  <DetailRow label="Last Name" value={selected.parentLastName} />
                  <DetailRow label="Email" value={selected.parentEmail} />
                  <DetailRow label="Cellphone" value={selected.parentPhone} />
                  <DetailRowFull label="Residential Address" value={selected.address} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-orange-100">
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Contact Name" value={selected.emergencyContact} />
                  <DetailRow label="Contact Phone" value={selected.emergencyPhone} />
                  <DetailRow label="Relationship" value={selected.emergencyContactRelationship} />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-red-100">
                  Medical Information
                </h4>
                <div className="space-y-3">
                  {selected.allergies && selected.allergies.trim() !== '' ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Allergies</p>
                      <div className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100">
                        {selected.allergies.split('; ').map((allergy, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">•</span>
                            <span>{allergy}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Allergies</p>
                      <div className="bg-green-50 text-green-800 text-sm p-3 rounded-lg border border-green-100">
                        No known allergies
                      </div>
                    </div>
                  )}
                  {selected.medicalInfo && selected.medicalInfo.trim() !== '' ? (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Other Medical Notes / Conditions</p>
                      <div className="bg-amber-50 text-amber-900 text-sm p-3 rounded-lg border border-amber-100 whitespace-pre-wrap">
                        {selected.medicalInfo}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Other Medical Notes / Conditions</p>
                      <div className="bg-gray-50 text-gray-600 text-sm p-3 rounded-lg border border-gray-100">
                        No additional medical notes
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                  System Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Child ID" value={selected.id} />
                  <DetailRow label="Created Date" value={formatDate(selected.createdAt)} />
                  <DetailRow label="Last Updated" value={formatDate(selected.updatedAt)} />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-amber-100 flex justify-between bg-white sticky bottom-0 rounded-b-2xl">
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selected)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition">
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(selected)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
              <button onClick={() => setSelected(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Delete Child Record</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
                  All associated records will be permanently removed.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm.id)} disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                  {deleting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Deleting…</>
                  ) : (
                    <><Trash2 className="h-4 w-4" /> Delete Permanently</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}