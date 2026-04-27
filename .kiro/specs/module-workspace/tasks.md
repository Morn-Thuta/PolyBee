# Module Workspace — Implementation Tasks

## Overview
Implement the Notion-like module workspace: sidebar navigation, module CRUD, tabbed workspace page (Notes | Files | Calendar), file uploads, in-module search, and delete flows. Depends on the `modules` and `notes` tables from the Note Generation feature.

---

## Task 1: Dashboard Layout with Sidebar
**Relates to:** US-007, US-008

- [x] Create `app/(dashboard)/layout.tsx` as a server component that fetches the user's modules list
- [x] Create `components/layout/Sidebar.tsx` (client component for active link state using `usePathname`)
- [x] Add navigation links: Dashboard, Generate, Merge Files, Calendar
- [x] Add "My Modules" section listing modules with colour dot, code, and name
- [x] Add "+ New Module" button at the bottom of the modules list
- [x] Make sidebar collapsible on mobile (hamburger menu)

---

## Task 2: Module List Page
**Relates to:** US-007

- [x] Create `app/(dashboard)/modules/page.tsx` — server component fetching all user modules
- [x] Render modules as cards showing: colour, code, name, note count, last updated
- [x] Show empty state when no modules exist: "No modules yet. Create your first one."
- [x] "+ New Module" button navigates to the create page or opens a modal

---

## Task 3: Create Module Flow
**Relates to:** US-007

- [x] Create `app/api/modules/route.ts` — `POST` handler: validate body (code required, name required), check duplicate code, insert into `modules` table, return new module
- [x] Create `components/modules/ModuleCreateForm.tsx`: Module Code input, Module Name input, Colour swatchboard (8 preset hex colours)
- [x] Show inline validation for missing fields
- [x] Show "Module code already exists" error from API 409
- [x] On success: `router.refresh()` + navigate to new module page

---

## Task 4: Module Workspace Page
**Relates to:** US-008

- [x] Create `app/(dashboard)/modules/[moduleId]/page.tsx` — server component fetching module, notes, and files in parallel
- [x] Call `notFound()` if module does not exist or belongs to a different user
- [x] Render page header: module colour dot + code + name
- [x] Implement tabs using `shadcn/ui Tabs` component: Notes | Files | Calendar
- [x] Pass `notes` and `files` as props to respective tab content components

---

## Task 5: Notes Tab — Note List
**Relates to:** US-008, US-011

- [x] Create `components/notes/NoteCard.tsx` — shows: title, style badge (colour-coded), relative date
- [x] Render notes sorted by `updated_at DESC`
- [x] Show empty state: "No notes yet. Generate your first note."
- [x] Link each card to `modules/[moduleId]/notes/[noteId]`
- [x] Add context menu (right-click or kebab): Open, Delete

---

## Task 6: Note Detail Page
**Relates to:** US-008

- [x] Create `app/(dashboard)/modules/[moduleId]/notes/[noteId]/page.tsx` — server component fetching the note
- [x] Render note title in page header
- [x] Render `NoteEditor` (from note-generation feature) with `initialContent={note.content}`
- [x] Wire save to `PATCH /api/modules/:moduleId/notes/:noteId`
- [x] Show breadcrumb: Modules → [Module Name] → [Note Title]

---

## Task 7: Files Tab — File Upload and List
**Relates to:** US-009

- [x] Create `supabase/migrations/002_module_files.sql` — `module_files` table with RLS
- [x] Reuse `FileUploader` component; on upload success insert row into `module_files`
- [x] Create `app/api/modules/[moduleId]/files/route.ts` — `POST` to insert file metadata
- [x] Create `components/files/FileList.tsx`:
  - Shows: file icon (by MIME), filename, size (human-readable), relative date
  - PDF files: clicking opens `<iframe>` preview in a shadcn Sheet
  - PPTX/DOCX files: download link using Supabase signed URL
- [x] Context menu per file: Download, Delete
- [x] Show empty state: "No files yet. Upload your first one."

---

## Task 8: Module CRUD — Rename, Colour Change, Delete
**Relates to:** US-012

- [x] Create `app/api/modules/[moduleId]/route.ts` — `PATCH` (rename/colour) and `DELETE` handlers
- [x] `DELETE` handler: delete storage bucket prefix `{userId}/{moduleId}/` then delete DB row (cascade handles child tables)
- [x] Add kebab menu to `ModuleSidebar` module items (shadcn `DropdownMenu`)
- [x] Rename: show inline input pre-filled with current name; save on blur/enter
- [x] Change Colour: show colour swatchboard popover; update on click
- [x] Delete: show `ConfirmDialog` with warning text; on confirm call `DELETE` API; redirect to modules list

---

## Task 9: Delete Notes and Files
**Relates to:** US-011

- [x] Create `DELETE /api/modules/[moduleId]/notes/[noteId]` — delete note record
- [x] Create `DELETE /api/modules/[moduleId]/files/[fileId]` — delete DB record + Supabase Storage object
- [x] Both endpoints return 204 on success, 404 if not found or wrong owner
- [x] UI: context menu Delete → `ConfirmDialog` → API call → optimistic removal from list + "Deleted" toast

---

## Task 10: In-Module Search
**Relates to:** US-010

- [x] Add search input to the module workspace page header
- [x] Implement client-side filtering in the Notes and Files tab components (no extra API calls)
- [x] Filter notes by `title` and `content` (case-insensitive)
- [x] Filter files by `filename` (case-insensitive)
- [x] Show "No results for '[query]'" empty state when filter returns nothing
- [x] Clear button resets search and restores full lists

---

## Testing Checklist
- [ ] Create a module with duplicate code — verify error shown
- [ ] Create a module, navigate to its page, verify tabs render
- [ ] Upload a file to the Files tab, verify it appears in the list
- [ ] Delete a file and verify it is removed from storage and the list
- [ ] Rename a module and verify the new name appears in the sidebar
- [ ] Delete a module and verify all its notes and files are also removed
- [ ] Search for a note by title and by content keyword
- [ ] Navigate to a non-existent module URL and verify 404 page
- [ ] Verify all API routes return 401 for unauthenticated requests
