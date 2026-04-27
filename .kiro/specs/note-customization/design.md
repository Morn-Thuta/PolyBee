# Note Customisation Design

## Overview
Note style customisation injects a style-specific system prompt into every Claude API call. Styles are defined as a static configuration in `lib/ai/note-styles.ts`. The user's default style preference is stored in a `user_preferences` table in Supabase. The style selector UI is shared between the Generate page and the note-level Regenerate modal.

---

## Architecture

```
[lib/ai/note-styles.ts]  ← static config: style definitions + preview examples
        │
        ▼
[StyleSelector component]
  used on:
  ├── Generate page (initial generation)
  └── Regenerate modal (opened from NoteEditor toolbar)
        │
        ▼
[lib/ai/prompts.ts → buildNoteGenerationPrompt(style)]
        │
        ▼
[POST /api/generate-notes]  ← same route for initial gen and regen
        │
        ▼
[Supabase: notes table]  ← style stored on each note record
[Supabase: user_preferences table]  ← default style per user
```

---

## Style Definitions

```typescript
// lib/ai/note-styles.ts

export type NoteStyle = 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'

export interface StyleDefinition {
  id: NoteStyle
  label: string
  description: string
  icon: string          // lucide-react icon name
  preview: string       // short example Markdown shown in preview panel
  systemPrompt: string  // injected into Claude system prompt
}

export const NOTE_STYLES: StyleDefinition[] = [
  {
    id: 'notion-friendly',
    label: 'Notion-Friendly',
    description: 'Clean headers and bullets — pastes perfectly into Notion',
    icon: 'layout',
    preview: `## Key Concepts\n- **Definition**: A variable stores a value\n- **Types**: int, float, string\n\n> **Important:** Variables are case-sensitive`,
    systemPrompt: `Format notes as clean Markdown for Notion import. Use ## headings, bullet points for facts, **bold** for key terms, and > blockquotes for important definitions.`
  },
  {
    id: 'deep-dive',
    label: 'Deep Dive',
    description: 'Full explanations with examples — great for understanding',
    icon: 'book-open',
    preview: `## Variables\nA variable is a named storage location in memory. When you declare \`int x = 5;\`, the system allocates memory and assigns 5 to it.\n\n**Example:** \`float price = 9.90;\` stores a decimal number.\n\n*Why this matters:* Choosing the right type prevents overflow errors.`,
    systemPrompt: `Produce comprehensive notes. Explain every concept in 2–4 sentences, provide examples, add "Why this matters" notes for complex topics.`
  },
  {
    id: 'quick-summary',
    label: 'Quick Summary',
    description: 'Concise bullets only — skim in minutes before an exam',
    icon: 'zap',
    preview: `## Variables\n- Named memory location\n- Declare type before use\n- Case-sensitive in most languages`,
    systemPrompt: `Produce a concise summary. Maximum 3 bullet points per topic, plain language, each point under 20 words.`
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Define your own format with free-text instructions',
    icon: 'sliders',
    preview: '',  // dynamic — shown as "Preview not available for custom style"
    systemPrompt: ''  // replaced by user's custom instructions at runtime
  }
]
```

---

## Data Models

```typescript
interface UserPreference {
  id: string
  user_id: string
  default_note_style: NoteStyle
  updated_at: string
}
```

### Database Migration (SQL)
```sql
CREATE TABLE user_preferences (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES auth.users UNIQUE NOT NULL,
  default_note_style text NOT NULL DEFAULT 'quick-summary',
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own preferences" ON user_preferences USING (auth.uid() = user_id);
```

Upsert pattern used for writes:
```sql
INSERT INTO user_preferences (user_id, default_note_style)
VALUES ($1, $2)
ON CONFLICT (user_id) DO UPDATE SET default_note_style = EXCLUDED.default_note_style, updated_at = now();
```

---

## Component Breakdown

### `StyleSelector` (`components/notes/StyleSelector.tsx`)
Reusable client component used on both the Generate page and in the Regenerate modal.

**Props:**
```typescript
interface StyleSelectorProps {
  value: NoteStyle
  onChange: (style: NoteStyle, customInstructions?: string) => void
  showPreview?: boolean    // defaults to true
  defaultStyle?: NoteStyle // pre-selected based on user preference
}
```

**Rendering:**
- Four cards arranged in a 2×2 grid (desktop) / vertical stack (mobile)
- Selected card: highlighted border + background tint
- On hover/select: preview panel updates on the right (desktop) or below (mobile)
- Custom style selected: textarea slides in below the cards

### `StylePreviewPanel` (`components/notes/StylePreviewPanel.tsx`)
Renders the `preview` Markdown string from `NOTE_STYLES` using `@uiw/react-md-editor`'s preview mode (read-only). For the Custom style: shows "Define your own format in the text area."

### `RegenerateModal` (`components/notes/RegenerateModal.tsx`)
Modal opened from the `NoteEditor` toolbar "Regenerate" button.
- Contains `StyleSelector` (no preview panel on mobile)
- Confirm button triggers `POST /api/generate-notes` with same `storagePath` and new `style`
- On success: shows "Save as new version / Overwrite" choice
  - "New version": `POST /api/modules/:moduleId/notes` (new record)
  - "Overwrite": `PATCH /api/modules/:moduleId/notes/:noteId`

---

## Settings Page Integration

`app/(dashboard)/settings/page.tsx` renders a preference row:

```
Default Note Style
[Notion-Friendly ▾]   Save
```

- Fetches current preference from `user_preferences` on load
- On save: `PATCH /api/preferences` → upserts `user_preferences` row
- On next visit to Generate page: `StyleSelector` receives `defaultStyle` prop from server

---

## API Routes

### `GET /api/preferences`
Returns the user's `user_preferences` row (or default values if not set).

### `PATCH /api/preferences`
Body: `{ default_note_style: NoteStyle }`. Upserts the preference.

The `/api/generate-notes` route already accepts `style` + `customInstructions` — no changes needed there for this feature.

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Custom style with empty instructions | Client-side validation; form blocked |
| Source file deleted (regen attempted) | API returns 404; modal shows "Source file not available" |
| Preference save fails | Toast "Could not save preference" — does not block generation |
| Style not in `NOTE_STYLES` (bad input) | API validates with Zod enum; returns 400 |
