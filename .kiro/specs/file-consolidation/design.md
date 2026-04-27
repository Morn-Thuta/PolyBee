# File Consolidation Design

## Overview
The merger page lets students pick files from their uploads or upload fresh ones, reorder them via drag-and-drop, choose output format (PDF or PPTX), and download the merged result. PDF merging runs entirely in the browser using `pdf-lib`. PPTX merging is handled server-side via a Next.js API route using `pptxgenjs`.

---

## Architecture

```
[Browser — Merge Page]
  FileSelector
  │  "From uploads" → fetches module_files from Supabase
  │  "Upload new"   → FileUploader → Supabase Storage
  │
  StagingPanel (drag-and-drop sortable list)
  │  files: [{ path, name, type, order }]
  │
  FormatSelector  (PDF | PPTX)
  │
  Merge button
  │
  ├── if PDF output:
  │     client-side: pdf-merge.ts (pdf-lib)
  │     → Blob URL → download anchor
  │
  └── if PPTX output:
        POST /api/merge-pptx
        Body: { storagePaths: string[] }
        Server downloads files from storage,
        combines with pptxgenjs,
        uploads result → Supabase Storage,
        returns { downloadUrl: signedUrl, storagePath }
        → download anchor
```

---

## Data Flow: PDF Merge (client-side)

```typescript
// lib/files/pdf-merge.ts
import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(fileBlobs: Blob[]): Promise<Blob> {
  const merged = await PDFDocument.create()
  for (const blob of fileBlobs) {
    const bytes = await blob.arrayBuffer()
    const doc = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach(p => merged.addPage(p))
  }
  const bytes = await merged.save()
  return new Blob([bytes], { type: 'application/pdf' })
}
```

For PPTX source files targeted to PDF output, the PPTX is first converted to PDF via the `/api/merge-pptx` route (which handles conversion) before client-side merge — or alternatively the entire job is sent to the server.

---

## API Route: `POST /api/merge-pptx`

Handles server-side PPTX → PPTX merge (and optionally PPTX → PDF via LibreOffice in a future version).

**Request body:**
```typescript
{
  storagePaths: string[],   // ordered list of Supabase Storage paths
  outputFormat: 'pptx'
}
```

**Server logic:**
1. Auth check
2. Download each file from Supabase Storage as Buffer
3. Use `officeparser` to extract slide XML data from each PPTX
4. Use `pptxgenjs` to construct new PPTX combining all slides
5. Upload result to `{userId}/merged/merged_{timestamp}.pptx`
6. Return a signed download URL (expires in 1 hour)

```typescript
// Simplified outline — app/api/merge-pptx/route.ts
const pptx = new PptxGenJS()
for (const buffer of fileBuffers) {
  const slides = await extractSlides(buffer)  // custom util
  slides.forEach(slide => addSlide(pptx, slide))
}
const outputBuffer = await pptx.stream()
```

**Note:** `pptxgenjs` reconstructs slides programmatically. Complex transitions, embedded videos, and macros will not be preserved — this is documented in the UI as a known limitation.

---

## Data Models

No new database tables required. The merger uses:
- `module_files` for the "From uploads" file picker (existing table)
- Supabase Storage for temporary merged file storage

Merged files are **not** automatically persisted — they are stored temporarily in `{userId}/merged/` with a 1-hour signed URL. Students can optionally save them to a module (which moves the storage object to `{userId}/{moduleId}/`).

---

## Component Breakdown

### `MergePanel` (`components/files/MergePanel.tsx`)
Top-level client component for the merge page. Manages:
- `stagedFiles: StagedFile[]` state
- Format selection state
- Merge progress state

```typescript
interface StagedFile {
  id: string
  filename: string
  storagePath: string
  mimeType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  order: number
}
```

### Drag-and-Drop Sortable List
Uses `@dnd-kit/core` + `@dnd-kit/sortable`:

```typescript
// SortableFileItem.tsx
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.id })
```

### `FileSelector` (within `MergePanel`)
- Tab 1 "From my uploads": fetches all `module_files` grouped by module; multi-select checkboxes
- Tab 2 "Upload new": reuses `FileUploader` component, adds to staged list on success

### Format Warning
When PPTX output is selected and the staged list contains a PDF, renders:
```
⚠️ PPTX output requires all files to be PPTX. Remove PDF files or switch to PDF output.
```
The Merge button is disabled until the conflict is resolved.

---

## Sequence Diagram (PDF Output)

```
Student             Browser (MergePanel)         Supabase Storage
  │                        │                            │
  │ select files           │                            │
  │───────────────────────►│                            │
  │ drag to reorder        │                            │
  │───────────────────────►│                            │
  │ click Merge (PDF)      │                            │
  │───────────────────────►│                            │
  │                        │ fetch file blobs           │
  │                        │───────────────────────────►│
  │                        │◄──── ArrayBuffer × n ──────│
  │                        │                            │
  │                        │ mergePDFs() — client side  │
  │                        │ (pdf-lib, no network call) │
  │                        │                            │
  │                        │ create Blob URL            │
  │◄── "Download" button ──│                            │
  │ click Download         │                            │
  │───────────────────────►│                            │
  │                        │ <a href=blobUrl download>  │
  │◄── file download ──────│                            │
```

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Mixed formats targeting PPTX output | Merge button disabled, inline warning shown |
| Individual file fetch fails during merge | Toast: "Failed to fetch [filename]. Remove it and try again." |
| `pdf-lib` load error (corrupted PDF) | Toast: "[filename] could not be read. Try a different file." |
| API route for PPTX merge times out | Toast: "Merge timed out. Try with fewer files." |
| Merged file > Supabase Storage limit | Unlikely for typical decks; logged and surfaced as generic error |
