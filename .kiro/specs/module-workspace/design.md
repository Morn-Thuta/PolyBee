# Module Workspace Design

## Overview
The module workspace is a Notion-inspired page per academic module. It uses a persistent sidebar for navigation between modules, and a tabbed content area (Notes | Files | Calendar) for the module's content. All data is scoped to the authenticated user via Supabase RLS.

---

## Architecture

```
[Browser — Dashboard Layout]
  Sidebar (ModuleSidebar)
  │  lists all modules, nav links
  │
  └─► Module Page  app/(dashboard)/modules/[moduleId]/page.tsx
        │
        ├── Notes Tab   → queries notes WHERE module_id = :id
        ├── Files Tab   → queries module_files WHERE module_id = :id
        └── Calendar Tab → redirects to calendar filtered by module
```

---

## Data Models

```typescript
interface Module {
  id: string
  user_id: string
  code: string          // "INF1005"
  name: string          // "Programming Fundamentals"
  colour: string        // hex, used in sidebar and calendar
  created_at: string
}

interface StudyNote {
  id: string
  user_id: string
  module_id: string
  title: string
  content: string       // Markdown
  style: NoteStyle
  source_file_path: string
  created_at: string
  updated_at: string
}

interface ModuleFile {
  id: string
  user_id: string
  module_id: string
  filename: string
  storage_path: string  // {userId}/{moduleId}/{filename}
  mime_type: string
  size_bytes: number
  created_at: string
}
```

### Database Migration (SQL)
```sql
CREATE TABLE module_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL,
  module_id    uuid REFERENCES modules(id) ON DELETE CASCADE,
  filename     text NOT NULL,
  storage_path text NOT NULL,
  mime_type    text NOT NULL,
  size_bytes   bigint NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE module_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own module_files" ON module_files USING (auth.uid() = user_id);
```

---

## Page Structure

### `app/(dashboard)/layout.tsx`
Server component. Fetches the user's module list and passes it to `ModuleSidebar`.

```
DashboardLayout
├── ModuleSidebar  (client component — handles active state)
│   ├── Logo
│   ├── Nav links (Dashboard, Calendar, Merge)
│   ├── "My Modules" section
│   │   └── ModuleCard × n  (colour dot + code + name + kebab menu)
│   └── "+ New Module" button
└── <children />  (page content)
```

### `app/(dashboard)/modules/[moduleId]/page.tsx`
Server component. Fetches module metadata, notes, and files in parallel:

```typescript
const [module, notes, files] = await Promise.all([
  supabase.from('modules').select('*').eq('id', moduleId).single(),
  supabase.from('notes').select('*').eq('module_id', moduleId).order('created_at', { ascending: false }),
  supabase.from('module_files').select('*').eq('module_id', moduleId).order('created_at', { ascending: false })
])
```

---

## Component Breakdown

### `ModuleSidebar` (`components/modules/ModuleSidebar.tsx`)
- Client component (needs `usePathname` for active state)
- Renders module list from props (no client-side fetch)
- Kebab menu triggers: Rename (inline edit), Change Colour (colour picker popover), Delete (confirm dialog)
- "+ New Module" opens `ModuleCreateForm` in a sheet/dialog

### `ModuleCreateForm` (`components/modules/ModuleCreateForm.tsx`)
- Fields: Module Code, Module Name, Colour (swatchboard)
- Submits to `POST /api/modules` (Next.js server action or API route)
- On success: router.refresh() + closes form

### `NoteCard` (`components/notes/NoteCard.tsx`)
- Shows: title, style badge, relative date (e.g. "3 days ago")
- On click: navigates to `modules/[moduleId]/notes/[noteId]`
- Context menu: Open, Delete

### `FileList` (`components/files/FileList.tsx`)
- Each row: file icon (by MIME), filename, size, relative date
- PDF files: inline preview via `<iframe>` in a sheet
- PPTX/DOCX: download link
- Context menu: Download, Save to Module (if uploaded via Merge page), Delete

### `FileUploader` (shared — see note-generation design)
Reused here. On upload success: inserts row into `module_files`, refreshes file list.

---

## Search Implementation
Client-side filtering (no DB round-trip) — fast enough for typical module sizes (< 200 items).

```typescript
// In the module page client wrapper
const filteredNotes = notes.filter(n =>
  n.title.toLowerCase().includes(query) ||
  n.content.toLowerCase().includes(query)
)
const filteredFiles = files.filter(f =>
  f.filename.toLowerCase().includes(query)
)
```

Full-text search via Supabase `fts` column can be added post-MVP if needed.

---

## API Routes

### `POST /api/modules`
Creates a new module. Body: `{ code, name, colour }`.

### `PATCH /api/modules/[moduleId]`
Updates `name` or `colour`. Body: `{ name?, colour? }`.

### `DELETE /api/modules/[moduleId]`
Deletes module, cascades to `notes` and `module_files` (DB cascade). Also deletes storage objects under `{userId}/{moduleId}/`.

### `DELETE /api/modules/[moduleId]/notes/[noteId]`
Deletes a single note.

### `DELETE /api/modules/[moduleId]/files/[fileId]`
Deletes DB record and Supabase Storage object.

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Module not found (bad URL) | Next.js `notFound()` → 404 page |
| Duplicate module code | API returns 409; form shows inline error |
| File upload fails mid-stream | Toast error; no DB record inserted (storage rollback) |
| Delete while offline | Optimistic UI reverted; toast "Delete failed" |
