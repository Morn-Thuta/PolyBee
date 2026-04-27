# Academic Calendar Requirements

## Overview
Students maintain an academic calendar tied to their modules. Events represent CAs, submission deadlines, quizzes, and other important dates. Events can be added manually or extracted automatically from a module briefing slide using AI.

---

## User Stories

### US-018: View the Academic Calendar
**As a** polytechnic student  
**I want to** see all my academic events in a calendar view  
**So that** I can get a clear picture of upcoming deadlines across all my modules

#### Acceptance Criteria
- WHEN a student navigates to the Calendar page THE SYSTEM SHALL display a full-page calendar defaulting to the current month
- WHEN the calendar loads THE SYSTEM SHALL show all the student's events colour-coded by module
- WHEN a student switches to Week view THE SYSTEM SHALL show events in hourly time slots
- WHEN a student switches to Agenda view THE SYSTEM SHALL show a chronological list of upcoming events
- WHEN a student clicks on an event THE SYSTEM SHALL display a popover showing: title, date/time, module, event type, and a description if set
- WHEN a student has no events THE SYSTEM SHALL show an empty state with a prompt to add events or import from a briefing

---

### US-019: Add a Calendar Event Manually
**As a** polytechnic student  
**I want to** add a deadline or CA date to my calendar  
**So that** I never miss an important academic date

#### Acceptance Criteria
- WHEN a student clicks an empty date on the calendar THE SYSTEM SHALL open a new event form
- WHEN a student fills in the event form THE SYSTEM SHALL require: title, date, and module; allow optional: time, event type (CA / Submission / Quiz / Lab / Other), and description
- WHEN a student submits the form THE SYSTEM SHALL save the event and display it on the calendar immediately
- WHEN saving fails THE SYSTEM SHALL display "Could not save event. Please try again."
- WHEN a student submits without a title or date THE SYSTEM SHALL display inline validation errors

---

### US-020: Import Events From a Module Briefing (AI Extraction)
**As a** polytechnic student  
**I want to** upload my module briefing slide and have the app extract important dates automatically  
**So that** I don't have to manually copy every deadline from the briefing document

#### Acceptance Criteria
- WHEN a student clicks "Import from Briefing" THE SYSTEM SHALL display a file upload modal
- WHEN a student uploads a PDF or PPTX briefing file THE SYSTEM SHALL send the extracted text to Claude with a date-extraction prompt
- WHEN Claude returns extracted events THE SYSTEM SHALL display them in a confirmation list showing: proposed title, date, event type, and source module (pre-filled to the current module if launched from a module page)
- WHEN a student reviews the list THE SYSTEM SHALL allow them to edit any field, uncheck events they don't want, or dismiss the entire import
- WHEN a student confirms THE SYSTEM SHALL save only the checked events to the database
- WHEN no dates are found in the briefing THE SYSTEM SHALL display "No dates could be extracted from this file. Try adding events manually."
- WHEN extraction fails THE SYSTEM SHALL display an error and not save any events

---

### US-021: Edit and Delete Calendar Events
**As a** polytechnic student  
**I want to** edit or delete calendar events  
**So that** I can keep my calendar accurate when dates change

#### Acceptance Criteria
- WHEN a student clicks an existing event THE SYSTEM SHALL show an event detail popover with an Edit button
- WHEN a student clicks Edit THE SYSTEM SHALL open the event form pre-filled with the event's current data
- WHEN a student saves edits THE SYSTEM SHALL update the event on the calendar immediately
- WHEN a student clicks Delete on an event THE SYSTEM SHALL display "Delete this event?" confirmation
- WHEN deletion is confirmed THE SYSTEM SHALL remove the event from the calendar immediately

---

### US-022: View Upcoming Events on the Dashboard
**As a** polytechnic student  
**I want to** see my upcoming academic events on the home dashboard  
**So that** I'm reminded of what's coming without having to open the calendar

#### Acceptance Criteria
- WHEN a student is on the Dashboard THE SYSTEM SHALL display an "Upcoming Events" widget showing the next 5 events sorted by date
- WHEN an event is within 3 days THE SYSTEM SHALL highlight it with a warning indicator
- WHEN an event is overdue THE SYSTEM SHALL show it with a strikethrough or "Overdue" label
- WHEN a student clicks an event in the widget THE SYSTEM SHALL navigate to the Calendar page with that event highlighted
- WHEN there are no upcoming events THE SYSTEM SHALL display "No upcoming events. Enjoy the break!"

---

### US-023: Filter Calendar by Module
**As a** polytechnic student  
**I want to** filter the calendar to show only one module's events  
**So that** I can focus on one subject at a time

#### Acceptance Criteria
- WHEN viewing the Calendar THE SYSTEM SHALL display a module filter bar showing all modules as colour-coded chips
- WHEN a student clicks a module chip THE SYSTEM SHALL show only events belonging to that module
- WHEN a student clicks "All" THE SYSTEM SHALL show events from all modules
- WHEN modules are filtered THE SYSTEM SHALL persist the filter selection until the student changes it or navigates away
