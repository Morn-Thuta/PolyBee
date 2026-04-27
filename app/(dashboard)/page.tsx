export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

interface Module {
  id: string
  user_id: string
  code: string
  name: string
  colour: string
  created_at: string
}

interface Note {
  id: string
  title: string
  module_id: string
  updated_at: string
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? '00000000-0000-0000-0000-000000000001'

  // Fetch modules
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Fetch recent notes
  const { data: recentNotes } = await supabase
    .from('notes')
    .select('id, title, module_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  // Count total notes
  const { count: notesCount } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return (
    <DashboardClient
      modules={modules || []}
      recentNotes={recentNotes || []}
      notesCount={notesCount || 0}
    />
  )
}
