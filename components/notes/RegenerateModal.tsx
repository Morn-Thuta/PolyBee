'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StyleSelector } from './StyleSelector'
import { NoteStyle } from '@/lib/ai/note-styles'
import { Loader2 } from 'lucide-react'

interface RegenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStyle: NoteStyle
  onConfirm: (style: NoteStyle, customInstructions?: string) => Promise<void>
}

export function RegenerateModal({
  open,
  onOpenChange,
  currentStyle,
  onConfirm,
}: RegenerateModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle>(currentStyle)
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleStyleChange = (style: NoteStyle, instructions?: string) => {
    setSelectedStyle(style)
    if (instructions !== undefined) {
      setCustomInstructions(instructions)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(
        selectedStyle,
        selectedStyle === 'custom' ? customInstructions : undefined
      )
      onOpenChange(false)
    } catch (error) {
      console.error('Regeneration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const canRegenerate =
    selectedStyle !== 'custom' || customInstructions.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Regenerate Notes</DialogTitle>
          <DialogDescription>
            Choose a different style to regenerate your notes. This will replace the current
            content.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <StyleSelector
            value={selectedStyle}
            onChange={handleStyleChange}
            defaultStyle={currentStyle}
            showPreview={true}
          />
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
            onClick={handleConfirm}
            disabled={!canRegenerate || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate Notes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
