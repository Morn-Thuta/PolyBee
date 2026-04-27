'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { createClient } from '@/lib/supabase/client'
import { Module } from '@/supabase/types'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface SaveNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteContent: string
  noteStyle: string
  sourceFilePath?: string
}

export function SaveNoteModal({
  open,
  onOpenChange,
  noteContent,
  noteStyle,
  sourceFilePath,
}: SaveNoteModalProps) {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string>('')
  const [noteTitle, setNoteTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingModules, setFetchingModules] = useState(true)

  const supabase = createClient()

  // Fetch user's modules
  const fetchModules = useCallback(async () => {
    setFetchingModules(true)
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setModules(data || [])
      if (data && data.length > 0) {
        setSelectedModuleId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setFetchingModules(false)
    }
  }, [supabase])

  useEffect(() => {
    if (open) {
      fetchModules()
    }
  }, [open, fetchModules])

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      toast.error('Please enter a note title')
      return
    }

    if (!selectedModuleId) {
      toast.error('Please select a module')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/modules/${selectedModuleId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: noteContent,
          style: noteStyle,
          source_file_path: sourceFilePath,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save note')
      }

      const moduleName = modules.find((m) => m.id === selectedModuleId)?.name || 'module'

      toast.success(`Notes saved to ${moduleName}`)
      onOpenChange(false)

      // Redirect to module page
      router.push(`/modules/${selectedModuleId}`)
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error('Save failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = () => {
    onOpenChange(false)
    router.push('/modules/new')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Notes to Module</DialogTitle>
          <DialogDescription>
            Choose a module and give your notes a title
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Note Title */}
          <div className="space-y-2">
            <Label htmlFor="note-title">Note Title</Label>
            <Input
              id="note-title"
              placeholder="e.g., Week 3 Lecture Notes"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <Label htmlFor="module-select">Destination Module</Label>
            {fetchingModules ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">
                  You don&apos;t have any modules yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateModule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Module
                </Button>
              </div>
            ) : (
              <select
                id="module-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                disabled={loading}
              >
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.code} — {module.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Create New Module Link */}
          {modules.length > 0 && (
            <button
              onClick={handleCreateModule}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              disabled={loading}
            >
              + Create new module
            </button>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !noteTitle.trim() || !selectedModuleId}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
