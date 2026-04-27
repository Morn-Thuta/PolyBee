'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { NoteEditor } from './NoteEditor'
import { NoteStyle } from '@/lib/ai/note-styles'

interface NoteDetailClientProps {
  noteId: string
  moduleId: string
  initialContent: string
  currentStyle: NoteStyle
}

export function NoteDetailClient({
  noteId,
  moduleId,
  initialContent,
  currentStyle,
}: NoteDetailClientProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [style, setStyle] = useState<NoteStyle>(currentStyle)

  const handleSave = async (newContent: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save note')
      }

      setContent(newContent)
      toast.success('Note saved successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error saving note:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save note')
    }
  }

  const handleRegenerate = async (newStyle: NoteStyle, customInstructions?: string) => {
    // Regeneration requires the original source file which isn't available here.
    // Use the Generate page to create new notes from a file.
    toast.info('To regenerate notes, use the Generate page with your source file.')
    throw new Error('Regeneration not available from note detail view')
  }

  return (
    <NoteEditor
      initialContent={content}
      currentStyle={style}
      onSave={handleSave}
      onRegenerate={handleRegenerate}
    />
  )
}
