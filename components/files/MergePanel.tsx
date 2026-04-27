'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FileText, 
  Download, 
  Loader2, 
  GripVertical,
  X
} from 'lucide-react'
import { mergePDFs, getPdfPageCount } from '@/lib/files/pdf-merge'
import { FileUploader } from '@/components/files/FileUploader'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface StagedFile {
  id: string
  filename: string
  storagePath: string
  pageCount: number
}

// Sortable File Item Component
function SortableFileItem({ file, index, onRemove }: { 
  file: StagedFile
  index: number
  onRemove: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 border-2 rounded-lg bg-white hover:border-blue-200 transition-colors"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Order Number */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {file.filename}
        </p>
        <p className="text-sm text-gray-500">
          {file.pageCount > 0 
            ? `${file.pageCount} page${file.pageCount !== 1 ? 's' : ''}`
            : 'Ready to merge'
          }
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(file.id)}
        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Remove file"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
}

export function MergePanel() {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [merging, setMerging] = useState(false)
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleNewFileUpload = async (storagePath: string, filename: string) => {
    try {
      // Add file to staged list immediately (we'll get page count during merge)
      const stagedFile: StagedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        filename,
        storagePath,
        pageCount: 0, // Will be calculated during merge
      }

      setStagedFiles((prev) => [...prev, stagedFile])
      toast.success(`${filename} added`)
    } catch (error) {
      console.error('Error adding uploaded file:', error)
      toast.error('Failed to add file')
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setStagedFiles((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const removeFile = (id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleMerge = async () => {
    if (stagedFiles.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge')
      return
    }

    setMerging(true)
    setMergedBlobUrl(null)

    try {
      // Fetch all files from Supabase Storage via API route (uses service role key)
      const fileBlobs: Blob[] = []
      const updatedFiles: StagedFile[] = []

      for (const file of stagedFiles) {
        // Use API route to download file (bypasses RLS with service role key)
        const response = await fetch('/api/download-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storagePath: file.storagePath }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch ${file.filename}`)
        }

        const blob = await response.blob()
        fileBlobs.push(blob)
        
        // Get page count if not already set
        const pageCount = file.pageCount || await getPdfPageCount(blob)
        updatedFiles.push({ ...file, pageCount })
      }

      // Update staged files with page counts
      setStagedFiles(updatedFiles)

      // Merge PDFs
      const mergedBlob = await mergePDFs(fileBlobs)

      // Create a blob URL for download
      const blobUrl = URL.createObjectURL(mergedBlob)
      setMergedBlobUrl(blobUrl)

      toast.success('PDFs merged successfully!')
    } catch (error) {
      console.error('Merge error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to merge PDFs')
    } finally {
      setMerging(false)
    }
  }

  const handleDownload = () => {
    if (!mergedBlobUrl) return

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `merged_${timestamp}.pdf`

    const link = document.createElement('a')
    link.href = mergedBlobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Download started!')
  }

  const totalPages = stagedFiles.reduce((sum, file) => sum + file.pageCount, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Simple Header */}
      <div>
        <p className="text-gray-600">
          Upload multiple PDF files and merge them into a single document. Perfect for combining lecture slides for open-book exams.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload PDF Files</h2>
            <p className="text-sm text-gray-600">
              Drag and drop multiple PDF files here, or click to browse. Files will be added to the merge queue automatically.
            </p>
            <FileUploader
              onUploadComplete={handleNewFileUpload}
              accept={{
                'application/pdf': ['.pdf'],
              }}
            />
            {stagedFiles.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700">
                  {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''} uploaded
                  {totalPages > 0 && ` • ${totalPages} total pages`}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Files List */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Files to Merge ({stagedFiles.length})
              </h2>
              {stagedFiles.length >= 2 && (
                <span className="text-sm text-green-600 font-medium">
                  ✓ Ready to merge
                </span>
              )}
            </div>

            {stagedFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No files uploaded yet
                </h3>
                <p className="text-gray-600 mb-1">
                  Upload at least 2 PDF files to get started
                </p>
                <p className="text-sm text-gray-500">
                  Files will appear here as you upload them
                </p>
              </div>
            ) : (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={stagedFiles.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {stagedFiles.map((file, index) => (
                        <SortableFileItem
                          key={file.id}
                          file={file}
                          index={index}
                          onRemove={removeFile}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-3">
                  <Button
                    onClick={handleMerge}
                    disabled={stagedFiles.length < 2 || merging}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    {merging ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Merging {stagedFiles.length} files...
                      </>
                    ) : (
                      <>
                        Merge {stagedFiles.length} PDF{stagedFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>

                  {mergedBlobUrl && (
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full h-12 text-base border-2 border-green-500 text-green-700 hover:bg-green-50"
                      size="lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Merged PDF{totalPages > 0 && ` (${totalPages} pages)`}
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
