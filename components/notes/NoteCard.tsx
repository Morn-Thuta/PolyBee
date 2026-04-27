'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, ExternalLink, Trash2 } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { StudyNote, NoteStyle } from '@/supabase/types'

interface NoteCardProps {
  note: StudyNote
  moduleId: string
}

// Note style configuration with colors
const noteStyleConfig: Record<
  NoteStyle,
  { label: string; color: string; bgColor: string }
> = {
  'notion-friendly': {
    label: 'Notion-Friendly',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  'deep-dive': {
    label: 'Deep Dive',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  'quick-summary': {
    label: 'Quick Summary',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  custom: {
    label: 'Custom',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
}

export function NoteCard({ note, moduleId }: NoteCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const styleConfig = noteStyleConfig[note.style]
  const noteUrl = `/modules/${moduleId}/notes/${note.id}`

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Delete "${note.title}"? This cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/modules/${moduleId}/notes/${note.id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete note. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(noteUrl)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative">
      <Link href={noteUrl}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
              {note.title}
            </h3>
            {/* Context Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Note options</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpen}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-2">
            {/* Style Badge */}
            <Badge
              variant="secondary"
              className={`${styleConfig.bgColor} ${styleConfig.color} border-0`}
            >
              {styleConfig.label}
            </Badge>
            {/* Relative Date */}
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(note.updated_at)}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
