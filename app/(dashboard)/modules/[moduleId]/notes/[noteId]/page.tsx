import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NoteDetailClient } from '@/components/notes/NoteDetailClient'
import type { StudyNote, Module } from '@/supabase/types'

interface NoteDetailPageProps {
  params: {
    moduleId: string
    noteId: string
  }
}

export default async function NoteDetailPage({
  params,
}: NoteDetailPageProps) {
  const supabase = createClient()

  // Fetch note and module in parallel
  const [noteResult, moduleResult] = await Promise.all([
    supabase
      .from('notes')
      .select('*')
      .eq('id', params.noteId)
      .eq('module_id', params.moduleId)
      .single(),
    supabase
      .from('modules')
      .select('*')
      .eq('id', params.moduleId)
      .single(),
  ])

  // Handle not found cases
  if (noteResult.error || !noteResult.data) {
    notFound()
  }

  if (moduleResult.error || !moduleResult.data) {
    notFound()
  }

  const note: StudyNote = noteResult.data
  const moduleData: Module = moduleResult.data

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/modules"
          className="hover:text-foreground transition-colors"
        >
          Modules
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link
          href={`/modules/${moduleData.id}`}
          className="hover:text-foreground transition-colors"
        >
          {moduleData.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{note.title}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-start gap-3">
        {/* Module Colour Dot */}
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: moduleData.colour }}
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{note.title}</h1>
          <p className="text-muted-foreground mt-1">
            {moduleData.code} — {moduleData.name}
          </p>
        </div>
      </div>

      {/* Note Editor */}
      <div className="bg-card rounded-lg border p-6">
        <NoteDetailClient
          noteId={note.id}
          moduleId={moduleData.id}
          initialContent={note.content}
          currentStyle={(note.style as any) || 'quick-summary'}
        />
      </div>
    </div>
  )
}
