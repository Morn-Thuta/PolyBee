'use client'

import { NOTE_STYLES, type NoteStyle } from '@/lib/ai/note-styles'
import dynamic from 'next/dynamic'

// Dynamically import the markdown preview component
const MarkdownPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface StylePreviewPanelProps {
  style: NoteStyle
  className?: string
}

export function StylePreviewPanel({ style, className = '' }: StylePreviewPanelProps) {
  const styleDefinition = NOTE_STYLES.find(s => s.id === style)

  if (!styleDefinition) {
    return null
  }

  if (style === 'custom') {
    return (
      <div className={`p-6 border rounded-lg bg-gray-50 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Preview: {styleDefinition.label}
        </h3>
        <div className="text-gray-600 italic">
          <p>Preview not available for Custom style.</p>
          <p className="mt-2">Define your own format in the text area above, and the AI will adapt its output to match your requirements.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 border rounded-lg bg-white ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Preview: {styleDefinition.label}
      </h3>
      <div className="prose prose-sm max-w-none">
        <MarkdownPreview 
          source={styleDefinition.preview}
          style={{ 
            backgroundColor: 'transparent',
            color: 'inherit'
          }}
        />
      </div>
    </div>
  )
}
