'use client'
import { signOut } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Baby, FileText, X, Trash2, Eye, Briefcase, AlertCircle, Heart, Clock, CheckCircle, RefreshCw } from 'lucide-react'

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
    PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    pending:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED:  'bg-green-100 text-green-800 border-green-200',
    approved:  'bg-green-100 text-green-800 border-green-200',
    REJECTED:  'bg-red-100 text-red-800 border-red-200',
    rejected:  'bg-red-100 text-red-800 border-red-200',
    WAITLIST:  'bg-blue-100 text-blue-800 border-blue-200',
    waitlist:  'bg-blue-100 text-blue-800 border-blue-200',
    ENROLLED:  'bg-purple-100 text-purple-800 border-purple-200',
    active:    'bg-green-100 text-green-800 border-green-200',
    inactive:  'bg-gray-100 text-gray-700 border-gray-200',
  }
  const normalizedStatus = status?.toLowerCase() || 'pending'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${map[normalizedStatus] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Pending'}
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

// ─── Registrations Management (INTEGRATED & IMPROVED) ─────────────────────────────
function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching registrations...')
      const res = await fetch('/api/registrations', {
        cache: 'no-store'
      })
      const data = await res.json()
      
      console.log('📦 Fetched data:', data)
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch registrations')
      }
      
      let registrationsArray = Array.isArray(data) ? data : (data.registrations || [])
      
      console.log('✅ Setting', registrationsArray.length, 'registrations')
      setRegistrations(registrationsArray)
    } catch (error) {
      console.error('❌ Error fetching registrations:', error)
      setError(error.message)
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleViewRegistration = async (registration) => {
    setSelectedRegistration(registration)
    
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: registration.id,
          reference_type: 'registration'
        })
      })
      
      window.dispatchEvent(new Event('notificationUpdate'))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleApproveRegistration = async (id) => {
    if (!confirm('Are you sure you want to approve this registration?')) return

    setActionLoading(true)
    try {
      console.log('🔄 Approving registration:', id)
      
      const res = await fetch('/api/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          status: 'approved'
        })
      })

      const data = await res.json()
      console.log('📦 Approve response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve registration')
      }

      console.log('✅ Registration approved, deleting notification...')

      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: id,
          reference_type: 'registration'
        })
      })

      console.log('✅ Notification deleted, refreshing data...')

      window.dispatchEvent(new Event('notificationUpdate'))
      await fetchRegistrations()

      if (selectedRegistration?.id === id) {
        setSelectedRegistration(null)
      }

      alert('Registration approved successfully!')
    } catch (error) {
      console.error('❌ Error approving registration:', error)
      alert('Failed to approve registration: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRegistration = async (id) => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) return

    setActionLoading(true)
    try {
      console.log('🗑️ Deleting registration:', id)
      
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: id,
          reference_type: 'registration'
        })
      })

      console.log('✅ Notification deleted, deleting registration...')

      const res = await fetch(`/api/registrations?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      console.log('📦 Delete response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete registration')
      }

      console.log('✅ Registration deleted, refreshing data...')

      window.dispatchEvent(new Event('notificationUpdate'))
      await fetchRegistrations()

      setSelectedRegistration(null)

      alert('Registration deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting registration:', error)
      alert('Failed to delete registration: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-gray-600">Loading registrations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p className="font-semibold">Error loading registrations</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchRegistrations}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 border-b-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daycare Registrations</h2>
            <p className="text-gray-600 mt-1">Manage and review all daycare registration applications</p>
          </div>
          <button
            onClick={fetchRegistrations}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Total</p>
            <p className="text-2xl font-bold text-blue-900">
              {Array.isArray(registrations) ? registrations.length : 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {Array.isArray(registrations) ? registrations.filter(r => r.status === 'pending').length : 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Approved</p>
            <p className="text-2xl font-bold text-green-900">
              {Array.isArray(registrations) ? registrations.filter(r => r.status === 'approved').length : 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-semibold">Waitlist</p>
            <p className="text-2xl font-bold text-purple-900">
              {Array.isArray(registrations) ? registrations.filter(r => r.status === 'waitlist').length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Child</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!Array.isArray(registrations) || registrations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <p>No registrations found</p>
                      <p className="text-sm text-gray-400 mt-1">New registrations will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {reg.parent_name || reg.parentName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Baby className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="font-medium text-gray-900">
                          {reg.child_name || reg.childName || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900 flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400" />
                          {reg.email || 'N/A'}
                        </p>
                        <p className="text-gray-500 flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1 text-gray-400" />
                          {reg.phone || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(reg.created_at || reg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewRegistration(reg)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        {reg.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveRegistration(reg.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRegistration(reg.id)}
                          disabled={actionLoading}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedRegistration && (() => {
        const additionalData = selectedRegistration.additional_data || {}
        const child = additionalData.child || {}
        const mother = additionalData.mother || {}
        const father = additionalData.father || {}
        const emergency = additionalData.emergency || {}
        const medical = additionalData.medical || {}
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Registration Details</h3>
                      <p className="text-emerald-100 text-sm mt-1">Complete application information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Status Badge */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500">Application Status</p>
                    <div className="mt-1"><StatusBadge status={selectedRegistration.status} /></div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedRegistration.created_at || selectedRegistration.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Child Information */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Baby className="h-5 w-5 text-pink-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Child Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Surname</p>
                      <p className="font-medium text-gray-900">{child.surname || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First Name(s)</p>
                      <p className="font-medium text-gray-900">{child.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nickname</p>
                      <p className="font-medium text-gray-900">{child.nickname || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gender</p>
                      <p className="font-medium text-gray-900">{child.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                      <p className="font-medium text-gray-900">
                        {child.dob?.day && child.dob?.month && child.dob?.year
                          ? `${child.dob.day}/${child.dob.month}/${child.dob.year}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Age</p>
                      <p className="font-medium text-gray-900">{selectedRegistration.child_age || selectedRegistration.childAge || 'N/A'} years</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> Residential Address
                      </p>
                      <p className="font-medium text-gray-900">{selectedRegistration.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Postal Address</p>
                      <p className="font-medium text-gray-900">{additionalData.postalAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> Preferred Start Date
                      </p>
                      <p className="font-medium text-gray-900">
                        {selectedRegistration.start_date || selectedRegistration.startDate
                          ? new Date(selectedRegistration.start_date || selectedRegistration.startDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Mother's Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Surname</p>
                      <p className="font-medium text-gray-900">{mother.surname || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First Name(s)</p>
                      <p className="font-medium text-gray-900">{mother.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Home Telephone
                      </p>
                      <p className="font-medium text-gray-900">{mother.telephoneHome || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Cellphone
                      </p>
                      <p className="font-medium text-gray-900">{mother.cellphone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </p>
                      <p className="font-medium text-gray-900">{mother.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" /> Workplace
                      </p>
                      <p className="font-medium text-gray-900">{mother.workplace || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Work Telephone
                      </p>
                      <p className="font-medium text-gray-900">{mother.telephoneWork || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Work Hours
                      </p>
                      <p className="font-medium text-gray-900">{mother.workHours || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Father's Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Father's Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Surname</p>
                      <p className="font-medium text-gray-900">{father.surname || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">First Name(s)</p>
                      <p className="font-medium text-gray-900">{father.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Home Telephone
                      </p>
                      <p className="font-medium text-gray-900">{father.telephoneHome || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Cellphone
                      </p>
                      <p className="font-medium text-gray-900">{father.cellphone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </p>
                      <p className="font-medium text-gray-900">{father.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" /> Workplace
                      </p>
                      <p className="font-medium text-gray-900">{father.workplace || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Work Telephone
                      </p>
                      <p className="font-medium text-gray-900">{father.telephoneWork || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" /> Work Hours
                      </p>
                      <p className="font-medium text-gray-900">{father.workHours || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Emergency Contact</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{emergency.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Telephone
                      </p>
                      <p className="font-medium text-gray-900">{emergency.telephone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <Phone className="h-3 w-3 mr-1" /> Cellphone
                      </p>
                      <p className="font-medium text-gray-900">{emergency.cellphone || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-600 mb-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" /> Address
                      </p>
                      <p className="font-medium text-gray-900">{emergency.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-red-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Medical Information</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <p className="text-sm text-gray-600 mb-2">Medicine Allergies</p>
                      <p className="font-medium text-gray-900 mb-1">
                        {medical.hasMedicineAllergies || 'Not specified'}
                      </p>
                      {medical.hasMedicineAllergies === 'Yes' && medical.medicineAllergiesDetails && (
                        <p className="text-sm text-gray-700 bg-red-50 p-2 rounded border border-red-200 mt-2">
                          <strong>Details:</strong> {medical.medicineAllergiesDetails}
                        </p>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <p className="text-sm text-gray-600 mb-2">Food Allergies/Sensitivities</p>
                      <p className="font-medium text-gray-900 mb-1">
                        {medical.hasFoodAllergies || 'Not specified'}
                      </p>
                      {medical.hasFoodAllergies === 'Yes' && medical.foodAllergiesDetails && (
                        <p className="text-sm text-gray-700 bg-red-50 p-2 rounded border border-red-200 mt-2">
                          <strong>Details:</strong> {medical.foodAllergiesDetails}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Registration ID */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Registration ID</p>
                  <p className="font-mono text-sm text-gray-700">{selectedRegistration.id}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between border-t">
                <div className="flex gap-2">
                  {selectedRegistration.status !== 'approved' && (
                    <button
                      onClick={() => handleApproveRegistration(selectedRegistration.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionLoading ? 'Approving...' : 'Approve Registration'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteRegistration(selectedRegistration.id)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Registration
                  </button>
                </div>
                <button
                  onClick={() => setSelectedRegistration(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}
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