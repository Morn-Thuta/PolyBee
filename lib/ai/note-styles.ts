export type NoteStyle = 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'

export interface NoteStyleDefinition {
  id: NoteStyle
  label: string
  description: string
  icon: string
  preview: string
  systemPrompt: string
}

export const NOTE_STYLES: NoteStyleDefinition[] = [
  {
    id: 'notion-friendly',
    label: 'Notion-Friendly',
    description: 'Clean headers, bullet points, and callouts — perfect for Notion import',
    icon: 'FileText',
    preview: `## Topic 1: Introduction
- Key concept explained clearly
- Important point highlighted
- Supporting detail

> 💡 **Key Insight:** This is an important definition or warning

### Subtopic 1.1
- Detailed explanation
- Example provided`,
    systemPrompt: `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.

Format the notes as clean Markdown optimised for Notion import:
- Use ## for topic headings, ### for subtopics
- Use bullet points for key facts
- Wrap key terms in **bold**
- Add a > blockquote callout for important warnings or definitions
- Keep the structure clean and scannable

Output only Markdown. Do not include any preamble or explanation.`,
  },
  {
    id: 'deep-dive',
    label: 'Deep Dive',
    description: 'Comprehensive explanations with examples and context',
    icon: 'BookOpen',
    preview: `## Topic 1: Introduction

This concept refers to... [2-4 sentence explanation]

**Example:** Consider the case where...

**Why this matters:** Understanding this is crucial because...

### Step-by-step Process
1. First, we need to...
2. Then, we proceed to...
3. Finally, we conclude with...`,
    systemPrompt: `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.

Produce comprehensive study notes:
- Explain every concept fully in 2–4 sentences
- Include examples where applicable
- Add a "Why this matters" note for complex topics
- Use numbered lists for step-by-step processes
- Provide context and connections between concepts

Output only Markdown. Do not include any preamble or explanation.`,
  },
  {
    id: 'quick-summary',
    label: 'Quick Summary',
    description: 'Concise bullet points for rapid review',
    icon: 'Zap',
    preview: `## Topic 1
- Key point 1 (under 20 words)
- Key point 2 (under 20 words)
- Key point 3 (under 20 words)

## Topic 2
- Essential fact 1
- Essential fact 2`,
    systemPrompt: `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.

Produce a concise summary only:
- Maximum 3 bullet points per slide or topic
- Use plain language, avoid jargon unless necessary
- Each point must be under 20 words
- Focus only on the most essential information

Output only Markdown. Do not include any preamble or explanation.`,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Define your own format with custom instructions',
    icon: 'Settings',
    preview: 'Define your own format by providing custom instructions below.',
    systemPrompt: `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.

Follow the custom formatting instructions provided by the student.

Output only Markdown. Do not include any preamble or explanation.`,
  },
]

/**
 * Get a note style definition by ID
 */
export function getNoteStyle(styleId: NoteStyle): NoteStyleDefinition | undefined {
  return NOTE_STYLES.find((style) => style.id === styleId)
}

/**
 * Get the default note style
 */
export function getDefaultNoteStyle(): NoteStyleDefinition {
  return NOTE_STYLES[2] // Quick Summary
}
