# Note Generation Requirements

## Overview
This feature allows students to upload a PDF or PPTX lecture slide file and receive AI-generated study notes in their chosen format. Notes are structured as Markdown and can be edited before being saved to a module workspace.

---

## User Stories

### US-001: Upload a Slide File
**As a** polytechnic student  
**I want to** upload a PDF or PPTX lecture slide file  
**So that** I can have the app generate study notes from its content

#### Acceptance Criteria
- WHEN a student navigates to the Generate page THE SYSTEM SHALL display a file upload area (drag-and-drop and browse button)
- WHEN a student uploads a file THE SYSTEM SHALL only accept `.pdf` and `.pptx` file types
- WHEN a student uploads a file exceeding 50 MB THE SYSTEM SHALL reject it and display "File too large. Maximum size is 50 MB."
- WHEN a student uploads a valid file THE SYSTEM SHALL display the file name and a size indicator
- WHEN a student uploads a file THE SYSTEM SHALL upload it to Supabase Storage and return a storage path

---

### US-002: Choose a Note Style Before Generating
**As a** polytechnic student  
**I want to** choose a note style before generating my notes  
**So that** the output matches how I prefer to study

#### Acceptance Criteria
- WHEN a student is on the Generate page THE SYSTEM SHALL display the four available styles: Notion-Friendly, Deep Dive, Quick Summary, and Custom
- WHEN a student selects a style THE SYSTEM SHALL highlight the selected style and show a short description of what it produces
- WHEN a student selects Custom THE SYSTEM SHALL reveal a text area where they can type their own format instructions
- WHEN a student has a saved default style THE SYSTEM SHALL pre-select that style automatically
- WHEN a student clicks Generate without selecting a style THE SYSTEM SHALL default to Quick Summary

---

### US-003: Generate AI Study Notes
**As a** polytechnic student  
**I want to** click a button and receive structured study notes from my slides  
**So that** I don't have to manually re-read and summarise every slide

#### Acceptance Criteria
- WHEN a student clicks "Generate Notes" THE SYSTEM SHALL extract text content from the uploaded file
- WHEN text is extracted THE SYSTEM SHALL send it to the Claude API with the selected note style prompt
- WHEN generation is in progress THE SYSTEM SHALL display a loading indicator with the message "Generating your notes…"
- WHEN generation completes THE SYSTEM SHALL display the notes in a Markdown editor within 15 seconds for a 20-slide deck
- WHEN the Claude API returns an error THE SYSTEM SHALL display "Note generation failed. Please try again." and log the error
- WHEN the source file has no extractable text (e.g. image-only PDF) THE SYSTEM SHALL display "Could not extract text from this file. Try a text-based PDF or PPTX."

---

### US-004: Edit Generated Notes
**As a** polytechnic student  
**I want to** edit the AI-generated notes in the browser  
**So that** I can correct mistakes or add my own annotations before saving

#### Acceptance Criteria
- WHEN notes are displayed THE SYSTEM SHALL render them in a split-pane Markdown editor (source + preview)
- WHEN a student edits the Markdown source THE SYSTEM SHALL update the preview in real time
- WHEN a student closes the browser tab without saving THE SYSTEM SHALL prompt "You have unsaved changes. Leave anyway?"
- WHEN notes are edited THE SYSTEM SHALL not auto-save until the student explicitly clicks "Save"

---

### US-005: Save Notes to a Module
**As a** polytechnic student  
**I want to** save my generated notes to a specific module workspace  
**So that** I can find them later when studying that module

#### Acceptance Criteria
- WHEN a student clicks "Save" THE SYSTEM SHALL display a modal asking them to select a destination module and enter a note title
- WHEN a student selects a module and confirms THE SYSTEM SHALL save the note to the `notes` table linked to that module
- WHEN saving succeeds THE SYSTEM SHALL display a toast "Notes saved to [Module Name]" and redirect to the module workspace
- WHEN the student has no modules yet THE SYSTEM SHALL offer a "Create new module" shortcut inside the save modal
- WHEN saving fails THE SYSTEM SHALL display "Save failed. Please try again." without discarding the note content

---

### US-006: Regenerate Notes With a Different Style
**As a** polytechnic student  
**I want to** regenerate my notes using a different style  
**So that** I can explore different formats without re-uploading the file

#### Acceptance Criteria
- WHEN notes have been generated THE SYSTEM SHALL display a "Regenerate" button with a style dropdown
- WHEN a student selects a new style and clicks Regenerate THE SYSTEM SHALL re-call the Claude API with the same file content and new style prompt
- WHEN regeneration completes THE SYSTEM SHALL replace the displayed notes with the new output
- WHEN regeneration is in progress THE SYSTEM SHALL disable the editor and show a loading state
- WHEN a student regenerates THE SYSTEM SHALL not overwrite any already-saved version of the notes
