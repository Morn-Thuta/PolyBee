'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/files/FileUploader'
import { StyleSelector } from '@/components/notes/StyleSelector'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { SaveNoteModal } from '@/components/notes/SaveNoteModal'
import { Button } from '@/components/ui/button'
import { extractPdfText } from '@/lib/files/pdf-utils'
import { NoteStyle } from '@/lib/ai/note-styles'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

type GenerationState = 'idle' | 'extracting' | 'generating' | 'editing'

export default function GeneratePage() {
  const [state, setState] = useState<GenerationState>('idle')
  const [uploadedFile, setUploadedFile] = useState<{
    storagePath: string
    filename: string
    mimeType: string
  } | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle>('quick-summary')
  const [customInstructions, setCustomInstructions] = useState<string>('')
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const handleUploadComplete = async (storagePath: string, filename: string) => {
    setUploadedFile({
      storagePath,
      filename,
      mimeType: filename.toLowerCase().endsWith('.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })
    setExtractedText(null)
    setGeneratedNotes(null)
    setError(null)
  }

  const handleExtractText = async () => {
    if (!uploadedFile) return

    setState('extracting')
    setError(null)

    try {
      let text: string | null = null

      if (uploadedFile.mimeType === 'application/pdf') {
        // PDFs: get a signed URL from the server (service role key), then
        // extract text client-side using pdfjs (which needs a browser context)
        const urlRes = await fetch('/api/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePath: uploadedFile.storagePath }),
        })

        if (!urlRes.ok) {
          const err = await urlRes.json()
          throw new Error(err.error || 'Failed to get file URL')
        }

        const { signedUrl } = await urlRes.json()
        const fileRes = await fetch(signedUrl)
        if (!fileRes.ok) throw new Error('Failed to download PDF')
        const blob = await fileRes.blob()
        text = await extractPdfText(blob)
      } else {
        // PPTX: extract server-side with officeparser (no browser worker needed)
        const response = await fetch('/api/extract-pptx-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePath: uploadedFile.storagePath }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to extract text from file')
        }

        const data = await response.json()
        text = data.text
      }

      if (!text) {
        setError('Could not extract text from this file. Try a text-based PDF or PPTX.')
        setState('idle')
        return
      }

      setExtractedText(text)
      setState('idle')
    } catch (err) {
      console.error('Text extraction error:', err)
      setError('Failed to extract text. Please try again.')
      setState('idle')
    }
  }

  const handleGenerateNotes = async () => {
    if (!extractedText) return

    setState('generating')
    setError(null)

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: extractedText,
          style: selectedStyle,
          customInstructions: selectedStyle === 'custom' ? customInstructions : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'NO_TEXT') {
          setError('Could not extract text from this file. Try a text-based PDF or PPTX.')
        } else {
          setError(data.error || 'Note generation failed. Please try again.')
        }
        setState('idle')
        return
      }

      setGeneratedNotes(data.notes)
      setState('editing')
      toast.success('Notes generated successfully!')
    } catch (err) {
      console.error('Note generation error:', err)
      setError('Note generation failed. Please try again.')
      setState('idle')
    }
  }

  const handleStyleChange = (style: NoteStyle, instructions?: string) => {
    setSelectedStyle(style)
    if (instructions !== undefined) {
      setCustomInstructions(instructions)
    }
  }

  const handleSave = (content: string) => {
    setGeneratedNotes(content)
    setShowSaveModal(true)
  }

  const handleRegenerate = async (newStyle: NoteStyle, customInstructions?: string) => {
    if (!extractedText) return

    setState('generating')
    setError(null)

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: extractedText,
          style: newStyle,
          customInstructions: newStyle === 'custom' ? customInstructions : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'NO_TEXT') {
          setError('Could not extract text from this file. Try a text-based PDF or PPTX.')
        } else {
          setError(data.error || 'Note generation failed. Please try again.')
        }
        setState('editing')
        throw new Error(data.error || 'Regeneration failed')
      }

      setGeneratedNotes(data.notes)
      setSelectedStyle(newStyle)
      if (customInstructions) {
        setCustomInstructions(customInstructions)
      }
      setState('editing')
      toast.success('Notes regenerated successfully!')
    } catch (err) {
      console.error('Note regeneration error:', err)
      toast.error('Regeneration failed. Please try again.')
      setState('editing')
      throw err
    }
  }

  const canGenerate =
    uploadedFile &&
    extractedText &&
    state === 'idle' &&
    (selectedStyle !== 'custom' || customInstructions.trim().length > 0)

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Study Notes</h1>
        <p className="text-gray-600">
          Upload your lecture slides and let AI create structured study notes
        </p>
      </div>

      {/* Error Display — shown in all states */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {state !== 'editing' ? (
        <div className="space-y-8">
          {/* Step 1: Upload File */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                1
              </span>
              Upload Slide File
            </h2>
            <FileUploader onUploadComplete={handleUploadComplete} />
          </section>

          {/* Step 2: Extract Text (auto-trigger) */}
          {uploadedFile && !extractedText && state !== 'extracting' && (
            <section>
              <Button onClick={handleExtractText} className="w-full" size="lg">
                <FileText className="w-5 h-5 mr-2" />
                Extract Text from {uploadedFile.filename}
              </Button>
            </section>
          )}

          {state === 'extracting' && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg text-gray-600">Extracting text...</span>
            </div>
          )}

          {/* Step 3: Choose Style */}
          {extractedText && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                  2
                </span>
                Choose Note Style
              </h2>
              <StyleSelector
                value={selectedStyle}
                onChange={handleStyleChange}
                defaultStyle="quick-summary"
              />
            </section>
          )}

          {/* Step 4: Generate Button */}
          {extractedText && (
            <section>
              <Button
                onClick={handleGenerateNotes}
                disabled={!canGenerate || state !== 'idle'}
                className="w-full"
                size="lg"
              >
                {state === 'generating' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating your notes...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Notes
                  </>
                )}
              </Button>
            </section>
          )}
        </div>
      ) : (
        /* Step 5: Edit Notes */
        <section>
          <NoteEditor
            initialContent={generatedNotes || ''}
            currentStyle={selectedStyle}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
          />
        </section>
      )}

      {/* Save Note Modal */}
      <SaveNoteModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        noteContent={generatedNotes || ''}
        noteStyle={selectedStyle}
        sourceFilePath={uploadedFile?.storagePath}
      />
    </div>
  )
}
