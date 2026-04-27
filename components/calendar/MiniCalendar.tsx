'use client'

interface Module {
  id: string
  colour: string
}

interface CalendarEvent {
  id: string
  module_id: string
  event_date: string
}

interface MiniCalendarProps {
  currentDate: Date
  events: CalendarEvent[]
  modules: Module[]
}

export function MiniCalendar({ currentDate, events, modules }: MiniCalendarProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Create array of days
  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null) // Empty cells before month starts
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Check if a day has events
  const hasEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.some(e => e.event_date === dateStr)
  }

  // Get event color for a day
  const getEventColor = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const event = events.find(e => e.event_date === dateStr)
    if (!event) return null
    const eventModule = modules.find(m => m.id === event.module_id)
    return eventModule?.colour || '#3b82f6'
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-lg relative
              ${day === null ? '' : 'hover:bg-gray-50 cursor-pointer'}
              ${isToday(day!) ? 'bg-blue-100 text-blue-700 font-bold' : ''}
              ${day && !isToday(day) ? 'text-gray-700' : ''}
            `}
          >
            {day}
            {day && hasEvents(day) && (
              <div
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ backgroundColor: getEventColor(day) || '#3b82f6' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
