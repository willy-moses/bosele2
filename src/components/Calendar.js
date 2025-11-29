'use client'

import { useState, useEffect } from 'react'

// Simple SVG chevron components
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const upcomingEvents = [
    { date: 'August 10, 2025', event: 'Monthly Kgotla Meeting - 10:00 AM' },
    { date: 'August 15, 2025', event: 'Youth Skills Training Workshop - 2:00 PM' },
    { date: 'August 22, 2025', event: 'Health Screening Day - 9:00 AM' }
  ]

  const eventDays = upcomingEvents.map(e => new Date(e.date).getDate())

 useEffect(() => {
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Empty cells before the first day
    for (let i = 0; i < startingDayOfWeek; i++) days.push({ day: '', isEmpty: true })

    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
      const hasEvent = eventDays.includes(day)
      days.push({ day, isEmpty: false, isToday, hasEvent })
    }

    setCalendarDays(days)
  }

  generateCalendar()
}, [currentDate, eventDays])

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">Community Calendar</h2>
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </button>
            <h3 className="text-2xl font-bold text-blue-600">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
              <ChevronRight className="w-6 h-6 text-blue-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-8">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="bg-gray-100 p-3 text-center font-semibold text-blue-600 text-sm">{day}</div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((dayObj, idx) => (
              <div
                key={idx}
                className={`p-3 text-center text-sm min-h-[48px] flex items-center justify-center cursor-pointer transition-colors 
                  ${dayObj.isEmpty ? '' :
                    dayObj.isToday ? 'bg-blue-500 text-white font-bold rounded-lg' :
                    dayObj.hasEvent ? 'bg-green-100 text-blue-600 font-bold hover:bg-green-200 rounded-lg' :
                    'hover:bg-gray-100 rounded-lg'
                  }`}
                title={dayObj.hasEvent ? 'Event scheduled' : dayObj.isToday ? 'Today' : ''}
              >
                {dayObj.day}
              </div>
            ))}
          </div>

          {/* Upcoming Events */}
          <div>
            <h4 className="text-xl font-bold text-blue-600 mb-4">Upcoming Events</h4>
            <div className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="font-bold text-blue-600 mb-1">{event.date}</div>
                  <div className="text-gray-700">{event.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
