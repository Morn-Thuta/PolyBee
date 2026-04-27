# Note Customisation — Implementation Tasks

## Overview
Implement the note style system: static style definitions, style selector UI with live preview, default preference storage, and retroactive regeneration. Most logic builds on the Note Generation feature — this feature primarily adds the preference layer and the regeneration modal.

---

## Task 1: Note Style Configuration File
**Relates to:** US-024, US-025

- [ ] Create `lib/ai/note-styles.ts` with the `NOTE_STYLES` array (4 entries: notion-friendly, deep-dive, quick-summary, custom)
- [ ] Each entry must include: `id`, `label`, `description`, `icon` (lucide icon name), `preview` (sample Markdown), `systemPrompt`
- [ ] Export `NoteStyle` type and `getNoteStyle(id: NoteStyle)` helper that returns the matching `StyleDefinition`
- [ ] Verify that the `systemPrompt` for each style produces noticeably different Claude outputs (manual smoke test)

---

## Task 2: Database Schema — User Preferences
**Relates to:** US-026

- [ ] Create `supabase/migrations/004_user_preferences.sql` with `user_preferences` table (user_id UNIQUE, default_note_style text)
- [ ] Enable RLS with `auth.uid() = user_id` policy
- [ ] Re-generate Supabase TypeScript types to include `UserPreference`

---

## Task 3: Style Selector Component
**Relates to:** US-024, US-025

- [ ] Create `components/notes/StyleSelector.tsx` — accepts `value`, `onChange`, `showPreview`, `defaultStyle` props
- [ ] Render four style cards in a 2×2 grid (desktop), vertical stack (mobile)
- [ ] Selected card: highlighted with a ring border and background tint using the module's accent colour
- [ ] Each card shows: icon (lucide), label, one-line description
- [ ] When "Custom" is selected: animate-in a `<textarea>` for custom format instructions below the cards
- [ ] Validate: if Custom selected and textarea is empty, call `onChange` with `undefined` customInstructions (parent blocks generation)

---

## Task 4: Style Preview Panel
**Relates to:** US-025

- [ ] Create `components/notes/StylePreviewPanel.tsx`
- [ ] Renders `preview` field from `NOTE_STYLES` using `@uiw/react-md-editor` preview-only mode
- [ ] Shows "Preview not available for Custom style. Define your own format." when Custom is selected
- [ ] On desktop: appears as a right panel alongside the style cards
- [ ] On mobile: appears below the cards after a style is tapped
- [ ] Panel updates instantly on style hover (desktop) or selection (mobile)

---

## Task 5: Integrate Style Selector on Generate Page
**Relates to:** US-024

- [ ] Add `StyleSelector` to `app/(dashboard)/generate/page.tsx` between the file uploader and the Generate button
- [ ] Pass user's saved default style as `defaultStyle` prop (fetched server-side from `user_preferences`)
- [ ] Pass selected style and custom instructions to `POST /api/generate-notes` request body
- [ ] Add "Set as default" toggle below the selector
- [ ] If toggle is checked on Generate: call `PATCH /api/preferences` alongside the generation request

---

## Task 6: User Preferences API Routes
**Relates to:** US-026

- [ ] Create `app/api/preferences/route.ts`:
  - `GET`: fetch user's `user_preferences` row; return defaults if row doesn't exist
  - `PATCH`: body `{ default_note_style: NoteStyle }` (Zod validated); upsert into `user_preferences`
- [ ] Both endpoints: 401 if unauthenticated

---

## Task 7: Settings Page — Default Style Preference
**Relates to:** US-026

- [ ] Create `app/(dashboard)/settings/page.tsx` — server component fetching user preferences
- [ ] Render a "Default Note Style" row with a `StyleSelector` (compact, no preview panel)
- [ ] "Save" button calls `PATCH /api/preferences`
- [ ] Show success toast "Default style updated" on save

---

## Task 8: Regenerate Modal
**Relates to:** US-027

- [ ] Create `components/notes/RegenerateModal.tsx` using shadcn `Dialog`
- [ ] Contains `StyleSelector` (no preview panel for space reasons)
- [ ] "Regenerate" button:
  - Calls `POST /api/generate-notes` with the note's `source_file_path` and new style
  - Shows loading state in modal while generating
- [ ] On success: show two action buttons — "Save as new version" and "Overwrite"
  - "Save as new version": `POST /api/modules/:moduleId/notes` with new title `[Original Title] (v2)` or similar
  - "Overwrite": `PATCH /api/modules/:moduleId/notes/:noteId` with new content
- [ ] If `source_file_path` is null or file no longer in storage: show error "Source file not available. Re-upload the slide to regenerate." and disable the Regenerate button

---

## Task 9: Add Regenerate Button to Note Editor
**Relates to:** US-027

- [ ] Add "Regenerate" button to the `NoteEditor` toolbar (appears when viewing a saved note)
- [ ] Button opens `RegenerateModal` passing `{ noteId, moduleId, sourcePath: note.source_file_path, currentStyle: note.style }`
- [ ] Disable button if `source_file_path` is null; show tooltip "No source file stored"

---

## Testing Checklist
- [ ] Select each of the 4 styles and verify the preview updates correctly
- [ ] Select Custom without typing instructions — verify Generate button stays disabled
- [ ] Generate notes with each style — verify Claude outputs are structurally different
- [ ] Enable "Set as default" and generate — verify returning to the page pre-selects that style
- [ ] Change default in Settings — verify new default is reflected on the Generate page
- [ ] Open a saved note and click Regenerate with a different style — verify new content shown
- [ ] Choose "Save as new version" after regen — verify two separate notes exist in the module
- [ ] Choose "Overwrite" after regen — verify note content is updated, count unchanged
- [ ] Open a note whose source file was deleted — verify Regenerate button is disabled
- [ ] Verify `PATCH /api/preferences` returns 401 for unauthenticated requests
