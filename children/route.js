'use client'
import { signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'

// ─── Role constants (underscores to match DB) ───────────────────────────────────
const ROLES = {
  PRINCIPAL: 'DAY_CARE_PRINCIPAL',
  TEACHER:   'DAY_CARE_TEACHER',
}

// ─── Tab definitions ─────────────────────────────────────────────────────────────
const ALL_TABS = [
  { id: 'overview',      label: 'Overview',      roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'registrations', label: 'Registrations', roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'children',      label: 'Children',      roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'attendance',    label: 'Attendance',    roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'lessons',       label: 'Lessons',       roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'messages',      label: 'Messages',      roles: [ROLES.PRINCIPAL, ROLES.TEACHER] },
  { id: 'staff',         label: 'Staff',         roles: [ROLES.PRINCIPAL] },
  { id: 'reports',       label: 'Reports',       roles: [ROLES.PRINCIPAL] },
  { id: 'settings',      label: 'Settings',      roles: [ROLES.PRINCIPAL] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────────
function roleBadgeClass(role) {
  switch (role?.toUpperCase()) {
    case ROLES.PRINCIPAL: return 'bg-amber-100 text-amber-800 border border-amber-300'
    case ROLES.TEACHER:   return 'bg-sky-100 text-sky-800 border border-sky-300'
    default:              return 'bg-gray-100 text-gray-700 border border-gray-300'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function StatusBadge({ status }) {
  const map = {
    PENDING:   'bg-yellow-100 text-yellow-800',
    APPROVED:  'bg-green-100 text-green-800',
    REJECTED:  'bg-red-100 text-red-800',
    WAITLIST:  'bg-blue-100 text-blue-800',
    ENROLLED:  'bg-purple-100 text-purple-800',
    active:    'bg-green-100 text-green-800',
    inactive:  'bg-gray-100 text-gray-700',
  }
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────────
const IconBell = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, ping }) {
  const colorMap = {
    amber:   'text-amber-600',
    sky:     'text-sky-600',
    orange:  'text-orange-600',
    rose:    'text-rose-600',
    emerald: 'text-emerald-600',
  }
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-50 p-6 relative">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className={`text-3xl font-bold ${colorMap[color] ?? 'text-gray-800'}`}>{value}</p>
      {ping && (
        <span className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
        </span>
      )}
    </div>
  )
}

// ─── Registration Detail Modal ────────────────────────────────────────────────────
function RegistrationDetailModal({ registration, onClose, onStatusChange }) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (newStatus) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/daycare/registrations/${registration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        onStatusChange(registration.id, newStatus)
        onClose()
      } else {
        alert('Failed to update status')
      }
    } catch (err) {
      alert('Error updating registration')
    } finally {
      setLoading(false)
    }
  }

  if (!registration) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-amber-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-900">Registration Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Child Name</p>
              <p className="font-semibold text-amber-900">{registration.childName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Child Age</p>
              <p className="font-semibold text-amber-900">{registration.childAge} years</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Name</p>
              <p className="font-semibold text-amber-900">{registration.parentName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="font-semibold text-amber-900">{registration.phone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
              <p className="font-semibold text-amber-900">{registration.email}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
              <p className="font-semibold text-amber-900">{registration.address}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Start Date</p>
              <p className="font-semibold text-amber-900">{formatDate(registration.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <StatusBadge status={registration.status} />
            </div>
            {registration.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                <p className="text-amber-900 bg-amber-50 rounded-lg p-3 text-sm">{registration.notes}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Submitted</p>
              <p className="text-sm text-gray-600">{formatDate(registration.createdAt)}</p>
            </div>
          </div>
        </div>

        {registration.status === 'PENDING' && (
          <div className="p-6 border-t border-amber-100 flex gap-3">
            <button
              onClick={() => handleAction('APPROVED')}
              disabled={loading}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => handleAction('WAITLIST')}
              disabled={loading}
              className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              ⏳ Waitlist
            </button>
            <button
              onClick={() => handleAction('REJECTED')}
              disabled={loading}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Registrations Management ─────────────────────────────────────────────────────
function RegistrationsManagement() {
  const [registrationTab, setRegistrationTab] = useState('pending')
  const [registrations, setRegistrations]     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [selectedReg, setSelectedReg]         = useState(null)
  const [filterStatus, setFilterStatus]       = useState('ALL')

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daycare/registrations')
      const data = await res.json()
      setRegistrations(data.registrations || data || [])
    } catch (err) {
      console.error('Failed to fetch registrations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRegistrations() }, [fetchRegistrations])

  const handleStatusChange = (id, newStatus) => {
    setRegistrations(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
    )
    window.dispatchEvent(new Event('notificationUpdate'))
  }

  const pendingRegs = registrations.filter(r => r.status === 'PENDING')
  const allFiltered = filterStatus === 'ALL'
    ? registrations
    : registrations.filter(r => r.status === filterStatus)

  return (
    <div className="space-y-6">
      {selectedReg && (
        <RegistrationDetailModal
          registration={selectedReg}
          onClose={() => setSelectedReg(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Sub-nav */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="border-b border-amber-200">
          <nav className="flex">
            {[
              { id: 'pending', label: `📋 Pending`, count: pendingRegs.length },
              { id: 'add',     label: '➕ Add Student' },
              { id: 'all',     label: `👥 All Registrations`, count: registrations.length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setRegistrationTab(id)}
                className={`relative flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  registrationTab === id
                    ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Pending Tab ── */}
      {registrationTab === 'pending' && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">
            Pending Registration Requests
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-amber-600">Loading registrations…</p>
            </div>
          ) : pendingRegs.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl">✅</span>
              <p className="mt-3 text-amber-700 font-medium">No pending registrations</p>
              <p className="text-sm text-amber-500 mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRegs.map((reg) => (
                <div
                  key={reg.id}
                  className="border border-amber-200 rounded-xl p-4 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-amber-900">{reg.childName}</h3>
                      <p className="text-sm text-amber-600">Parent: {reg.parentName}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xs text-gray-500">📞 {reg.phone}</p>
                        <p className="text-xs text-gray-500">📅 Start: {formatDate(reg.startDate)}</p>
                        <p className="text-xs text-gray-500">🗓 Applied: {formatDate(reg.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={reg.status} />
                      <button
                        onClick={() => setSelectedReg(reg)}
                        className="px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Review →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Student Tab ── */}
      {registrationTab === 'add' && <AddStudent onSuccess={fetchRegistrations} />}

      {/* ── All Registrations Tab ── */}
      {registrationTab === 'all' && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold text-amber-900">All Registrations</h2>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'APPROVED', 'WAITLIST', 'REJECTED', 'ENROLLED'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    filterStatus === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allFiltered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-amber-600">No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-left">
                    <th className="py-3 px-4 text-amber-900 font-semibold">Child</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Parent</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Age</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Phone</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Start Date</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Status</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allFiltered.map((reg) => (
                    <tr key={reg.id} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-amber-900">{reg.childName}</td>
                      <td className="py-3 px-4 text-gray-700">{reg.parentName}</td>
                      <td className="py-3 px-4 text-gray-700">{reg.childAge}</td>
                      <td className="py-3 px-4 text-gray-700">{reg.phone}</td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(reg.startDate)}</td>
                      <td className="py-3 px-4"><StatusBadge status={reg.status} /></td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="text-amber-600 hover:text-amber-900 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Add Student Form ──────────────────────────────────────────────────────────────
function AddStudent({ onSuccess }) {
  const [formData, setFormData] = useState({
    childFirstName: '', childLastName: '', dateOfBirth: '', gender: '',
    parentFirstName: '', parentLastName: '', parentEmail: '', parentPhone: '',
    address: '', emergencyContact: '', emergencyPhone: '',
    medicalInfo: '', allergies: '', class: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/daycare/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        alert('Student added successfully!')
        setFormData({
          childFirstName: '', childLastName: '', dateOfBirth: '', gender: '',
          parentFirstName: '', parentLastName: '', parentEmail: '', parentPhone: '',
          address: '', emergencyContact: '', emergencyPhone: '',
          medicalInfo: '', allergies: '', class: ''
        })
        onSuccess?.()
        window.dispatchEvent(new Event('notificationUpdate'))
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to add student')
      }
    } catch (err) {
      alert('Error adding student')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (label, name, type = 'text', required = false, colSpan = '') => (
    <div className={colSpan}>
      <label className="block text-sm font-medium text-amber-900 mb-2">{label}{required && ' *'}</label>
      <input
        type={type} name={name} value={formData[name]} onChange={handleChange}
        required={required}
        className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
      <h2 className="text-xl font-semibold text-amber-900 mb-6">Add New Enrolled Student</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Child Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('First Name', 'childFirstName', 'text', true)}
            {field('Last Name', 'childLastName', 'text', true)}
            {field('Date of Birth', 'dateOfBirth', 'date', true)}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Class</label>
              <input name="class" value={formData.class} onChange={handleChange}
                placeholder="e.g. Preschool A, Toddler B"
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </section>

        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Parent / Guardian</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('First Name', 'parentFirstName', 'text', true)}
            {field('Last Name', 'parentLastName', 'text', true)}
            {field('Email', 'parentEmail', 'email', true)}
            {field('Phone', 'parentPhone', 'tel', true)}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-900 mb-2">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </section>

        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Contact Name', 'emergencyContact', 'text', true)}
            {field('Contact Phone', 'emergencyPhone', 'tel', true)}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Medical Conditions</label>
              <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows={3}
                placeholder="List any conditions, medications, or special needs…"
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Allergies</label>
              <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2}
                placeholder="Food, medication, environmental…"
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setFormData({
            childFirstName:'',childLastName:'',dateOfBirth:'',gender:'',
            parentFirstName:'',parentLastName:'',parentEmail:'',parentPhone:'',
            address:'',emergencyContact:'',emergencyPhone:'',medicalInfo:'',allergies:'',class:''
          })}
            className="px-6 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">
            Clear
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
            {submitting ? 'Adding…' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Children Management ──────────────────────────────────────────────────────────
function ChildrenManagement() {
  const [children, setChildren]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchTerm, setSearch]   = useState('')
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    fetch('/api/daycare/children')
      .then(r => r.json())
      .then(d => setChildren(d.children || d || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = children.filter(c => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    const parent = `${c.parentFirstName} ${c.parentLastName}`.toLowerCase()
    const q = searchTerm.toLowerCase()
    return name.includes(q) || parent.includes(q)
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-amber-900">
          Enrolled Children
          {!loading && <span className="ml-2 text-base font-normal text-amber-600">({children.length})</span>}
        </h2>
        <input
          type="text"
          placeholder="Search by name or parent…"
          value={searchTerm}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-amber-600">Loading children…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-5xl">👶</span>
          <p className="mt-3 text-amber-700 font-medium">
            {searchTerm ? 'No children match your search' : 'No enrolled children yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-200 text-left">
                <th className="py-3 px-4 text-amber-900 font-semibold">Name</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">DOB</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">Class</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">Parent</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">Contact</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">Status</th>
                <th className="py-3 px-4 text-amber-900 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(child => (
                <tr key={child.id} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-amber-900">
                    {child.firstName} {child.lastName}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{formatDate(child.dateOfBirth)}</td>
                  <td className="py-3 px-4 text-gray-700">{child.class || '—'}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {child.parentFirstName} {child.parentLastName}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{child.parentPhone}</td>
                  <td className="py-3 px-4"><StatusBadge status={child.status} /></td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelected(child)}
                      className="text-amber-600 hover:text-amber-900 font-medium"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Child Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-amber-900">
                {selected.firstName} {selected.lastName}
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p><p className="font-semibold text-amber-900">{formatDate(selected.dateOfBirth)}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p><p className="font-semibold text-amber-900">{selected.gender}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Class</p><p className="font-semibold text-amber-900">{selected.class || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Parent</p><p className="font-semibold text-amber-900">{selected.parentFirstName} {selected.parentLastName}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Parent Phone</p><p className="font-semibold text-amber-900">{selected.parentPhone}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Email</p><p className="font-semibold text-amber-900">{selected.parentEmail}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Address</p><p className="font-semibold text-amber-900">{selected.address || '—'}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Emergency Contact</p><p className="font-semibold text-amber-900">{selected.emergencyContact}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Emergency Phone</p><p className="font-semibold text-amber-900">{selected.emergencyPhone}</p></div>
              {selected.allergies && <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Allergies</p><p className="text-amber-900 bg-red-50 rounded-lg p-3">{selected.allergies}</p></div>}
              {selected.medicalInfo && <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Medical Info</p><p className="text-amber-900 bg-amber-50 rounded-lg p-3">{selected.medicalInfo}</p></div>}
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Enrolled</p><p className="font-semibold text-amber-900">{formatDate(selected.enrollmentDate)}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Placeholder sub-components ───────────────────────────────────────────────────
const Placeholder = ({ title, emoji, note }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
    <h2 className="text-xl font-semibold text-amber-900 mb-2">{title}</h2>
    <p className="text-amber-700">{emoji} {note ?? `${title} coming soon…`}</p>
  </div>
)

// ─── Permission Denied ─────────────────────────────────────────────────────────────
function PermissionDenied({ role, section }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
      <p className="text-yellow-900 font-medium">
        🔒 You don't have permission to access <strong>{section}</strong>.
      </p>
      <p className="text-sm text-yellow-700 mt-2">
        Your current role — <span className="font-semibold">{role}</span> — does not include this section.
        Please contact a <strong>Day-Care Principal</strong> if you need access.
      </p>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────────
export default function DayCareDashboard({ user }) {
  const [activeTab, setActiveTab]                           = useState('overview')
  const [notificationCount, setNotificationCount]           = useState(0)
  const [messageNotifications, setMessageNotifications]     = useState(0)
  const [childNotifications, setChildNotifications]         = useState(0)
  const [registrationNotifications, setRegistrationNotifications] = useState(0)

  // ✅ Normalize role — handle both hyphen and underscore variants
  const rawRole = user.role?.toUpperCase().replace(/-/g, '_')
  const isPrincipal = rawRole === ROLES.PRINCIPAL

  const visibleTabs = ALL_TABS.filter(t => t.roles.includes(rawRole))

  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) setActiveTab('overview')
  }, [rawRole])

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/daycare/notifications/count')
      const data = await res.json()
      setNotificationCount(data.count || 0)
      setMessageNotifications(data.messageCount || 0)
      setChildNotifications(data.childCount || 0)
      setRegistrationNotifications(data.registrationCount || 0)
    } catch (err) {
      console.error('Failed to fetch notification count:', err)
    }
  }, [])

  useEffect(() => {
    fetchNotificationCount()
    window.addEventListener('notificationUpdate', fetchNotificationCount)
    return () => window.removeEventListener('notificationUpdate', fetchNotificationCount)
  }, [fetchNotificationCount])

  function tabBadge(tabId) {
    if (tabId === 'messages')      return messageNotifications
    if (tabId === 'children')      return childNotifications
    if (tabId === 'registrations') return registrationNotifications
    return 0
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 50%, #fefce8 100%)' }}>

      {/* ── Header ── */}
      <header className="bg-white shadow-sm border-b border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black shadow"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                🌻
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900 leading-tight">Bosele Day Care Pre-school</h1>
                <p className="text-xs text-amber-600">Welcome back, {user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-amber-600 hover:text-amber-900 transition-colors rounded-lg hover:bg-amber-50">
                <IconBell />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${roleBadgeClass(rawRole)}`}>
                {user.role}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <div className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {visibleTabs.map(({ id, label }) => {
              const badge    = tabBadge(id)
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative py-4 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-amber-500 text-amber-700'
                      : 'border-transparent text-gray-500 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  {label}
                  {badge > 0 && (
                    <span className="absolute -top-1 right-0 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Enrolled Children"   value={childNotifications}        color="amber"   />
              <StatCard label="Present Today"        value="0"                         color="emerald" />
              <StatCard label="New Registrations"    value={registrationNotifications} color="sky"     ping={registrationNotifications > 0} />
              <StatCard label="Unread Messages"      value={messageNotifications}      color="orange"  ping={messageNotifications > 0} />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
              <span className="text-3xl">📋</span>
              <div>
                <p className="font-semibold text-amber-900">
                  {isPrincipal
                    ? 'Principal Dashboard — full access enabled.'
                    : 'Teacher Dashboard — class management & communication tools available.'}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  {isPrincipal
                    ? 'You can manage staff, view reports, and control all settings.'
                    : 'Contact your principal to request access to staff or report sections.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && <RegistrationsManagement />}
        {activeTab === 'children'      && <ChildrenManagement />}
        {activeTab === 'attendance'    && <Placeholder title="Attendance"         emoji="📅" />}
        {activeTab === 'lessons'       && <Placeholder title="Lessons & Activities" emoji="📚" />}
        {activeTab === 'messages'      && <Placeholder title="Parent Messages"    emoji="💬" />}

        {activeTab === 'staff' && (
          isPrincipal
            ? <Placeholder title="Staff Management" emoji="👩‍💼" />
            : <PermissionDenied role={user.role} section="Staff Management" />
        )}
        {activeTab === 'reports' && (
          isPrincipal
            ? <Placeholder title="Reports" emoji="📊" />
            : <PermissionDenied role={user.role} section="Reports" />
        )}
        {activeTab === 'settings' && (
          isPrincipal
            ? <Placeholder title="Settings" emoji="⚙️" />
            : <PermissionDenied role={user.role} section="Settings" />
        )}
      </main>
    </div>
  )
}