export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

interface Module {
  id: string
  user_id: string
  code: string
  name: string
  colour: string
  created_at: string
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch modules for the current user
  let modules: Module[] = []

  try {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('user_id', user?.id ?? '')
      .order('created_at', { ascending: true })

    if (!error && data) {
      modules = data as Module[]
    } else {
      console.error('Error fetching modules for sidebar:', error)
    }
  } catch (error) {
    console.error('Failed to fetch modules for sidebar:', error)
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar modules={modules} />
      <main className="lg:pl-64 h-full overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="container mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
