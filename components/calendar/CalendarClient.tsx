'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { AddEventDialog } from '@/components/calendar/AddEventDialog'
import { EventsList } from '@/components/calendar/EventsList'
import { MiniCalendar } from '@/components/calendar/MiniCalendar'

interface Module {
  id: string
  code: string
  name: string
  colour: string
}

interface CalendarEvent {
  id: string
  module_id: string
  title: string
  description: string | null
  event_date: string
  event_type: string
  created_at: string
  updated_at: string
}

interface CalendarClientProps {
  modules: Module[]
  events: CalendarEvent[]
}

export function CalendarClient({ modules, events: initialEvents }: CalendarClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Filter events by selected module
  const filteredEvents = selectedModule === 'all'
    ? events
    : events.filter(e => e.module_id === selectedModule)

  // Get upcoming events (future dates)
  const upcomingEvents = filteredEvents
    .filter(e => new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())

  // Get past events
  const pastEvents = filteredEvents
    .filter(e => new Date(e.event_date) < new Date())
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())

  const handleEventAdded = (newEvent: CalendarEvent) => {
    setEvents([...events, newEvent])
  }

  const handleEventDeleted = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId))
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Academic Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your assignments, quizzes, and important dates
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calendar & Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mini Calendar */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-2 text-xs"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <MiniCalendar
              currentDate={currentDate}
              events={filteredEvents}
              modules={modules}
            />
          </Card>

          {/* Module Filter */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold">Filter by Module</h2>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedModule('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedModule === 'all'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                All Modules
              </button>
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedModule === module.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: module.colour }}
                  />
                  <span className="truncate">{module.code}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Events List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first event to get started
                </p>
              </div>
            ) : (
              <EventsList
                events={upcomingEvents}
                modules={modules}
                onEventDeleted={handleEventDeleted}
              />
            )}
          </Card>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-500">Past Events</h2>
              <EventsList
                events={pastEvents}
                modules={modules}
                onEventDeleted={handleEventDeleted}
                isPast
              />
            </Card>
          )}
        </div>
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        modules={modules}
        onEventAdded={handleEventAdded}
      />
    </div>
  )
}
