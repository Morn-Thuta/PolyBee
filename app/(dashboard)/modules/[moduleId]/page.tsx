export const dynamic = 'force-dynamic'
export const revalidate = 0

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DeleteModuleButton } from '@/components/modules/DeleteModuleButton'
import { ModuleWorkspace } from '@/components/modules/ModuleWorkspace'

interface Module {
  id: string
  user_id: string
  code: string
  name: string
  colour: string
  created_at: string
}

interface StudyNote {
  id: string
  user_id: string
  module_id: string
  title: string
  content: string
  style: string
  source_file_path: string | null
  created_at: string
  updated_at: string
}

interface ModuleWorkspacePageProps {
  params: {
    moduleId: string
  }
}

export default async function ModuleWorkspacePage({
  params,
}: ModuleWorkspacePageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? ''

  // Fetch module
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .select('*')
    .eq('id', params.moduleId)
    .eq('user_id', userId)
    .single()

  if (moduleError || !moduleData) {
    console.error('Module not found:', moduleError)
    notFound()
  }

  // Fetch notes for this module
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('module_id', params.moduleId)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  const notesList = notes || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Module Colour Dot */}
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: moduleData.colour }}
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {moduleData.code}
            </h1>
            <p className="text-muted-foreground mt-1">{moduleData.name}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <DeleteModuleButton
            moduleId={moduleData.id}
            moduleCode={moduleData.code}
            moduleName={moduleData.name}
          />
        </div>
      </div>

      {/* Module Workspace with Dialog UI */}
      <ModuleWorkspace
        moduleId={moduleData.id}
        moduleCode={moduleData.code}
        moduleName={moduleData.name}
        notes={notesList}
      />
    </div>
  )
}
