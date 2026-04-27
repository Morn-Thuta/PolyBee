'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modules: Module[]
  onEventAdded: (event: CalendarEvent) => void
}

export function AddEventDialog({
  open,
  onOpenChange,
  modules,
  onEventAdded,
}: AddEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('ca')
  const [moduleId, setModuleId] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !eventDate || !moduleId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          event_date: eventDate,
          event_type: eventType,
          module_id: moduleId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const newEvent = await response.json()
      onEventAdded(newEvent)
      toast.success('Event added successfully')

      // Reset form
      setTitle('')
      setDescription('')
      setEventDate('')
      setEventType('ca')
      setModuleId('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
          <DialogDescription>
            Create a new event for your academic calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., CA1 Submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Module */}
          <div className="space-y-2">
            <Label htmlFor="module">
              Module <span className="text-red-500">*</span>
            </Label>
            <select
              id="module"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.code} — {module.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="event-type">
              Event Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="event-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              disabled={loading}
            >
              <option value="ca">CA (Continuous Assessment)</option>
              <option value="submission">Submission</option>
              <option value="quiz">Quiz</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
