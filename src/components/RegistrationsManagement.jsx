'use client'
import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Baby, FileText, X, Trash2, Eye, Briefcase, AlertCircle, Heart, Clock, CheckCircle, RefreshCw } from 'lucide-react'

export default function RegistrationsManagement() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching registrations...')
      const res = await fetch('/api/registrations', {
        cache: 'no-store' // Prevent caching
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
  }

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
      
      // Update registration status
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

      // Delete the notification for this registration
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: id,
          reference_type: 'registration'
        })
      })

      console.log('✅ Notification deleted, refreshing data...')

      // Trigger notification update
      window.dispatchEvent(new Event('notificationUpdate'))

      // **IMPORTANT: Refetch data from database**
      await fetchRegistrations()

      // Close modal if it's open
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
      
      // Delete notification first
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: id,
          reference_type: 'registration'
        })
      })

      console.log('✅ Notification deleted, deleting registration...')

      // Delete registration
      const res = await fetch(`/api/registrations?id=${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()
      console.log('📦 Delete response:', data)

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete registration')
      }

      console.log('✅ Registration deleted, refreshing data...')

      // Trigger notification update
      window.dispatchEvent(new Event('notificationUpdate'))

      // **IMPORTANT: Refetch data from database**
      await fetchRegistrations()

      // Close modal
      setSelectedRegistration(null)

      alert('Registration deleted successfully!')
    } catch (error) {
      console.error('❌ Error deleting registration:', error)
      alert('Failed to delete registration: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      waitlist: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {(status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)}
      </span>
    )
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
            <p className="text-2xl font-bold text-blue-900">{registrations.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {registrations.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Approved</p>
            <p className="text-2xl font-bold text-green-900">
              {registrations.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-600 font-semibold">Waitlist</p>
            <p className="text-2xl font-bold text-purple-900">
              {registrations.filter(r => r.status === 'waitlist').length}
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
              {registrations.length === 0 ? (
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
                      {getStatusBadge(reg.status)}
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
                    <div className="mt-1">{getStatusBadge(selectedRegistration.status)}</div>
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