'use client'

import { Button } from '@/components/ui/button'
import { Trash2, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Module {
  id: string
  code: string
  colour: string
}

interface CalendarEvent {
  id: string
  module_id: string
  title: string
  description: string | null
  event_date: string
  event_type: string
}

interface EventsListProps {
  events: CalendarEvent[]
  modules: Module[]
  onEventDeleted: (eventId: string) => void
  isPast?: boolean
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  ca: 'CA',
  submission: 'Submission',
  quiz: 'Quiz',
  exam: 'Exam',
  other: 'Other',
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  ca: 'bg-red-100 text-red-700',
  submission: 'bg-blue-100 text-blue-700',
  quiz: 'bg-purple-100 text-purple-700',
  exam: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700',
}

export function EventsList({ events, modules, onEventDeleted, isPast = false }: EventsListProps) {
  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar-events/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      onEventDeleted(eventId)
      toast.success('Event deleted')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)

    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const eventModule = modules.find((m) => m.id === event.module_id)
        return (
          <div
            key={event.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              isPast ? 'bg-gray-50 opacity-75' : 'bg-white hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {eventModule && (
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: eventModule.colour }}
                    />
                  )}
                  <span className="text-xs font-medium text-gray-500">
                    {eventModule?.code || 'Unknown Module'}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other
                    }`}
                  >
                    {EVENT_TYPE_LABELS[event.event_type] || 'Other'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(event.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
