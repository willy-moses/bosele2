'use client'
import { useState, useEffect } from 'react'

const RegistrationsManagement = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/registrations')
      const data = await res.json()
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true
    return reg.status === filter
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      waitlist: 'bg-blue-100 text-blue-800',
      enrolled: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center py-8">Loading registrations...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Daycare Registrations</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredRegistrations.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No registrations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold">Parent Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Child Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Age</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold">Start Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{reg.parentName}</td>
                    <td className="py-3 px-4 font-medium">{reg.childName}</td>
                    <td className="py-3 px-4">{reg.childAge}</td>
                    <td className="py-3 px-4">{reg.email}</td>
                    <td className="py-3 px-4">{reg.phone}</td>
                    <td className="py-3 px-4">{new Date(reg.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reg.status)}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegistrationsManagement