export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import { ModuleCard } from '@/components/modules/ModuleCard'
import Link from 'next/link'

interface Module {
  id: string
  user_id: string
  code: string
  name: string
  colour: string
  created_at: string
}

interface ModuleWithStats extends Module {
  note_count: number
  last_updated: string
}

export default async function ModulesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all modules for the current user
  let modules: ModuleWithStats[] = []

  try {
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('user_id', user?.id ?? '')
      .order('created_at', { ascending: false })

    if (!modulesError && modulesData) {
      // For now, just use basic module data without note counts
      modules = modulesData.map(module => ({
        ...module,
        note_count: 0, // TODO: implement when notes are working
        last_updated: module.created_at,
      }))
    } else {
      console.error('Error fetching modules:', modulesError)
    }
  } catch (error) {
    console.error('Failed to fetch modules:', error)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Modules</h1>
          <p className="text-muted-foreground mt-1">
            Manage your academic modules and study materials
          </p>
        </div>
        <Button asChild>
          <Link href="/modules/new">
            <Plus className="w-4 h-4 mr-2" />
            New Module
          </Link>
        </Button>
      </div>

      {/* Module Cards Grid */}
      {modules.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No modules yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first module to start organizing your study materials
            and notes.
          </p>
          <Button asChild>
            <Link href="/modules/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Module
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  )
}
