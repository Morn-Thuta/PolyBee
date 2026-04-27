# PolyBee — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-04-27  
**Author:** PolyBee Team  
**Status:** MVP

---

## 1. Product Overview

### 1.1 Vision
PolyBee is a web-based study companion built specifically for polytechnic students. It turns raw lecturer slides into structured study notes, keeps all module materials organised in one place, and surfaces important academic dates — so students can spend less time managing their studies and more time actually learning.

### 1.2 Problem Statement
Polytechnic students receive a large volume of lecture slides, lab sheets, and briefing documents across multiple modules each semester. Currently:

- Studying from raw slides is inefficient — slides are built for presenting, not learning.
- Files are scattered across emails, LMS portals, and local folders.
- Open-book exam prep requires manually searching through dozens of unrelated files.
- Tracking CAs, assignments, and deadlines across modules is error-prone when done manually.

PolyBee solves all four problems in a single, cohesive tool.

---

## 2. Target Users

### Primary Persona — The Polytechnic Student
- Age: 17–22
- Enrolled in a Singapore polytechnic (RP, SP, NP, NYP, TP)
- Receives 4–8 modules per semester, each with multiple slide decks
- Frequently has open-book assessments (common tests, practical exams)
- Comfortable with tools like Notion, Google Docs, and mobile apps

### Pain Points
| Pain Point | How PolyBee Addresses It |
|------------|--------------------------|
| Slides are hard to study from | AI generates clean, structured notes |
| Files live everywhere | Module workspace consolidates everything |
| Open-book exams need merged files | One-click PDF/PPTX merger |
| Missed submission deadlines | Academic calendar auto-populated from briefings |
| Generic AI notes don't suit my style | Customisable note styles |

---

## 3. MVP Feature Set

### Feature 1 — AI Study Note Generation
Students upload a PDF or PowerPoint slide deck and receive AI-generated study notes in a chosen format. Notes are structured with headings, key concepts, and summaries.

**Core flows:**
- Upload file (PDF or PPTX) from device
- Select note style (Notion-Friendly, Deep Dive, Quick Summary)
- AI processes slides and returns formatted Markdown notes
- Review and edit notes in an inline editor
- Save notes to a module workspace

### Feature 2 — Module Workspace
Each module gets its own page — a Notion-inspired workspace where students store generated notes, uploaded files, and linked calendar events. All content is private to the logged-in student.

**Core flows:**
- Create a module (module code + name, e.g. "INF1005 — Programming Fundamentals")
- View all notes and files attached to a module
- Navigate modules via sidebar
- Search across notes and files within a module

### Feature 3 — File Consolidation (Slide Merger)
Students select multiple PDF or PPTX files and merge them into a single downloadable file. Particularly useful for open-book exams where Ctrl+F across one merged file is far faster than switching between documents.

**Core flows:**
- Select 2+ files (from uploaded files or local upload)
- Choose output format: PDF or PPTX
- Set slide order via drag-and-drop
- Download the merged file

### Feature 4 — Academic Calendar
A per-module calendar where students track CAs, project submissions, and lab deadlines. Events can be added manually or extracted automatically from a module briefing slide using AI.

**Core flows:**
- View calendar (month / week / agenda views)
- Add event manually (title, date, module, type: CA / Submission / Quiz / Other)
- Upload module briefing → AI extracts dates → student confirms and saves
- Colour-coded by module
- Upcoming events widget on dashboard

### Feature 5 — Note Style Customisation
Before generating notes, students choose a style that fits how they learn. The style controls the AI prompt and the resulting note structure.

**Available Styles:**
| Style | Description |
|-------|-------------|
| Notion-Friendly | Clean headers, bullet points, callout boxes — pastes perfectly into Notion |
| Deep Dive | Detailed explanations, examples, elaborated concepts |
| Quick Summary | Concise bullet points only, skimmable in minutes |
| Custom | Student defines their own format instructions |

Students can set a default style per module, or choose on each generation.

---

## 4. User Stories Summary

| ID | Feature | Story |
|----|---------|-------|
| US-001 | Note Gen | Upload a slide file and receive AI notes |
| US-002 | Note Gen | Choose a note style before generating |
| US-003 | Note Gen | Edit generated notes in-browser |
| US-004 | Note Gen | Save notes to a module |
| US-005 | Note Gen | Regenerate notes with a different style |
| US-006 | Workspace | Create and manage modules |
| US-007 | Workspace | View all notes and files in a module |
| US-008 | Workspace | Upload raw files to a module |
| US-009 | Workspace | Search within a module |
| US-010 | Workspace | Delete notes and files |
| US-011 | Workspace | Rename and organise modules |
| US-012 | File Merge | Select multiple files and choose output format |
| US-013 | File Merge | Reorder files before merging |
| US-014 | File Merge | Download the merged file |
| US-015 | File Merge | Merge PPTX files into a single PDF |
| US-016 | Calendar | View calendar with module-coloured events |
| US-017 | Calendar | Add events manually |
| US-018 | Calendar | Extract events from briefing slides via AI |
| US-019 | Calendar | Edit and delete events |
| US-020 | Calendar | View upcoming events on dashboard |
| US-021 | Calendar | Filter calendar by module |
| US-022 | Note Style | Choose note style at generation time |
| US-023 | Note Style | Preview style before generating |
| US-024 | Note Style | Set a default style preference |
| US-025 | Note Style | Regenerate an existing note with a new style |

---

## 5. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Notes generated per session | ≥ 1 per active user |
| File merges completed | Users can merge ≥ 5 files in under 60 seconds |
| Calendar events populated | ≥ 3 events per module from AI extraction |
| Module setup time | < 2 minutes from sign-up to first note |
| Note quality (qualitative) | Students rate AI notes ≥ 4/5 |

---

## 6. Out of Scope (MVP)

- Mobile native app (iOS/Android) — web-responsive only
- Collaboration / sharing notes with classmates
- Direct LMS (Moodle/Canvas) integration
- Video lecture transcription
- Flashcard / spaced repetition system
- Grading or GPA tracking
- Push / email notifications

---

## 7. Technical Architecture (Summary)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| Auth | Supabase Auth (email + password, Google OAuth) |
| File Storage | Supabase Storage |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| PDF Processing | `pdf-lib` (merge), `pdfjs-dist` (extract text) |
| PPTX Processing | `pptxgenjs` (generate), `officeparser` (extract text) |
| Calendar UI | `react-big-calendar` |
| Deployment | Vercel |

---

## 8. Design Principles

1. **Student-first simplicity** — every flow should work in ≤ 3 clicks
2. **Speed** — note generation should complete in under 15 seconds for a 20-slide deck
3. **Familiarity** — the workspace borrows Notion's mental model so onboarding is instant
4. **Privacy** — all data is scoped to the logged-in user via Supabase RLS; no sharing by default
5. **Offline-awareness** — uploaded files and notes are cached; read access works on poor connections

---

## 9. Constraints & Assumptions

- Target users are Singapore polytechnic students; UI copy uses Singapore English
- Slide files are assumed to be in English
- Maximum file upload size: 50 MB per file
- Claude API rate limits may queue generation requests during peak hours
- PPTX-to-PPTX merging preserves layout on a best-effort basis; complex slide animations may be lost
