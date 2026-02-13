'use client'
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Edit, Trash2, X } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function StatusBadge({ status }) {
  const map = {
    active:    'bg-green-100 text-green-800 border-green-200',
    inactive:  'bg-gray-100 text-gray-700 border-gray-200',
    on_leave:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  }
  const normalizedStatus = status?.toLowerCase() || 'active'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${map[normalizedStatus] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status?.replace('_', ' ').charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ').toLowerCase() || 'Active'}
    </span>
  )
}

function positionLabel(pos) {
  if (!pos) return '—'
  return pos.replace(/_/g, ' ').replace(/\bDAY CARE\b/i, '').trim()
}

function positionBadge(pos) {
  const p = pos?.toUpperCase()
  if (p === 'DAY_CARE_PRINCIPAL' || p === 'PRINCIPAL') return 'bg-amber-100 text-amber-800 border-amber-300'
  if (p === 'DAY_CARE_TEACHER'   || p === 'TEACHER')   return 'bg-sky-100 text-sky-800 border-sky-300'
  if (p === 'ASSISTANT')  return 'bg-green-100 text-green-800 border-green-300'
  if (p === 'ADMIN')      return 'bg-purple-100 text-purple-800 border-purple-300'
  return 'bg-gray-100 text-gray-700 border-gray-300'
}

// ─── Add/Edit Staff Member Form ─────────────────────────────────────────────────────────
function StaffForm({ editStaff = null, onSuccess, onCancel }) {
  const isEditing = !!editStaff

  const EMPTY = {
    firstName: '', lastName: '', email: '', phone: '',
    address: '', position: '', department: 'General',
    employeeId: '', dateOfBirth: '', hireDate: '', salary: '',
    emergencyContactName: '', emergencyContactPhone: '', status: 'active',
  }

  const [formData, setFormData] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (editStaff) {
      setFormData({
        firstName: editStaff.first_name || editStaff.firstName || '',
        lastName: editStaff.last_name || editStaff.lastName || '',
        email: editStaff.email || '',
        phone: editStaff.phone || '',
        address: editStaff.address || '',
        position: editStaff.position || '',
        department: editStaff.department || 'General',
        employeeId: editStaff.employee_id || editStaff.employeeId || '',
        dateOfBirth: editStaff.date_of_birth || editStaff.dateOfBirth || '',
        hireDate: editStaff.hire_date || editStaff.hireDate || '',
        salary: editStaff.salary || '',
        emergencyContactName: editStaff.emergency_contact_name || editStaff.emergencyContactName || '',
        emergencyContactPhone: editStaff.emergency_contact_phone || editStaff.emergencyContactPhone || '',
        status: editStaff.status || 'active',
      })
    } else {
      setFormData(EMPTY)
    }
  }, [editStaff])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = isEditing ? `/api/daycare/staff/${editStaff.id}` : '/api/daycare/staff'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert(`Staff member ${isEditing ? 'updated' : 'added'} successfully!`)
        onSuccess?.()
        if (!isEditing) setFormData(EMPTY)
      } else {
        const err = await res.json()
        alert(err.error || `Failed to ${isEditing ? 'update' : 'add'} staff member`)
      }
    } catch {
      alert(`Error ${isEditing ? 'updating' : 'adding'} staff member`)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (label, name, type = 'text', required = false, placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-amber-900 mb-2">{label}{required && ' *'}</label>
      <input
        type={type} name={name} value={formData[name]} onChange={handleChange}
        required={required} placeholder={placeholder}
        className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-amber-900">
          {isEditing ? 'Edit Staff Member' : 'Add New Staff Member'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal Information */}
        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('First Name', 'firstName', 'text', true)}
            {field('Last Name', 'lastName', 'text', true)}
            {field('Date of Birth', 'dateOfBirth', 'date')}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-900 mb-2">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2}
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Email Address', 'email', 'email', true)}
            {field('Phone Number', 'phone', 'tel', true)}
          </div>
        </section>

        {/* Employment Details */}
        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Employment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Position *</label>
              <select name="position" value={formData.position} onChange={handleChange} required
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">Select position…</option>
                <option value="Principal">Principal</option>
                <option value="Teacher">Teacher</option>
                <option value="Teaching Assistant">Teaching Assistant</option>
                <option value="Admin">Admin / Office</option>
                <option value="Cook">Cook / Kitchen</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Driver">Driver</option>
                <option value="Security">Security</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Department *</label>
              <select name="department" value={formData.department} onChange={handleChange} required
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="General">General</option>
                <option value="Teaching">Teaching</option>
                <option value="Administration">Administration</option>
                <option value="Support">Support</option>
              </select>
            </div>
            {field('Employee ID', 'employeeId', 'text', false, 'e.g. EMP-001 (auto-generated if blank)')}
            {field('Hire Date', 'hireDate', 'date', true)}
            {field('Salary (optional)', 'salary', 'number', false, 'e.g. 5000')}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} required
                className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="border-b border-amber-200 pb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Contact Name', 'emergencyContactName', 'text', true)}
            {field('Contact Phone', 'emergencyContactPhone', 'tel', true)}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          )}
          <button type="button" onClick={() => setFormData(EMPTY)}
            className="px-6 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50">
            Clear
          </button>
          <button type="submit" disabled={submitting}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50">
            {submitting ? (isEditing ? 'Updating…' : 'Adding…') : (isEditing ? 'Update Staff' : 'Add Staff Member')}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Staff Detail Modal ─────────────────────────────────────────────────────────
function StaffDetailModal({ staff, onClose, onEdit, onDelete, actionLoading }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {((staff.first_name || staff.firstName)?.[0] || '') + ((staff.last_name || staff.lastName)?.[0] || '')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{staff.first_name || staff.firstName} {staff.last_name || staff.lastName}</h2>
              <p className="text-amber-100 text-sm">{positionLabel(staff.position)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-light">×</button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">First Name</p><p className="font-semibold text-amber-900">{staff.first_name || staff.firstName}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Last Name</p><p className="font-semibold text-amber-900">{staff.last_name || staff.lastName}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${positionBadge(staff.position)}`}>{positionLabel(staff.position)}</span>
          </div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Status</p><StatusBadge status={staff.status || 'active'} /></div>
          <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Email</p><p className="font-semibold text-amber-900">{staff.email || '—'}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p><p className="font-semibold text-amber-900">{staff.phone || '—'}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Employee ID</p><p className="font-semibold text-amber-900">{staff.employee_id || staff.employeeId || '—'}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Hire Date</p><p className="font-semibold text-amber-900">{formatDate(staff.hire_date || staff.hireDate)}</p></div>
          <div><p className="text-xs text-gray-500 uppercase tracking-wide">Department</p><p className="font-semibold text-amber-900">{staff.department || '—'}</p></div>
          <div className="col-span-2"><p className="text-xs text-gray-500 uppercase tracking-wide">Address</p><p className="font-semibold text-amber-900">{staff.address || '—'}</p></div>
          {(staff.emergency_contact_name || staff.emergencyContactName) && (
            <>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Emergency Contact</p><p className="font-semibold text-amber-900">{staff.emergency_contact_name || staff.emergencyContactName}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Emergency Phone</p><p className="font-semibold text-amber-900">{staff.emergency_contact_phone || staff.emergencyContactPhone || '—'}</p></div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-amber-100 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose()
                onEdit(staff)
              }}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(staff.id)}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {actionLoading ? 'Removing…' : 'Remove'}
            </button>
          </div>
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Staff Management Component ─────────────────────────────────────────────
export default function StaffManagement() {
  const [staffTab, setStaffTab]   = useState('list')
  const [staff, setStaff]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [editing, setEditing]     = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/daycare/staff')
      const data = await res.json()
      setStaff(Array.isArray(data) ? data : (data.staff || []))
    } catch (err) {
      console.error('Failed to fetch staff:', err)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/daycare/staff/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchStaff()
        setSelected(null)
        alert('Staff member removed.')
      } else {
        const d = await res.json()
        alert(d.error || 'Failed to remove staff member')
      }
    } catch {
      alert('Error removing staff member')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (member) => {
    setEditing(member)
    setStaffTab('add')
    setSelected(null)
  }

  const handleSuccess = () => {
    fetchStaff()
    setStaffTab('list')
    setEditing(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setStaffTab('list')
  }

  const safeStaff = Array.isArray(staff) ? staff : []

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/daycare/staff/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff: safeStaff })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `staff-list-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Sub-nav */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="border-b border-amber-200">
          <nav className="flex">
            {[
              { id: 'list', label: '👥 All Staff',   count: safeStaff.length },
              { id: 'add',  label: editing ? '✏️ Edit Staff Member' : '➕ Add Staff Member' },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => {
                  setStaffTab(id)
                  if (id === 'list') setEditing(null)
                }}
                className={`relative flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  staffTab === id
                    ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                    : 'text-amber-600 hover:bg-amber-50'
                }`}
              >
                {label}
                {count > 0 && id === 'list' && (
                  <span className="ml-2 bg-amber-200 text-amber-800 text-xs font-bold rounded-full px-1.5 py-0.5">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Staff List Tab ── */}
      {staffTab === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-amber-900">
              Staff Members
              {!loading && <span className="ml-2 text-base font-normal text-amber-600">({safeStaff.length})</span>}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                disabled={loading || safeStaff.length === 0}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={fetchStaff}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-amber-600">Loading staff…</p>
            </div>
          ) : safeStaff.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl">👩‍💼</span>
              <p className="mt-3 text-amber-700 font-medium">No staff members yet</p>
              <p className="text-sm text-amber-500 mt-1">Add your first staff member using the tab above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-left">
                    <th className="py-3 px-4 text-amber-900 font-semibold">Name</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Role</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Email</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Phone</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Start Date</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Status</th>
                    <th className="py-3 px-4 text-amber-900 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeStaff.map(member => (
                    <tr key={member.id} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                            {((member.first_name || member.firstName)?.[0] || '') + ((member.last_name || member.lastName)?.[0] || '')}
                          </div>
                          <span className="font-medium text-amber-900">
                            {member.first_name || member.firstName} {member.last_name || member.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${positionBadge(member.position)}`}>
                          {positionLabel(member.position)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{member.email || '—'}</td>
                      <td className="py-3 px-4 text-gray-700">{member.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(member.hire_date || member.hireDate)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={member.status || 'active'} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelected(member)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(member)}
                            className="text-amber-600 hover:text-amber-900 font-medium"
                          >
                            Edit
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
      )}

      {/* ── Add/Edit Staff Tab ── */}
      {staffTab === 'add' && (
        <StaffForm 
          editStaff={editing} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel}
        />
      )}

      {/* ── Staff Detail Modal ── */}
      {selected && (
        <StaffDetailModal
          staff={selected}
          onClose={() => setSelected(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          actionLoading={actionLoading}
        />
      )}
    </div>
  )
}