---
name: product
description: PolyBee product overview, target users, feature set, and design principles. Load this in every session.
inclusion: always
---

# PolyBee — Product Overview

## What Is PolyBee?
PolyBee is a web study app for Singapore polytechnic students. It uses AI to transform lecturer slides into structured study notes, provides a Notion-inspired workspace per module, merges multiple slide files into one searchable document, and maintains an academic calendar auto-populated from briefing slides.

## Target User
A Singapore polytechnic student (age 17–22) who:
- Takes 4–8 modules per semester, each with multiple slide decks
- Sits open-book assessments (common tests, practical exams)
- Wants clean, readable notes without manually re-typing slides
- Needs one place to track all deadlines (CAs, submissions, quizzes)

## Five Core Features (MVP)

### 1. AI Study Note Generation
- Student uploads a PDF or PPTX lecture slide
- Selects a note style (Notion-Friendly, Deep Dive, Quick Summary, Custom)
- AI (Claude) returns structured Markdown notes
- Student edits and saves to a module workspace

### 2. Module Workspace
- Each academic module has a dedicated page (like a Notion database entry)
- Stores generated notes, uploaded files, and linked calendar events
- Sidebar navigation between modules
- In-module search across notes and file names

### 3. File Consolidation (Slide Merger)
- Student selects ≥ 2 uploaded files (PDF or PPTX)
- Reorders via drag-and-drop
- Chooses output: PDF or PPTX
- Downloads the merged file — critical for open-book exams (single Ctrl+F target)

### 4. Academic Calendar
- Per-module colour-coded calendar (month / week / agenda views)
- Manual event entry: CA date, submission deadline, quiz, etc.
- AI extraction: upload a module briefing → Claude extracts dates → student confirms
- Upcoming events widget on the main dashboard

### 5. Note Style Customisation
- Styles: Notion-Friendly | Deep Dive | Quick Summary | Custom
- Student sets a default per module or chooses per generation
- Style is injected into the Claude system prompt
- Retroactive regeneration available for existing notes

## Design Principles
- **Student-first simplicity**: every core flow ≤ 3 clicks
- **Speed**: note generation < 15 s for a 20-slide deck
- **Familiarity**: Notion-like mental model, zero learning curve
- **Privacy**: all data scoped to logged-in user (Supabase RLS)

## Out of Scope (MVP)
- Mobile native app (responsive web only)
- Classmate collaboration or note sharing
- LMS (Moodle/Canvas) integration
- Video transcription, flashcards, GPA tracking
