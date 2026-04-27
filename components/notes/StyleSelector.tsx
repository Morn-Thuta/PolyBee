'use client'

import { useState } from 'react'
import { NOTE_STYLES, type NoteStyle } from '@/lib/ai/note-styles'
import { 
  FileText, 
  BookOpen, 
  Zap, 
  Settings,
  type LucideIcon 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  Zap,
  Settings,
}

interface StyleSelectorProps {
  value: NoteStyle
  onChange: (style: NoteStyle, customInstructions?: string) => void
  showPreview?: boolean
  defaultStyle?: NoteStyle
  accentColor?: string
}

export function StyleSelector({
  value,
  onChange,
  showPreview = false,
  defaultStyle,
  accentColor = '#3b82f6',
}: StyleSelectorProps) {
  const [customInstructions, setCustomInstructions] = useState('')
  const [hoveredStyle, setHoveredStyle] = useState<NoteStyle | null>(null)

  const handleStyleSelect = (styleId: NoteStyle) => {
    onChange(styleId, styleId === 'custom' ? customInstructions : undefined)
  }

  const handleCustomInstructionsChange = (instructions: string) => {
    setCustomInstructions(instructions)
    if (value === 'custom') {
      onChange('custom', instructions)
    }
  }

  return (
    <div className="space-y-4">
      {/* Style Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {NOTE_STYLES.map((style) => {
          const Icon = iconMap[style.icon]
          const isSelected = value === style.id
          const isDefault = defaultStyle === style.id

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handleStyleSelect(style.id)}
              onMouseEnter={() => showPreview && setHoveredStyle(style.id)}
              onMouseLeave={() => showPreview && setHoveredStyle(null)}
              className={cn(
                'relative flex flex-col items-start gap-2 p-4 rounded-lg border-2 transition-all text-left',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                isSelected
                  ? 'border-current shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              style={{
                borderColor: isSelected ? accentColor : undefined,
                backgroundColor: isSelected ? `${accentColor}10` : undefined,
                color: isSelected ? accentColor : undefined,
              }}
            >
              {/* Default Badge */}
              {isDefault && (
                <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Default
                </span>
              )}

              {/* Icon and Label */}
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-semibold">{style.label}</span>
              </div>

              {/* Description */}
              <p className={cn(
                'text-sm',
                isSelected ? 'opacity-90' : 'text-gray-600'
              )}>
                {style.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Custom Instructions Textarea */}
      {value === 'custom' && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          <Label htmlFor="custom-instructions">
            Describe your preferred format
          </Label>
          <Textarea
            id="custom-instructions"
            placeholder="Example: Use numbered lists for steps, include code examples, keep explanations brief..."
            value={customInstructions}
            onChange={(e) => handleCustomInstructionsChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
          {customInstructions.trim() === '' && (
            <p className="text-sm text-amber-600">
              Please describe your custom format to continue.
            </p>
          )}
        </div>
      )}

      {/* Preview Panel (if enabled) */}
      {showPreview && (hoveredStyle || value) && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Preview: {NOTE_STYLES.find(s => s.id === (hoveredStyle || value))?.label}
          </h3>
          <div className="prose prose-sm max-w-none">
            {(hoveredStyle || value) === 'custom' ? (
              <p className="text-gray-600 italic">
                Preview not available for Custom style. Define your own format above.
              </p>
            ) : (
              <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded border">
                {NOTE_STYLES.find(s => s.id === (hoveredStyle || value))?.preview}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
