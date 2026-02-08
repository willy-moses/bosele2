'use client'
import { useState, useEffect } from 'react'
import { Mail, Phone, Calendar, Trash2, Eye, X, CheckCircle } from 'lucide-react'

export default function MessagesManagement() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching messages...')
      
      const res = await fetch('/api/contact')
      console.log('📊 Response status:', res.status)
      
      const data = await res.json()
      console.log('📦 Response data:', data)
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch messages')
      }
      
      let messagesArray = data
      
      if (data.messages && Array.isArray(data.messages)) {
        messagesArray = data.messages
      } else if (!Array.isArray(data)) {
        console.error('❌ Expected array or {messages: []}, got:', data)
        setMessages([])
        setError('Invalid data format received')
        return
      }
      
      console.log('✅ Valid data with', messagesArray.length, 'items')
      setMessages(messagesArray)
    } catch (error) {
      console.error('❌ Error fetching messages:', error)
      setError(error.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewMessage = async (message) => {
    setSelectedMessage(message)
    
    // Mark notification as read when viewing message
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: message.id,
          reference_type: 'contact'
        })
      })
      
      window.dispatchEvent(new Event('notificationUpdate'))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAsRead = async (message) => {
    try {
      console.log('📧 Marking message as read:', message.id)
      
      // Update message status to 'read'
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: message.id,
          status: 'read'
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to mark message as read')
      }

      console.log('✅ Message marked as read')

      // Delete the notification
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: message.id,
          reference_type: 'contact'
        })
      })

      console.log('✅ Notification deleted')

      // Update local state
      setMessages(messages.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ))

      // Close modal if viewing this message
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' })
      }

      // Update notification count
      window.dispatchEvent(new Event('notificationUpdate'))
    } catch (error) {
      console.error('❌ Error marking message as read:', error)
      setError(error.message)
    }
  }

  const handleDeleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      console.log('🗑️ Deleting message:', id)
      
      // Delete the notification first
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_id: id,
          reference_type: 'contact'
        })
      })

      console.log('✅ Notification deleted')

      // Delete the message
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        console.log('✅ Message deleted successfully')
        setMessages(messages.filter(m => m.id !== id))
        setSelectedMessage(null)
        
        // Update notification count
        window.dispatchEvent(new Event('notificationUpdate'))
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      setError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
        <p className="font-semibold">Error loading messages</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={fetchMessages}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6 border-b-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
            <p className="text-gray-600 mt-1">Manage and respond to contact form submissions</p>
          </div>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-semibold">Total Messages</p>
            <p className="text-2xl font-bold text-blue-900">{messages.length}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-600 font-semibold">Unread</p>
            <p className="text-2xl font-bold text-yellow-900">
              {messages.filter(m => m.status === 'unread').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-600 font-semibold">Read</p>
            <p className="text-2xl font-bold text-green-900">
              {messages.filter(m => m.status === 'read').length}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No messages found
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {msg.first_name} {msg.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{msg.email}</div>
                      {msg.phone && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {msg.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {msg.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        msg.status === 'read' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {msg.status || 'unread'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewMessage(msg)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors mr-2"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {msg.status !== 'read' && (
                        <button
                          onClick={() => handleMarkAsRead(msg)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors mr-2"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Message Details</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* From Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">From</p>
                <p className="font-semibold text-lg text-gray-900">
                  {selectedMessage.first_name} {selectedMessage.last_name}
                </p>
                <div className="flex items-center mt-2 text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center mt-1 text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                      {selectedMessage.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Subject</p>
                <p className="font-medium text-gray-900 text-lg">{selectedMessage.subject}</p>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Message</p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Date & Status */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedMessage.status === 'read' 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }`}>
                  {selectedMessage.status || 'unread'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              {selectedMessage.status !== 'read' && (
                <button
                  onClick={() => handleMarkAsRead(selectedMessage)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Message
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}