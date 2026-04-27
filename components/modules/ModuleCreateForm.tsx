'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const PRESET_COLOURS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Orange', hex: '#f59e0b' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Lime', hex: '#84cc16' },
]

interface FormErrors {
  code?: string
  name?: string
  general?: string
}

export function ModuleCreateForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [colour, setColour] = useState(PRESET_COLOURS[0].hex)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!code.trim()) {
      newErrors.code = 'Module code is required'
    }

    if (!name.trim()) {
      newErrors.name = 'Module name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          name: name.trim(),
          colour,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          // Duplicate module code
          setErrors({ code: data.error || 'Module code already exists' })
        } else if (response.status === 401) {
          setErrors({ general: 'You must be logged in to create a module' })
        } else {
          setErrors({ general: data.error || 'Failed to create module' })
        }
        return
      }

      // Success
      toast.success('Module created successfully!')
      
      // Navigate to modules list page which will show the new module
      router.push('/modules')
      router.refresh()
    } catch (error) {
      console.error('Error creating module:', error)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Module Code */}
      <div className="space-y-2">
        <Label htmlFor="code">
          Module Code <span className="text-destructive">*</span>
        </Label>
        <Input
          id="code"
          type="text"
          placeholder="e.g. INF1005"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            // Clear error when user starts typing
            if (errors.code) {
              setErrors((prev) => ({ ...prev, code: undefined }))
            }
          }}
          className={errors.code ? 'border-destructive' : ''}
          disabled={isSubmitting}
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code}</p>
        )}
      </div>

      {/* Module Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Module Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Programming Fundamentals"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            // Clear error when user starts typing
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: undefined }))
            }
          }}
          className={errors.name ? 'border-destructive' : ''}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Colour Swatchboard */}
      <div className="space-y-2">
        <Label>Colour</Label>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLOURS.map((presetColour) => (
            <button
              key={presetColour.hex}
              type="button"
              onClick={() => setColour(presetColour.hex)}
              className={`w-10 h-10 rounded-md transition-all ${
                colour === presetColour.hex
                  ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: presetColour.hex }}
              title={presetColour.name}
              disabled={isSubmitting}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          This colour will be used in the sidebar and calendar
        </p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.general}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Module'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
