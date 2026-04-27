import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateNotes } from '@/lib/ai/openai'
import { buildNoteGenerationPrompt } from '@/lib/ai/prompts'
import { NoteStyle } from '@/lib/ai/note-styles'

// Validation schema
const GenerateNotesSchema = z.object({
  rawText: z.string().min(1, 'Raw text cannot be empty'),
  style: z.enum(['notion-friendly', 'deep-dive', 'quick-summary', 'custom']),
  customInstructions: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Skip auth validation for now (using mock user setup)
    // TODO: Re-enable auth when proper authentication is implemented
    
    // Parse and validate request body
    const body = await request.json()
    const validation = GenerateNotesSchema.safeParse(body)

    if (!validation.success) {
      console.error('Validation error:', validation.error.issues)
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { rawText, style, customInstructions } = validation.data

    console.log('Generating notes with style:', style, 'Text length:', rawText.length)

    // Check if rawText is empty (image-only file)
    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'NO_TEXT', message: 'No extractable text found in the file' },
        { status: 422 }
      )
    }

    // Build prompt for Gemini
    const { systemPrompt, userPrompt } = buildNoteGenerationPrompt(
      style as NoteStyle,
      rawText,
      customInstructions
    )

    console.log('Calling OpenAI API...')

    const notes = await generateNotes(systemPrompt, userPrompt)

    console.log('OpenAI response received, length:', notes.length)

    return NextResponse.json({ notes })

  } catch (error) {
    console.error('Error generating notes:', error)

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API configuration error. Please check your Gemini API key.' },
          { status: 500 }
        )
      }
      // Surface the real Google API error — do not mask it
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Note generation failed. Please try again.' },
      { status: 500 }
    )
  }
}
