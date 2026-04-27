# Note Generation — Implementation Tasks

## Overview
Implement the end-to-end flow: file upload → text extraction → Claude note generation → in-browser editing → save to module. Prerequisites: Supabase project created, environment variables set, Next.js app scaffolded.

---

## Task 1: Database Schema — Notes and Modules Tables
**Relates to:** US-001, US-005

- [ ] Create migration `supabase/migrations/001_modules_notes.sql` with `modules` and `notes` table definitions
- [ ] Enable RLS and add user-scoping policies on both tables
- [ ] Run migration locally with Supabase CLI (`supabase db push`)
- [ ] Generate TypeScript types: `supabase gen types typescript --local > supabase/types.ts`
- [ ] Verify types include `Module` and `StudyNote` interfaces

---

## Task 2: Supabase Storage Bucket Setup
**Relates to:** US-001

- [ ] Create a private storage bucket named `uploads` in Supabase dashboard
- [ ] Add storage policy: authenticated users can upload to `{userId}/*` and read their own files
- [ ] Create `lib/supabase/client.ts` (browser Supabase client using `createBrowserClient`)
- [ ] Create `lib/supabase/server.ts` (server Supabase client using `createServerClient` with cookies)

---

## Task 3: File Upload Component
**Relates to:** US-001

- [ ] Create `components/files/FileUploader.tsx` using `react-dropzone`
- [ ] Accept `.pdf` and `.pptx` MIME types only; reject others with inline error
- [ ] Enforce 50 MB size limit client-side; show "File too large" error if exceeded
- [ ] Show upload progress bar using Supabase Storage upload progress callback
- [ ] On success: call `onUploadComplete(storagePath: string)` prop
- [ ] On failure: display "Upload failed" toast and reset to empty state

---

## Task 4: Text Extraction Utilities
**Relates to:** US-003

- [ ] Create `lib/files/pdf-utils.ts` — use `pdfjs-dist` to extract all text from a PDF Blob, return as `string`
- [ ] Create `app/api/extract-pptx-text/route.ts` — download PPTX from Supabase Storage, use `officeparser` to extract text, return `{ text: string }`
- [ ] Handle image-only PDFs: if extracted text is empty, return `null` (signals `"NO_TEXT"` to caller)
- [ ] Unit test `pdf-utils.ts` with a sample text-based PDF and an image-only PDF

---

## Task 5: Note Style Configuration
**Relates to:** US-002, US-006

- [ ] Create `lib/ai/note-styles.ts` with `NOTE_STYLES` array (4 style definitions: label, description, icon, preview, systemPrompt)
- [ ] Create `lib/ai/prompts.ts` with `buildNoteGenerationPrompt(style, customInstructions?)` function
- [ ] Configure prompt caching: system prompt block uses `cache_control: { type: "ephemeral" }` in the Anthropic SDK call

---

## Task 6: Claude Note Generation API Route
**Relates to:** US-003

- [ ] Install `@anthropic-ai/sdk`
- [ ] Create `lib/ai/claude.ts` — singleton Anthropic client (`new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`)
- [ ] Create `app/api/generate-notes/route.ts`:
  - Validate auth (Supabase server client, return 401 if unauthenticated)
  - Validate body with Zod: `{ rawText: string, style: NoteStyle, customInstructions?: string }`
  - Return 422 if `rawText` is empty with `{ error: 'NO_TEXT' }`
  - Call `claude.messages.create()` with `model: 'claude-sonnet-4-6'`, `max_tokens: 4096`
  - Return `{ notes: string }`
- [ ] Add 30-second Vercel function timeout in `next.config.ts`

---

## Task 7: Style Selector Component
**Relates to:** US-002, US-006

- [ ] Create `components/notes/StyleSelector.tsx` with four style cards
- [ ] Highlight selected card with ring/border styling
- [ ] Show one-line description below each card
- [ ] Reveal custom instructions textarea when "Custom" is selected
- [ ] Accept `defaultStyle` prop and pre-select it on mount

---

## Task 8: Generate Notes Page
**Relates to:** US-001, US-002, US-003

- [ ] Create `app/(dashboard)/generate/page.tsx`
- [ ] Compose: `FileUploader` → `StyleSelector` → "Generate Notes" button
- [ ] Wire upload → text extraction → API call → loading state → display `NoteEditor`
- [ ] Disable Generate button if no file uploaded or extraction in progress
- [ ] Show "Generating your notes…" spinner during API call
- [ ] Handle `NO_TEXT` and generic API errors with specific user-facing messages

---

## Task 9: Note Editor Component
**Relates to:** US-004

- [ ] Create `components/notes/NoteEditor.tsx` wrapping `@uiw/react-md-editor` in split-pane mode
- [ ] Accept `initialContent: string` prop
- [ ] Manage dirty state (edited but not saved)
- [ ] Prompt "You have unsaved changes" on `beforeunload` when dirty
- [ ] Expose `onSave(content: string)` and `onRegenerate(style: NoteStyle)` callback props
- [ ] Add "Regenerate" button to toolbar that opens `RegenerateModal`

---

## Task 10: Save Notes Flow
**Relates to:** US-005

- [ ] Create `app/api/modules/[moduleId]/notes/route.ts` — `POST` handler, inserts into `notes` table
- [ ] Create `SaveNoteModal.tsx`:
  - Module picker (dropdown of user's modules)
  - Note title input
  - "Create new module" shortcut link
- [ ] On save success: toast "Notes saved to [Module Name]" + `router.push` to module page
- [ ] On save failure: toast error without losing note content

---

## Task 11: Regenerate Notes
**Relates to:** US-006

- [ ] Create `components/notes/RegenerateModal.tsx` with `StyleSelector` inside a shadcn Dialog
- [ ] On confirm: re-call `POST /api/generate-notes` with same `storagePath` and new style
- [ ] Disable editor and show loading overlay during regeneration
- [ ] Replace editor content with new output on success

---

## Testing Checklist
- [ ] Upload a text-based PDF and verify notes are generated
- [ ] Upload an image-only PDF and verify the "no text" error message
- [ ] Upload a PPTX and verify notes are generated
- [ ] Switch between all 4 note styles and verify different outputs
- [ ] Save notes to a module and verify they appear on the module page
- [ ] Test regenerate flow and verify content is replaced without overwriting saved note
- [ ] Test 50 MB size limit enforcement
- [ ] Test unauthenticated request to `/api/generate-notes` returns 401
