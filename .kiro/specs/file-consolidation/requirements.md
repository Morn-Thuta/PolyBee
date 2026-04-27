# File Consolidation Requirements

## Overview
Students select two or more PDF or PPTX files and merge them into a single downloadable file. This is particularly useful for open-book exams — having all slides in one document means students only need to Ctrl+F once rather than switching between files.

---

## User Stories

### US-013: Select Files to Merge
**As a** polytechnic student  
**I want to** select multiple files to merge into one  
**So that** I can combine lecture slides for a topic or exam

#### Acceptance Criteria
- WHEN a student navigates to the Merge page THE SYSTEM SHALL display two input options: "From my uploads" (files already in any module) and "Upload new files"
- WHEN a student selects "From my uploads" THE SYSTEM SHALL show a browsable list of all their uploaded PDF and PPTX files grouped by module
- WHEN a student uploads new files THE SYSTEM SHALL accept PDF and PPTX files only, up to 50 MB each
- WHEN a student selects files THE SYSTEM SHALL display them in a staging panel showing filename, source module, and page/slide count
- WHEN fewer than 2 files are selected THE SYSTEM SHALL disable the "Merge" button and display "Select at least 2 files to merge"

---

### US-014: Reorder Files Before Merging
**As a** polytechnic student  
**I want to** drag and reorder the files in the merge queue  
**So that** the final document follows the order I want

#### Acceptance Criteria
- WHEN files are staged for merging THE SYSTEM SHALL display them as a drag-and-drop sortable list
- WHEN a student drags a file to a new position THE SYSTEM SHALL immediately reflect the new order
- WHEN a student removes a file from the queue THE SYSTEM SHALL update the list without needing a page reload
- WHEN a student reorders files THE SYSTEM SHALL use that order for the final merged output

---

### US-015: Choose Output Format
**As a** polytechnic student  
**I want to** choose whether the merged output is a PDF or PPTX  
**So that** I can use it in the format most useful for my exam

#### Acceptance Criteria
- WHEN files are staged THE SYSTEM SHALL display a format selector with options: PDF and PPTX
- WHEN a student selects PPTX THE SYSTEM SHALL only allow PPTX-format source files; mixed PDF+PPTX input targeting PPTX output should display a warning: "PPTX output requires all source files to be PPTX. Switch to PDF output to mix formats."
- WHEN a student selects PDF THE SYSTEM SHALL accept both PDF and PPTX source files (PPTX slides are converted to PDF pages)
- WHEN no format is selected THE SYSTEM SHALL default to PDF

---

### US-016: Merge and Download the File
**As a** polytechnic student  
**I want to** merge the selected files and download the result  
**So that** I have one consolidated file ready for my exam

#### Acceptance Criteria
- WHEN a student clicks "Merge" THE SYSTEM SHALL display a progress indicator: "Merging [n] files…"
- WHEN merging PDF files THE SYSTEM SHALL combine them client-side using `pdf-lib` without sending content to the server
- WHEN merging PPTX files THE SYSTEM SHALL send the files to the API route and use `pptxgenjs` to produce the merged output
- WHEN merging completes THE SYSTEM SHALL display a "Download" button linking to the merged file
- WHEN a student clicks Download THE SYSTEM SHALL trigger a file download named `merged_[timestamp].pdf` or `merged_[timestamp].pptx`
- WHEN merging fails THE SYSTEM SHALL display "Merge failed. Please try again." and preserve the file selection

---

### US-017: Save Merged File to a Module (Optional)
**As a** polytechnic student  
**I want to** optionally save the merged file to a module  
**So that** I can access it later from my module workspace

#### Acceptance Criteria
- WHEN a merged file is ready THE SYSTEM SHALL offer an optional "Save to Module" button alongside Download
- WHEN a student clicks "Save to Module" THE SYSTEM SHALL display a module picker
- WHEN a module is selected and confirmed THE SYSTEM SHALL store the merged file in Supabase Storage and add it to the selected module's Files tab
- WHEN saving succeeds THE SYSTEM SHALL display "Saved to [Module Name]"
