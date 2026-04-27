# Module Workspace Requirements

## Overview
Each academic module gets a dedicated workspace page where students store generated notes, uploaded files, and linked calendar events. The workspace follows a Notion-inspired mental model — students create one workspace per module (e.g. "INF1005 — Programming Fundamentals") and everything for that module lives there.

---

## User Stories

### US-007: Create a Module
**As a** polytechnic student  
**I want to** create a new module workspace  
**So that** I have a dedicated place to store materials for each subject

#### Acceptance Criteria
- WHEN a student clicks "New Module" THE SYSTEM SHALL display a form with fields: Module Code (required), Module Name (required), and Colour (optional, for calendar colour-coding)
- WHEN a student submits a valid form THE SYSTEM SHALL create the module in the database and navigate to the new module page
- WHEN a student submits without a Module Code or Name THE SYSTEM SHALL display inline validation errors
- WHEN a module with the same Module Code already exists for that user THE SYSTEM SHALL display "You already have a module with this code."
- WHEN creation succeeds THE SYSTEM SHALL add the module to the sidebar immediately

---

### US-008: View the Module Workspace Page
**As a** polytechnic student  
**I want to** open a module and see all its notes and files  
**So that** I have one place to access everything for that subject

#### Acceptance Criteria
- WHEN a student opens a module THE SYSTEM SHALL display the module name and code in the page header
- WHEN a student opens a module THE SYSTEM SHALL show tabs: Notes, Files, and Calendar
- WHEN the Notes tab is active THE SYSTEM SHALL list all saved notes with title, creation date, and note style used
- WHEN the Files tab is active THE SYSTEM SHALL list all uploaded files with name, size, and upload date
- WHEN either list is empty THE SYSTEM SHALL show an empty state with a prompt to add content

---

### US-009: Upload Raw Files to a Module
**As a** polytechnic student  
**I want to** upload files directly to a module  
**So that** I can store original slides alongside my generated notes

#### Acceptance Criteria
- WHEN a student is on the Files tab THE SYSTEM SHALL display a file upload area
- WHEN a student uploads a file THE SYSTEM SHALL accept PDF, PPTX, DOCX, and image files (JPG, PNG)
- WHEN a student uploads a file THE SYSTEM SHALL store it in Supabase Storage under `{userId}/{moduleId}/{filename}`
- WHEN upload succeeds THE SYSTEM SHALL add the file to the list immediately with a success indicator
- WHEN upload fails THE SYSTEM SHALL display "Upload failed. Please try again."
- WHEN a student clicks a file in the list THE SYSTEM SHALL open a preview (PDF inline, download link for PPTX/DOCX)

---

### US-010: Search Within a Module
**As a** polytechnic student  
**I want to** search across notes and files within a module  
**So that** I can quickly find a specific topic or document

#### Acceptance Criteria
- WHEN a student types in the module search bar THE SYSTEM SHALL filter the notes list by title and content in real time
- WHEN a student types in the module search bar THE SYSTEM SHALL filter the files list by filename in real time
- WHEN no results match THE SYSTEM SHALL display "No results for '[query]'"
- WHEN a student clears the search bar THE SYSTEM SHALL restore the full lists

---

### US-011: Delete Notes and Files
**As a** polytechnic student  
**I want to** delete notes and files I no longer need  
**So that** my workspace stays tidy

#### Acceptance Criteria
- WHEN a student right-clicks a note or file THE SYSTEM SHALL show a context menu with a "Delete" option
- WHEN a student clicks Delete THE SYSTEM SHALL display a confirmation dialog: "Delete [item name]? This cannot be undone."
- WHEN a student confirms deletion THE SYSTEM SHALL remove the record from the database and the file from storage
- WHEN deletion succeeds THE SYSTEM SHALL remove the item from the list immediately with a "Deleted" toast

---

### US-012: Rename and Manage Modules
**As a** polytechnic student  
**I want to** rename or delete a module  
**So that** I can keep my workspace organised as the semester evolves

#### Acceptance Criteria
- WHEN a student clicks the kebab menu on a module in the sidebar THE SYSTEM SHALL show options: Rename, Change Colour, Delete
- WHEN a student selects Rename THE SYSTEM SHALL display an inline input pre-filled with the current name
- WHEN a student confirms the rename THE SYSTEM SHALL update the module name in the sidebar and on the module page
- WHEN a student selects Delete THE SYSTEM SHALL warn: "Deleting this module will also delete all its notes and files. This cannot be undone."
- WHEN a student confirms module deletion THE SYSTEM SHALL delete the module and all associated notes and files from the database and storage
