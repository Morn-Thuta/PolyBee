'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw } from 'lucide-react'
import { NoteStyle } from '@/lib/ai/note-styles'
import { RegenerateModal } from './RegenerateModal'

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { 
    ssr: false,
    loading: () => <div className="h-[600px] flex items-center justify-center border rounded-lg bg-gray-50">Loading editor...</div>
  }
)

interface NoteEditorProps {
  initialContent: string
  currentStyle?: NoteStyle
  onSave: (content: string) => void
  onRegenerate: (style: NoteStyle, customInstructions?: string) => Promise<void>
}

export function NoteEditor({
  initialContent,
  currentStyle = 'quick-summary',
  onSave,
  onRegenerate,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isDirty, setIsDirty] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)

  // Track if content has been edited
  useEffect(() => {
    setIsDirty(content !== initialContent)
  }, [content, initialContent])

  // Update content when initialContent changes (after regeneration)
  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  // Warn user about unsaved changes on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Leave anyway?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const handleSave = () => {
    onSave(content)
    setIsDirty(false)
  }

  const handleRegenerateClick = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Regenerating will discard them. Continue?'
      )
      if (!confirmed) return
    }
    setShowRegenerateModal(true)
  }

  const handleRegenerateConfirm = async (
    style: NoteStyle,
    customInstructions?: string
  ) => {
    await onRegenerate(style, customInstructions)
    setIsDirty(false)
  }

  return (
    <div className="space-y-4">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Edit Your Notes</h2>
          {isDirty && (
            <span className="text-sm text-amber-600 font-medium">
              (Unsaved changes)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRegenerateClick}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            <Save className="w-4 h-4 mr-2" />
            Save to Module
          </Button>
        </div>
      </div>

      {/* Markdown Editor */}
      <div data-color-mode="light">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={600}
          preview="live"
          hideToolbar={false}
        />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleRegenerateClick}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate with Different Style
        </Button>
        <Button onClick={handleSave} disabled={!isDirty} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save to Module
        </Button>
      </div>

      {/* Regenerate Modal */}
      <RegenerateModal
        open={showRegenerateModal}
        onOpenChange={setShowRegenerateModal}
        currentStyle={currentStyle}
        onConfirm={handleRegenerateConfirm}
      />
    </div>
  )
}
