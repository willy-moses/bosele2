'use client'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import UserManagement from './UserManagement'
import MessagesManagement from './MessagesManagement'
import ElderlySchoolersManagement from './ElderlySchoolersManagement'
import ElderlyPeopleManagement from './elderly-people/ElderlyPeopleManagement'
import SanPeopleManagement from './san-people/SanPeopleManagement'   // ← NEW IMPORT

export default function StaffDashboard({ user }) {
  
  const [activeTab, setActiveTab] = useState('overview')
  const [notificationCount, setNotificationCount] = useState(0)
  const [contactNotifications, setContactNotifications] = useState(0)

  console.log('👤 Current user:', user)
  console.log('👤 User role:', user.role)
  console.log('👤 Role uppercase:', user.role?.toUpperCase())
  console.log('👤 Is ADMIN?:', user.role?.toUpperCase() === 'ADMIN')

  useEffect(() => {
    fetchNotificationCount()
    
    const handleNotificationUpdate = () => {
      fetchNotificationCount()
    }
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate)
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate)
    }
  }, [])

  const fetchNotificationCount = async () => {
    try {
      console.log('📊 Fetching notification count...')
      const res = await fetch('/api/notifications/count')
      const data = await res.json()
      setNotificationCount(data.count || 0)
      setContactNotifications(data.contactCount || 0)
    } catch (error) {
      console.error('Error fetching notification count:', error)
    }
  }

  const isAdmin = user.role?.toUpperCase() === 'ADMIN'

  // Tab definitions — label + optional notification source
  const tabs = [
    { id: 'overview',          label: 'Overview' },
    { id: 'messages',          label: 'Messages',          badge: contactNotifications },
    { id: 'elderly-schoolers', label: 'Elderly Schoolers' },
    { id: 'elderly-people',    label: 'Elderly People' },
    { id: 'san-people',        label: 'San / Basarwa' },   // ← NEW TAB
    { id: 'users',             label: 'Users' },
    { id: 'content',           label: 'Content' },
    { id: 'settings',          label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {user.role}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-6 overflow-x-auto">
            {tabs.map(({ id, label, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-emerald-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
              <p className="text-3xl font-bold text-blue-600">1</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unread Notifications</h3>
              <p className="text-3xl font-bold text-orange-600">{notificationCount}</p>
              {notificationCount > 0 && (
                <span className="absolute top-4 right-4 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && <MessagesManagement />}

        {activeTab === 'elderly-schoolers' && <ElderlySchoolersManagement />}

        {activeTab === 'elderly-people' && <ElderlyPeopleManagement />}

        {/* ── NEW TAB CONTENT ────────────────────────────────────────── */}
        {activeTab === 'san-people' && <SanPeopleManagement />}
        {/* ─────────────────────────────────────────────────────────── */}

        {activeTab === 'users' && isAdmin && <UserManagement />}

        {activeTab === 'users' && !isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">You don't have permission to manage users. Only ADMIN users can access this section.</p>
            <p className="text-sm text-yellow-700 mt-2">Your current role: <span className="font-semibold">{user.role}</span></p>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Content Management</h2>
            <p className="text-gray-600">Content management features coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        )}

      </main>
    </div>
  )
}