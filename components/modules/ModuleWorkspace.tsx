'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileText, Upload, Sparkles, MoreVertical, Trash2, Eye, Loader2 } from 'lucide-react'
import { FileUploader } from '@/components/files/FileUploader'
import { StyleSelector } from '@/components/notes/StyleSelector'
import { NoteStyle } from '@/lib/ai/note-styles'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  content: string
  style: string
  source_file_path: string | null
  created_at: string
  updated_at: string
}

interface ModuleWorkspaceProps {
  moduleId: string
  moduleCode: string
  moduleName: string
  notes: Note[]
}

export function ModuleWorkspace({
  moduleId,
  moduleCode,
  moduleName,
  notes: initialNotes,
}: ModuleWorkspaceProps) {
  const router = useRouter()
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    storagePath: string
    filename: string
    mimeType: string
  } | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle>('quick-summary')
  const [customInstructions, setCustomInstructions] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)

  const handleUploadComplete = (storagePath: string, filename: string) => {
    const mimeType = filename.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'

    setUploadedFile({ storagePath, filename, mimeType })
    // Auto-suggest title from filename
    const titleSuggestion = filename.replace(/\.(pdf|pptx)$/i, '')
    setNoteTitle(titleSuggestion)

    // Auto-extract text
    handleExtractText(storagePath, mimeType)
  }

  const handleExtractText = async (storagePath: string, mimeType: string) => {
    setExtracting(true)

    try {
      let text: string | null = null

      // Both PDF and PPTX are handled server-side — the API route detects
      // the file type by magic bytes and uses the appropriate extractor.
      console.log('Extracting text from:', storagePath, '(type:', mimeType, ')')
      const response = await fetch('/api/extract-pptx-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Extraction failed:', errorData)
        throw new Error(errorData.error || 'Failed to extract text from file')
      }

      const data = await response.json()
      text = data.text

      console.log('Extracted text length:', text?.length || 0)

      if (!text) {
        toast.error('Could not extract text from this file. Try a text-based PDF or PPTX.')
        setExtractedText(null)
      } else {
        setExtractedText(text)
        toast.success('Text extracted successfully!')
      }
    } catch (err) {
      console.error('Text extraction error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to extract text. Please try again.')
      setExtractedText(null)
    } finally {
      setExtracting(false)
    }
  }

  const handleGenerateNotes = async () => {
    if (!uploadedFile || !extractedText || !noteTitle.trim()) {
      toast.error('Please provide a title for your note')
      return
    }

    setGenerating(true)

    try {
      // Step 1: Generate notes with AI
      const generateResponse = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: extractedText,
          style: selectedStyle,
          customInstructions: selectedStyle === 'custom' ? customInstructions : undefined,
        }),
      })

      const generateData = await generateResponse.json()

      if (!generateResponse.ok) {
        if (generateData.error === 'NO_TEXT') {
          toast.error('Could not extract text from this file.')
        } else {
          toast.error(generateData.error || 'Note generation failed.')
        }
        setGenerating(false)
        return
      }

      // Step 2: Save note to module
      const saveResponse = await fetch(`/api/modules/${moduleId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          content: generateData.notes,
          style: selectedStyle,
          source_file_path: uploadedFile.storagePath,
        }),
      })

      if (!saveResponse.ok) {
        const saveData = await saveResponse.json()
        toast.error(saveData.error || 'Failed to save note')
        setGenerating(false)
        return
      }

      // Success!
      toast.success(`Notes saved to ${moduleCode}!`)
      setShowUploadDialog(false)
      setUploadedFile(null)
      setExtractedText(null)
      setNoteTitle('')
      
      // Refresh the page to show new note
      router.refresh()
    } catch (err) {
      console.error('Note generation error:', err)
      toast.error('Note generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleStyleChange = (style: NoteStyle, instructions?: string) => {
    setSelectedStyle(style)
    if (instructions !== undefined) {
      setCustomInstructions(instructions)
    }
  }

  const canGenerate = uploadedFile && extractedText && noteTitle.trim().length > 0 && !extracting && !generating

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes List - Notion Style */}
      {initialNotes.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm">
              Upload lecture slides and generate AI-powered study notes for {moduleCode}
            </p>
            <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create Your First Note
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-500 border-b">
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Style</div>
            <div className="col-span-3">Last Updated</div>
            <div className="col-span-1"></div>
          </div>

          {/* Notes Rows */}
          {initialNotes.map((note) => (
            <Link
              key={note.id}
              href={`/modules/${moduleId}/notes/${note.id}`}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="col-span-6 flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate">
                  {note.title}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {note.style.replace('-', ' ')}
                </span>
              </div>
              <div className="col-span-3 flex items-center">
                <span className="text-sm text-gray-500">
                  {formatRelativeDate(note.updated_at)}
                </span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Upload & Generate Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Upload lecture slides and generate AI-powered study notes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: Upload File */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">
                1. Upload Slide File
              </h3>
              <FileUploader
                onUploadComplete={handleUploadComplete}
              />
            </div>

            {/* Extracting Status */}
            {extracting && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting text from file...
              </div>
            )}

            {/* Step 2: Note Title */}
            {uploadedFile && extractedText && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  2. Note Title
                </h3>
                <Input
                  placeholder="e.g., Week 3 Lecture Notes"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
            )}

            {/* Step 3: Choose Style */}
            {uploadedFile && extractedText && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">
                  3. Choose Note Style
                </h3>
                <StyleSelector
                  value={selectedStyle}
                  onChange={handleStyleChange}
                  defaultStyle="quick-summary"
                  showPreview={false}
                />
              </div>
            )}

            {/* Generate Button */}
            {uploadedFile && extractedText && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false)
                    setUploadedFile(null)
                    setExtractedText(null)
                    setNoteTitle('')
                  }}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateNotes}
                  disabled={!canGenerate}
                  className="gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Notes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
