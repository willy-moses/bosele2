'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Baby, Search, Plus, RefreshCw, Edit2, Trash2, X,
  FileDown, GraduationCap, AlertTriangle, Calendar
} from 'lucide-react'
import AddChildForm from './AddChildForm'

// ─── Constants ────────────────────────────────────────────────────────────────
const TERMS = ['Term 1', 'Term 2', 'Term 3']

/** Age in decimal years from a DOB string */
function ageInYears(dob) {
  if (!dob) return null
  const diff = Date.now() - new Date(dob).getTime()
  return diff / (1000 * 60 * 60 * 24 * 365.25)
}

/** Returns true when child is ≥ 5 years → ready to graduate */
function isGraduationAge(dob) {
  const age = ageInYears(dob)
  return age !== null && age >= 5
}

/** Returns true when child is below 2 years 6 months → too young */
function isTooYoung(dob) {
  const age = ageInYears(dob)
  return age !== null && age < 2.5
}

/** Human-readable age string, e.g. "3 yrs 4 mo" */
function ageLabel(dob) {
  if (!dob) return '—'
  const totalMonths = Math.floor(ageInYears(dob) * 12)
  const yrs = Math.floor(totalMonths / 12)
  const mos = totalMonths % 12
  if (yrs === 0) return `${mos} mo`
  if (mos === 0) return `${yrs} yr${yrs > 1 ? 's' : ''}`
  return `${yrs} yr${yrs > 1 ? 's' : ''} ${mos} mo`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function enrollmentYear(child) {
  if (child.enrollmentYear) return child.enrollmentYear
  if (child.enrollmentDate) return new Date(child.enrollmentDate).getFullYear()
  if (child.createdAt)      return new Date(child.createdAt).getFullYear()
  return '—'
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

/** Small pill showing the term the child was enrolled in */
function TermBadge({ term }) {
  if (!term) return <span className="text-gray-400 text-xs italic">—</span>
  const colors = {
    'Term 1': 'bg-blue-100 text-blue-800 border-blue-200',
    'Term 2': 'bg-purple-100 text-purple-800 border-purple-200',
    'Term 3': 'bg-orange-100 text-orange-800 border-orange-200',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[term] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {term}
    </span>
  )
}

/** Graduation badge shown when child turns 5 */
function GraduationBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
      <GraduationCap className="h-3 w-3" />
      Ready to Graduate
    </span>
  )
}

/** Warning badge for under-age children */
function TooYoungBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
      <AlertTriangle className="h-3 w-3" />
      Under Age
    </span>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="col-span-1">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="font-semibold text-amber-900">{value || '—'}</div>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChildrenManagement() {
  const [view, setView]               = useState('list')
  const [children, setChildren]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [searchTerm, setSearch]       = useState('')
  const [selected, setSelected]       = useState(null)
  const [editingChild, setEditingChild] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  // Filter controls
  const [filterYear, setFilterYear]   = useState('')
  const [filterTerm, setFilterTerm]   = useState('')
  const [filterAge, setFilterAge]     = useState('all') // 'all' | 'normal' | 'graduate' | 'young'

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

  // Derive the unique enrollment years present in data
  const allYears = [...new Set(
    children.map(c => enrollmentYear(c)).filter(y => y !== '—')
  )].sort((a, b) => b - a)

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

  // ── Filtering ─────────────────────────────────────────────────
  const filtered = children.filter(c => {
    const q = searchTerm.toLowerCase()
    const nameMatch =
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      `${c.parentFirstName} ${c.parentLastName}`.toLowerCase().includes(q)

    const yearMatch  = filterYear ? String(enrollmentYear(c)) === String(filterYear) : true
    const termMatch  = filterTerm ? c.term === filterTerm : true

    let ageMatch = true
    if (filterAge === 'graduate') ageMatch = isGraduationAge(c.dateOfBirth)
    if (filterAge === 'young')    ageMatch = isTooYoung(c.dateOfBirth)
    if (filterAge === 'normal')   ageMatch = !isGraduationAge(c.dateOfBirth) && !isTooYoung(c.dateOfBirth)

    return nameMatch && yearMatch && termMatch && ageMatch
  })

  // Summary counts
  const graduateCount = children.filter(c => isGraduationAge(c.dateOfBirth)).length
  const youngCount    = children.filter(c => isTooYoung(c.dateOfBirth)).length

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

      {/* ── Header ── */}
      <div className="p-6 border-b border-amber-100">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-amber-900">
              Enrolled Children
              {!loading && (
                <span className="ml-2 text-base font-normal text-amber-500">({children.length})</span>
              )}
            </h2>
            <p className="text-sm text-amber-600 mt-0.5">
              Age range: <strong>2½ – 5 years</strong> &nbsp;·&nbsp;
              Graduates to primary school at age 5
            </p>
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

            <button
              onClick={handleExportPdf}
              disabled={exportingPdf || children.length === 0}
              title="Export children register as PDF"
              className="inline-flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg text-sm font-semibold hover:bg-amber-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportingPdf
                ? <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting…</>
                : <><FileDown className="h-4 w-4" /> Export PDF</>}
            </button>

            <button onClick={() => setView('add')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-sm hover:from-amber-600 hover:to-orange-600 transition">
              <Plus className="h-4 w-4" /> Add Child
            </button>
          </div>
        </div>

        {/* ── Alert banners ── */}
        {graduateCount > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <GraduationCap className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{graduateCount} child{graduateCount > 1 ? 'ren are' : ' is'}</strong> aged 5 or older and{' '}
              <span className="font-semibold">ready to graduate</span> to primary school.
            </p>
            <button
              onClick={() => setFilterAge(filterAge === 'graduate' ? 'all' : 'graduate')}
              className={`ml-auto text-xs px-3 py-1 rounded-lg font-semibold transition border ${
                filterAge === 'graduate'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {filterAge === 'graduate' ? 'Show All' : 'View'}
            </button>
          </div>
        )}

        {youngCount > 0 && (
          <div className="mt-2 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-800">
              <strong>{youngCount} child{youngCount > 1 ? 'ren are' : ' is'}</strong> under 2½ years old — below the minimum enrolment age.
            </p>
            <button
              onClick={() => setFilterAge(filterAge === 'young' ? 'all' : 'young')}
              className={`ml-auto text-xs px-3 py-1 rounded-lg font-semibold transition border ${
                filterAge === 'young'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-red-700 border-red-300 hover:bg-red-100'
              }`}
            >
              {filterAge === 'young' ? 'Show All' : 'View'}
            </button>
          </div>
        )}

        {/* ── Filters row ── */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter:</span>

          {/* Year enrolled */}
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="text-sm border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
          >
            <option value="">All Years</option>
            {allYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Term */}
          <select
            value={filterTerm}
            onChange={e => setFilterTerm(e.target.value)}
            className="text-sm border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
          >
            <option value="">All Terms</option>
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Age group */}
          <select
            value={filterAge}
            onChange={e => setFilterAge(e.target.value)}
            className="text-sm border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
          >
            <option value="all">All Ages</option>
            <option value="normal">Normal (2½–5 yrs)</option>
            <option value="graduate">Ready to Graduate (5+)</option>
            <option value="young">Under Age (&lt;2½)</option>
          </select>

          {(filterYear || filterTerm || filterAge !== 'all') && (
            <button
              onClick={() => { setFilterYear(''); setFilterTerm(''); setFilterAge('all') }}
              className="text-xs text-gray-500 hover:text-red-600 underline"
            >
              Clear filters
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400">
            Showing {filtered.length} of {children.length}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
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
                  {[
                    'Name', 'DOB / Age', 'Class',
                    'Year Enrolled', 'Term',
                    'Parent', 'Contact', 'Status', 'Actions'
                  ].map(h => (
                    <th key={h} className="pb-3 px-3 text-xs font-semibold text-amber-800 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filtered.map(child => {
                  const grad  = isGraduationAge(child.dateOfBirth)
                  const young = isTooYoung(child.dateOfBirth)
                  return (
                    <tr
                      key={child.id}
                      className={`hover:bg-amber-50/50 transition-colors ${grad ? 'bg-amber-50/30' : ''} ${young ? 'bg-red-50/20' : ''}`}
                    >
                      {/* Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            grad  ? 'bg-amber-200 text-amber-800' :
                            young ? 'bg-red-100 text-red-700' :
                                    'bg-gradient-to-br from-amber-200 to-orange-200 text-amber-800'
                          }`}>
                            {child.firstName?.[0]}{child.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-medium text-amber-900 whitespace-nowrap">
                              {child.firstName} {child.lastName}
                            </span>
                            {grad  && <div className="mt-0.5"><GraduationBadge /></div>}
                            {young && <div className="mt-0.5"><TooYoungBadge /></div>}
                          </div>
                        </div>
                      </td>

                      {/* DOB / Age */}
                      <td className="py-3 px-3 text-gray-600">
                        <div className="whitespace-nowrap">{formatDate(child.dateOfBirth)}</div>
                        <div className={`text-xs font-semibold mt-0.5 ${
                          grad  ? 'text-amber-600' :
                          young ? 'text-red-600' :
                                  'text-gray-400'
                        }`}>
                          {ageLabel(child.dateOfBirth)}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-gray-600">{child.class || '—'}</td>

                      {/* Year Enrolled */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-gray-700 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-amber-400" />
                          {enrollmentYear(child)}
                        </span>
                      </td>

                      {/* Term */}
                      <td className="py-3 px-3"><TermBadge term={child.term} /></td>

                      {/* Parent */}
                      <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                        {child.parentFirstName} {child.parentLastName}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3 text-gray-600">{child.parentPhone}</td>

                      {/* Status */}
                      <td className="py-3 px-3"><StatusBadge status={child.status} /></td>

                      {/* Actions */}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Child detail modal ── */}
      {selected && (() => {
        const grad  = isGraduationAge(selected.dateOfBirth)
        const young = isTooYoung(selected.dateOfBirth)
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              {/* Modal header */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-5 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg">
                    {selected.firstName?.[0]}{selected.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{selected.firstName} {selected.lastName}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-amber-100 text-xs">{selected.class || 'No class assigned'}</p>
                      {grad  && <GraduationBadge />}
                      {young && <TooYoungBadge />}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Graduation / age warning banner inside modal */}
              {grad && (
                <div className="mx-6 mt-4 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4">
                  <GraduationCap className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Ready to Graduate</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {selected.firstName} is {ageLabel(selected.dateOfBirth)} old and has reached the age for
                      promotion to <strong>primary school</strong>. Consider updating their status.
                    </p>
                  </div>
                </div>
              )}
              {young && (
                <div className="mx-6 mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Under Minimum Age</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {selected.firstName} is {ageLabel(selected.dateOfBirth)} old. The minimum enrolment age
                      is <strong>2 years 6 months</strong>.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">

                {/* Child info */}
                <div>
                  <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-amber-100">
                    <Baby className="h-4 w-4" /> Child Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Surname"        value={selected.lastName} />
                    <DetailRow label="First Name(s)"  value={selected.firstName} />
                    <DetailRow label="Nickname"       value={selected.nickname} />
                    <DetailRow label="Gender"         value={selected.gender} />
                    <DetailRow label="Date of Birth"  value={formatDate(selected.dateOfBirth)} />
                    <DetailRow label="Age"            value={ageLabel(selected.dateOfBirth)} />
                    <DetailRow label="Class / Group"  value={selected.class} />
                    <DetailRow label="Status"         value={<StatusBadge status={selected.status} />} />
                  </div>
                </div>

                {/* Enrollment details — NEW section */}
                <div>
                  <h4 className="text-sm font-bold text-teal-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-teal-100">
                    <Calendar className="h-4 w-4" /> Enrolment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow
                      label="Year Enrolled"
                      value={<span className="font-semibold text-amber-900">{enrollmentYear(selected)}</span>}
                    />
                    <DetailRow
                      label="Term Enrolled"
                      value={<TermBadge term={selected.term} />}
                    />
                    <DetailRow
                      label="Date of Admission"
                      value={formatDate(selected.registerData?.admissionDate || selected.enrollmentDate)}
                    />
                  </div>
                </div>

                {/* Registration */}
                <div>
                  <h4 className="text-sm font-bold text-pink-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-pink-100">
                    Registration Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Village / Town"           value={selected.villageTown} />
                    <DetailRow label="District"                 value={selected.district} />
                    <DetailRow label="Evidence of Birthdate"    value={selected.registerData?.evidenceOfBirthdate} />
                    <DetailRowFull label="Postal Address"       value={selected.registerData?.postalAddress} />
                  </div>
                </div>

                {/* Parent */}
                <div>
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-blue-100">
                    Parent / Guardian Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="First Name"     value={selected.parentFirstName} />
                    <DetailRow label="Last Name"      value={selected.parentLastName} />
                    <DetailRow label="Email"          value={selected.parentEmail} />
                    <DetailRow label="Cellphone"      value={selected.parentPhone} />
                    <DetailRowFull label="Residential Address" value={selected.address} />
                  </div>
                </div>

                {/* Emergency */}
                <div>
                  <h4 className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-orange-100">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Contact Name"    value={selected.emergencyContact} />
                    <DetailRow label="Contact Phone"   value={selected.emergencyPhone} />
                    <DetailRow label="Relationship"    value={selected.emergencyContactRelationship} />
                  </div>
                </div>

                {/* Medical */}
                <div>
                  <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-red-100">
                    Medical Information
                  </h4>
                  <div className="space-y-3">
                    {selected.allergies?.trim() ? (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Allergies</p>
                        <div className="bg-red-50 text-red-800 text-sm p-3 rounded-lg border border-red-100">
                          {selected.allergies.split('; ').map((a, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">•</span><span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Allergies</p>
                        <div className="bg-green-50 text-green-800 text-sm p-3 rounded-lg border border-green-100">No known allergies</div>
                      </div>
                    )}
                    {selected.medicalInfo?.trim() ? (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Other Medical Notes</p>
                        <div className="bg-amber-50 text-amber-900 text-sm p-3 rounded-lg border border-amber-100 whitespace-pre-wrap">{selected.medicalInfo}</div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Other Medical Notes</p>
                        <div className="bg-gray-50 text-gray-600 text-sm p-3 rounded-lg border border-gray-100">No additional medical notes</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* System */}
                <div>
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2 pb-2 border-b border-gray-200">
                    System Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow label="Child ID"     value={selected.id} />
                    <DetailRow label="Created Date" value={formatDate(selected.createdAt)} />
                    <DetailRow label="Last Updated" value={formatDate(selected.updatedAt)} />
                  </div>
                </div>
              </div>

              {/* Footer */}
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
        )
      })()}

      {/* ── Delete confirmation modal ── */}
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
                  Are you sure you want to delete{' '}
                  <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong>?
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
                  {deleting
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Deleting…</>
                    : <><Trash2 className="h-4 w-4" /> Delete Permanently</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}