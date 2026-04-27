# Note Customisation Requirements

## Overview
Before generating study notes, students choose a style that controls how the AI structures its output. Students can preview each style, set a default per module, define custom instructions, and retroactively regenerate an existing note with a new style.

---

## User Stories

### US-024: Choose a Note Style at Generation Time
**As a** polytechnic student  
**I want to** choose how I want my notes formatted before generating them  
**So that** the output fits the way I study

#### Acceptance Criteria
- WHEN a student is on the Generate Notes page THE SYSTEM SHALL display four style options: Notion-Friendly, Deep Dive, Quick Summary, and Custom
- WHEN a student selects a style THE SYSTEM SHALL visually highlight the selection and show a one-line description beneath it
- WHEN a student selects Custom THE SYSTEM SHALL reveal a free-text area labelled "Describe your preferred format"
- WHEN a student submits the Custom style with an empty text area THE SYSTEM SHALL display "Please describe your custom format."
- WHEN a student generates notes THE SYSTEM SHALL pass the selected style as part of the Claude system prompt

---

### US-025: Preview a Style Before Generating
**As a** polytechnic student  
**I want to** see an example of what each style looks like  
**So that** I can choose the right one without guessing

#### Acceptance Criteria
- WHEN a student hovers over or clicks a style option THE SYSTEM SHALL display a preview panel showing a short sample note rendered in that style
- WHEN the preview renders THE SYSTEM SHALL show enough content (≥ 3 content sections) to demonstrate the style's structure
- WHEN a student moves to a different style THE SYSTEM SHALL update the preview to reflect the newly hovered/selected style
- WHEN a student is on mobile THE SYSTEM SHALL show the preview below the style selector after tapping it

---

### US-026: Save a Default Style Preference
**As a** polytechnic student  
**I want to** set a default note style  
**So that** I don't have to re-select it every time I generate notes

#### Acceptance Criteria
- WHEN a student generates notes THE SYSTEM SHALL display a "Set as default" toggle below the style selector
- WHEN a student enables "Set as default" and generates THE SYSTEM SHALL save the selected style to the user's preferences in the database
- WHEN a student with a saved default returns to the Generate page THE SYSTEM SHALL pre-select their default style automatically
- WHEN a student opens the Settings page THE SYSTEM SHALL show a "Default Note Style" preference they can change at any time
- WHEN a student changes their default in Settings THE SYSTEM SHALL apply the new default on the next visit to the Generate page

---

### US-027: Regenerate an Existing Note With a New Style
**As a** polytechnic student  
**I want to** regenerate a saved note using a different style  
**So that** I can reformat it without re-uploading the original slide

#### Acceptance Criteria
- WHEN a student opens a saved note THE SYSTEM SHALL display a "Regenerate" button in the note toolbar
- WHEN a student clicks Regenerate THE SYSTEM SHALL show a style selector modal (same options as the generate page)
- WHEN a student selects a new style and confirms THE SYSTEM SHALL call the Claude API using the note's source file content and the new style prompt
- WHEN regeneration completes THE SYSTEM SHALL replace the displayed note content with the new output
- WHEN regeneration succeeds THE SYSTEM SHALL prompt "Save as new version or overwrite?" with two action buttons
- WHEN a student chooses "Save as new version" THE SYSTEM SHALL create a new note record linked to the same source file
- WHEN a student chooses "Overwrite" THE SYSTEM SHALL update the existing note record with the new content
- WHEN the source file has been deleted from storage THE SYSTEM SHALL display "Source file no longer available. Re-upload the slide to regenerate."
