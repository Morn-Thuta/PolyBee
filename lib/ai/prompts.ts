import { NoteStyle, getNoteStyle } from './note-styles'

export interface NoteGenerationPrompt {
  systemPrompt: string
  userPrompt: string
}

/**
 * Build a note generation prompt for Gemini API
 * Adapted for Gemini (no cache_control needed)
 * 
 * @param style - The note style to use
 * @param rawText - The extracted text from the slides
 * @param customInstructions - Optional custom instructions for 'custom' style
 * @returns Prompt object with system and user prompts
 */
export function buildNoteGenerationPrompt(
  style: NoteStyle,
  rawText: string,
  customInstructions?: string
): NoteGenerationPrompt {
  const styleDefinition = getNoteStyle(style)

  if (!styleDefinition) {
    throw new Error(`Invalid note style: ${style}`)
  }

  let systemPrompt = styleDefinition.systemPrompt

  // For custom style, append the custom instructions
  if (style === 'custom' && customInstructions) {
    systemPrompt = `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.

${customInstructions}

Output only Markdown. Do not include any preamble or explanation.`
  }

  const userPrompt = `Here is the content extracted from the lecture slides:

${rawText}

Please generate structured study notes following the format specified in the system instructions.`

  return {
    systemPrompt,
    userPrompt,
  }
}
