'use client'
import { useState, useEffect } from 'react'

const MessagesManagement = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact/messages')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch('/api/contact/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'read' })
      })
      fetchMessages()
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  const filteredMessages = messages.filter(msg => {
    if (filter === 'all') return true
    return msg.status === filter
  })

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Contact Messages</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Unread ({messages.filter(m => m.status === 'unread').length})
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredMessages.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No messages found.</p>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`border rounded-lg p-4 ${msg.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{msg.subject}</h3>
                    <p className="text-sm text-gray-600">
                      From: {msg.first_name} {msg.last_name} ({msg.email})
                      {msg.phone && ` • ${msg.phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      msg.status === 'unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.status}
                    </span>
                    {msg.status === 'unread' && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesManagement