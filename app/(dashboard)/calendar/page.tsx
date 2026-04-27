export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/CalendarClient'

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

export default async function CalendarPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '00000000-0000-0000-0000-000000000001'

  // Fetch modules
  const { data: modules } = await supabase
    .from('modules')
    .select('id, code, name, colour')
    .eq('user_id', userId)
    .order('code', { ascending: true })

  // Fetch calendar events
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true })

  return (
    <CalendarClient
      modules={modules || []}
      events={events || []}
    />
  )
}
