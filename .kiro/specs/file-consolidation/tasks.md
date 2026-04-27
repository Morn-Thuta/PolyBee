# File Consolidation — Implementation Tasks

## Overview
Implement the slide merger feature: file selection from uploads or fresh upload, drag-and-drop reordering, format selection (PDF or PPTX), client-side PDF merge, server-side PPTX merge, and download. Depends on `module_files` table from the Module Workspace feature.

---

## Task 1: Install Dependencies
**Relates to:** US-016

- [ ] Install `pdf-lib` for client-side PDF merging
- [ ] Install `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop reordering
- [ ] Install `pptxgenjs` for server-side PPTX generation
- [ ] Install `officeparser` for server-side PPTX text/slide extraction
- [ ] Verify all packages resolve TypeScript types correctly

---

## Task 2: PDF Merge Utility
**Relates to:** US-016

- [ ] Create `lib/files/pdf-merge.ts` with `mergePDFs(fileBlobs: Blob[]): Promise<Blob>` using `pdf-lib`
- [ ] Function iterates blobs in order, copies all pages into a new `PDFDocument`, returns as Blob
- [ ] Handle corrupted PDF input: wrap `PDFDocument.load()` in try/catch, throw a descriptive error with the filename
- [ ] Write unit tests with 2–3 sample PDFs; verify page count of output equals sum of inputs

---

## Task 3: PPTX Merge API Route
**Relates to:** US-015, US-016

- [ ] Create `app/api/merge-pptx/route.ts`
- [ ] `POST` body: `{ storagePaths: string[], outputFormat: 'pptx' }` (validated with Zod)
- [ ] Auth check: return 401 if unauthenticated
- [ ] Download each PPTX from Supabase Storage using the service role key
- [ ] Build merged PPTX using `pptxgenjs` (iterate slides from each file)
- [ ] Upload result to `{userId}/merged/merged_{Date.now()}.pptx` in Supabase Storage
- [ ] Generate a 1-hour signed download URL
- [ ] Return `{ downloadUrl: string, storagePath: string }`
- [ ] Set Vercel function max duration to 60 seconds in `next.config.ts`

---

## Task 4: File Selector — From Uploads
**Relates to:** US-013

- [ ] Create `components/files/FileSelector.tsx` with two tabs: "From my uploads" and "Upload new"
- [ ] "From my uploads" tab: fetch all `module_files` (PDF + PPTX only) grouped by module using Supabase client
- [ ] Render files as a list with checkbox selection, showing: module name, filename, MIME icon, size
- [ ] On checkbox change: add or remove file from parent's staged files state

---

## Task 5: File Selector — Upload New
**Relates to:** US-013

- [ ] "Upload new" tab: reuse `FileUploader` component (PDF + PPTX only, 50 MB limit)
- [ ] On upload success: store file in Supabase Storage under `{userId}/temp/`; add to staged files with returned `storagePath`
- [ ] Temp uploads are not inserted into `module_files` unless the user saves to a module at the end

---

## Task 6: Staging Panel with Drag-and-Drop
**Relates to:** US-014

- [ ] Create `components/files/StagingPanel.tsx` using `@dnd-kit/sortable`
- [ ] Each item shows: drag handle, MIME icon, filename, source module name, remove button (×)
- [ ] `useSortable` hook manages order; on drag end update `stagedFiles` array order
- [ ] Remove button removes item from staged list immediately
- [ ] Show "Select at least 2 files to merge" message when fewer than 2 files are staged
- [ ] Disable Merge button when < 2 files are staged

---

## Task 7: Format Selector and Conflict Warning
**Relates to:** US-015

- [ ] Create a `FormatSelector` section within the merge page: two radio buttons — PDF and PPTX
- [ ] Default to PDF on page load
- [ ] When PPTX is selected and staged list contains a PDF: show inline warning and disable Merge button
- [ ] When PDF is selected: allow any mix of PDF and PPTX source files (PPTX sent to server for conversion before client merge — or entire job sent to server if PPTX sources are present)

---

## Task 8: Merge Page — Wire Everything Together
**Relates to:** US-013, US-014, US-015, US-016

- [ ] Create `app/(dashboard)/merge/page.tsx` — server component shell
- [ ] Create `components/files/MergePanel.tsx` — top-level client component managing all state: `stagedFiles`, `outputFormat`, `mergeStatus`, `mergedFileUrl`
- [ ] Compose: `FileSelector` → `StagingPanel` → `FormatSelector` → Merge button
- [ ] Merge button click:
  - If PDF output + all-PDF sources: call `mergePDFs()` client-side, create Blob URL
  - If PDF output + any PPTX sources: `POST /api/merge-pptx` (server handles conversion + merge)
  - If PPTX output + all-PPTX sources: `POST /api/merge-pptx`
- [ ] Show "Merging [n] files…" progress indicator during merge
- [ ] On success: show "Download" button + optional "Save to Module" button
- [ ] On failure: show toast with error message; preserve staged list

---

## Task 9: Download and Save to Module
**Relates to:** US-016, US-017

- [ ] For client-side Blob: create `<a href={blobUrl} download="merged_{timestamp}.pdf">` programmatically and click it
- [ ] For server-side result: navigate to the signed URL returned by the API route
- [ ] "Save to Module" button: show module picker modal → call `POST /api/modules/:moduleId/files` with the merged file's `storagePath` (move storage object from `temp/` to `{moduleId}/`)
- [ ] On save success: toast "Saved to [Module Name]"

---

## Testing Checklist
- [ ] Select 2 PDFs → merge → download → verify merged PDF opens and page count is correct
- [ ] Select 3 PDFs with different page sizes → verify all pages present in merged output
- [ ] Select 2 PPTX files → merge to PPTX → download → verify slide count
- [ ] Select a mix of PDF + PPTX → merge to PDF → verify all pages present
- [ ] Select PPTX + PDF with PPTX output selected → verify warning shown and Merge disabled
- [ ] Drag to reorder files → verify output order matches the staging order
- [ ] Upload a corrupted PDF → verify error toast shows filename
- [ ] Test merge with 1 file → verify Merge button remains disabled
- [ ] Save merged file to a module → verify it appears in the module's Files tab
- [ ] Verify `/api/merge-pptx` returns 401 for unauthenticated requests
