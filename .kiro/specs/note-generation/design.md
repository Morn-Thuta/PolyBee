# Note Generation Design

## Overview
The note generation feature extracts text from an uploaded slide file, sends it to the Claude API with a style-specific system prompt, and returns structured Markdown notes displayed in an in-browser editor. Files are stored in Supabase Storage; notes are saved to the `notes` table.

---

## Architecture

```
[Browser]
  FileUploader component
       │  drag-drop / browse
       ▼
[Supabase Storage]
  {userId}/uploads/{filename}
       │  storage path returned
       ▼
[Browser — text extraction]
  pdf-utils.ts (pdfjs-dist)    ← for .pdf
  officeparser API route       ← for .pptx (server-side)
       │  raw text string
       ▼
[API Route: POST /api/generate-notes]
  1. Auth check (Supabase server client)
  2. Build Claude prompt (style from note-styles.ts)
  3. Call Anthropic SDK (claude-sonnet-4-6)
  4. Return { notes: string (Markdown) }
       │
       ▼
[Browser]
  NoteEditor component (MDEditor)
  displays source + preview
       │  user edits + clicks Save
       ▼
[API Route: POST /api/modules/:moduleId/notes]
  INSERT into notes table
```

---

## Data Models

```typescript
// supabase/types.ts (auto-generated, excerpt)

interface Module {
  id: string               // uuid
  user_id: string          // auth.uid()
  code: string             // e.g. "INF1005"
  name: string             // e.g. "Programming Fundamentals"
  colour: string           // hex colour for calendar
  created_at: string
}

interface StudyNote {
  id: string
  user_id: string
  module_id: string        // FK → modules.id
  title: string
  content: string          // Markdown string
  style: NoteStyle         // enum stored as text
  source_file_path: string // Supabase Storage path of the source slide
  created_at: string
  updated_at: string
}

type NoteStyle = 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'
```

### Database Migration (SQL)
```sql
CREATE TABLE modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  code        text NOT NULL,
  name        text NOT NULL,
  colour      text DEFAULT '#F59E0B',
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE notes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users NOT NULL,
  module_id        uuid REFERENCES modules(id) ON DELETE CASCADE,
  title            text NOT NULL,
  content          text NOT NULL,
  style            text NOT NULL DEFAULT 'quick-summary',
  source_file_path text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users own modules" ON modules USING (auth.uid() = user_id);
CREATE POLICY "users own notes"   ON notes   USING (auth.uid() = user_id);
```

---

## Sequence Diagram

```
Student          Browser             Storage          API Route         Claude
  │                │                    │                 │               │
  │ drop file      │                    │                 │               │
  │───────────────►│                    │                 │               │
  │                │ upload to storage  │                 │               │
  │                │───────────────────►│                 │               │
  │                │◄─── storagePath ───│                 │               │
  │                │                    │                 │               │
  │                │ extract text (pdf-lib / API)         │               │
  │                │────────────────────────────────────►│               │
  │                │◄──────────── rawText ───────────────│               │
  │                │                    │                 │               │
  │ click Generate │                    │                 │               │
  │───────────────►│                    │                 │               │
  │                │ POST /api/generate-notes             │               │
  │                │  { rawText, style }                  │               │
  │                │────────────────────────────────────►│               │
  │                │                    │                 │ claude.messages│
  │                │                    │                 │──────────────►│
  │                │                    │                 │◄── markdown ──│
  │                │◄──── { notes } ────────────────────│               │
  │                │                    │                 │               │
  │ edit + save    │                    │                 │               │
  │───────────────►│                    │                 │               │
  │                │ POST /api/modules/:id/notes          │               │
  │                │────────────────────────────────────►│               │
  │                │◄──── { note } ─────────────────────│               │
```

---

## Claude Prompt Strategy

File: `lib/ai/prompts.ts`

```typescript
export function buildNoteGenerationPrompt(style: NoteStyle, customInstructions?: string) {
  const styleInstructions: Record<NoteStyle, string> = {
    'notion-friendly': `Format the notes as clean Markdown optimised for Notion import:
- Use ## for topic headings, ### for subtopics
- Use bullet points for key facts
- Wrap key terms in **bold**
- Add a > blockquote callout for important warnings or definitions`,

    'deep-dive': `Produce comprehensive study notes:
- Explain every concept fully in 2–4 sentences
- Include examples where applicable
- Add a "Why this matters" note for complex topics
- Use numbered lists for step-by-step processes`,

    'quick-summary': `Produce a concise summary only:
- Maximum 3 bullet points per slide or topic
- Use plain language, avoid jargon unless necessary
- Each point must be under 20 words`,

    'custom': customInstructions ?? 'Summarise the slides in a clear, structured format.'
  }

  return {
    system: `You are an expert study assistant for polytechnic students in Singapore.
Your task is to generate study notes from lecture slide content.
${styleInstructions[style]}
Output only Markdown. Do not include any preamble or explanation.`,
    userPrefix: 'Here is the content extracted from the lecture slides:\n\n'
  }
}
```

Prompt caching is applied on the system prompt string (it is identical across requests for the same style) by passing it as a `cache_control: { type: "ephemeral" }` block.

---

## API Route: `/api/generate-notes`

```typescript
// app/api/generate-notes/route.ts
// POST { storagePath: string, rawText: string, style: NoteStyle, customInstructions?: string }
// Returns { notes: string }
```

- Validates auth with Supabase server client
- Validates input with Zod schema
- Calls `buildNoteGenerationPrompt()` from `lib/ai/prompts.ts`
- Calls `claude.messages.create()` with `max_tokens: 4096`
- Returns the assistant message content as `notes`

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| File type not PDF/PPTX | Rejected client-side before upload |
| File > 50 MB | Rejected client-side with toast |
| PDF has no extractable text | API returns 422 with `"NO_TEXT"` code; browser shows specific message |
| Claude API timeout (> 30s) | API returns 504; browser shows retry message |
| Supabase upload fails | Toast shown; generation blocked until upload succeeds |
| Save fails | Toast shown; editor content preserved |

---

## Component Breakdown

### `FileUploader` (`components/files/FileUploader.tsx`)
- Uses `react-dropzone` for drag-and-drop
- Accepts `.pdf` and `.pptx` only
- Shows upload progress bar
- On success: calls `onUploadComplete(storagePath)` callback

### `StyleSelector` (`components/notes/StyleSelector.tsx`)
- Renders four style cards with icons and descriptions
- Manages selected style state
- Conditionally renders custom instructions textarea
- Exports: `{ selectedStyle, customInstructions }`

### `NoteEditor` (`components/notes/NoteEditor.tsx`)
- Wraps `@uiw/react-md-editor` in split-pane mode
- Receives `initialContent` prop
- Manages local edit state
- Calls `onSave(content)` and `onRegenerate(newStyle)` callbacks
- Shows unsaved-changes prompt on navigation
