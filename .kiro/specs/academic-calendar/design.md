# Academic Calendar Design

## Overview
The academic calendar uses `react-big-calendar` for rendering and Supabase for event storage. Events are colour-coded by module. AI-powered date extraction uploads a briefing file, calls Claude to identify dates and event types, and presents a confirmation UI before committing anything to the database.

---

## Architecture

```
[Browser — Calendar Page]
  AcademicCalendar (react-big-calendar)
  │  events: CalendarEvent[] (fetched server-side)
  │  colour map: { moduleId → colour } (from modules table)
  │
  ├── Click empty slot → EventForm (modal, new event)
  ├── Click event → EventPopover → EventForm (edit)
  │
  └── "Import from Briefing" button
        │
        ▼
        FileUploader → Supabase Storage (temp)
              │
              ▼
        POST /api/extract-calendar-events
          { storagePath, moduleId }
              │
              ▼
        Claude API → JSON array of events
              │
              ▼
        EventExtractModal (user confirms/edits list)
              │
              ▼
        POST /api/modules/:moduleId/events (bulk insert)
```

---

## Data Models

```typescript
interface CalendarEvent {
  id: string
  user_id: string
  module_id: string
  title: string
  event_type: EventType    // 'ca' | 'submission' | 'quiz' | 'lab' | 'other'
  start_date: string       // ISO 8601
  end_date: string         // ISO 8601 (same as start for all-day events)
  all_day: boolean
  description?: string
  created_at: string
}

type EventType = 'ca' | 'submission' | 'quiz' | 'lab' | 'other'
```

### Database Migration (SQL)
```sql
CREATE TABLE calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  module_id   uuid REFERENCES modules(id) ON DELETE CASCADE,
  title       text NOT NULL,
  event_type  text NOT NULL DEFAULT 'other',
  start_date  timestamptz NOT NULL,
  end_date    timestamptz NOT NULL,
  all_day     boolean DEFAULT true,
  description text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own events" ON calendar_events USING (auth.uid() = user_id);

-- Index for dashboard upcoming events widget
CREATE INDEX idx_events_user_start ON calendar_events(user_id, start_date);
```

---

## Component Breakdown

### `AcademicCalendar` (`components/calendar/AcademicCalendar.tsx`)
Client component wrapping `react-big-calendar`.

```typescript
// Colour mapping: each module gets its saved colour
const eventStyleGetter = (event: CalendarEvent) => ({
  style: {
    backgroundColor: moduleColourMap[event.module_id] ?? '#6B7280',
    border: 'none',
    borderRadius: '4px'
  }
})
```

Props:
- `events: CalendarEvent[]`
- `modules: Module[]`
- `onEventCreate(slot: SlotInfo)` — called on empty slot click
- `onEventEdit(event: CalendarEvent)` — called on event click

### `EventForm` (`components/calendar/EventForm.tsx`)
Used for both create and edit. Fields:
- Title (required, text)
- Date (required, date picker)
- Time (optional, time picker — enables `all_day: false`)
- Module (required, select from user's modules)
- Event Type (select: CA / Submission / Quiz / Lab / Other)
- Description (optional, textarea)

Submits to:
- Create: `POST /api/events`
- Edit: `PATCH /api/events/[eventId]`
- Delete button (edit mode only): `DELETE /api/events/[eventId]`

### `EventExtractModal` (`components/calendar/EventExtractModal.tsx`)
Shown after AI extraction. Displays a table of extracted events:

| ☑ | Title | Date | Type | Module |
|---|-------|------|------|--------|
| ✓ | CA1   | 15 May 2026 | CA | INF1005 |
| ✓ | Lab 3 Submission | 20 May 2026 | Submission | INF1005 |

Each row is editable. Rows can be unchecked to exclude them.
"Confirm & Save" calls `POST /api/events/bulk` with the checked events.

### `UpcomingEvents` (`components/calendar/UpcomingEvents.tsx`)
Server component fetching the next 5 events:

```typescript
const { data: events } = await supabase
  .from('calendar_events')
  .select('*, modules(name, colour)')
  .gte('start_date', new Date().toISOString())
  .order('start_date', { ascending: true })
  .limit(5)
```

Renders each event as a card with a colour-coded left border.
Within-3-days events get a yellow "Soon" badge.
Past events (shouldn't appear normally) get an "Overdue" label.

---

## AI Date Extraction

### Prompt (`lib/ai/prompts.ts`)

```typescript
export const CALENDAR_EXTRACTION_SYSTEM = `You are a date extraction assistant for polytechnic students.
Extract all academic deadlines, assessments, and important dates from the provided document text.
Return a JSON array only — no explanation, no markdown fences.

Each item must follow this schema exactly:
{
  "title": string,        // short event title, e.g. "CA1", "Lab 3 Submission"
  "date": string,         // ISO 8601 date, e.g. "2026-05-15"
  "event_type": "ca" | "submission" | "quiz" | "lab" | "other",
  "description": string   // brief context from the document, or ""
}

If no dates are found, return an empty array: []`
```

Claude's response is parsed with `JSON.parse()`. If parsing fails (malformed JSON), the API route returns a 422 and the UI shows the generic "no dates found" message.

---

## API Routes

### `POST /api/extract-calendar-events`
Body: `{ storagePath: string, moduleId: string }`
1. Download file from storage
2. Extract text (pdf-utils or officeparser)
3. Call Claude with `CALENDAR_EXTRACTION_SYSTEM` prompt
4. Parse JSON response
5. Return `{ events: ExtractedEvent[] }`

### `POST /api/events`
Creates a single event. Body: `CalendarEventInsert`.

### `POST /api/events/bulk`
Creates multiple events. Body: `{ events: CalendarEventInsert[] }`.

### `PATCH /api/events/[eventId]`
Updates event fields.

### `DELETE /api/events/[eventId]`
Deletes the event.

---

## Module Filter Implementation
Client-side — the full event list is fetched once; the filter is applied in the browser.

```typescript
const [activeModuleId, setActiveModuleId] = useState<string | 'all'>('all')

const visibleEvents = activeModuleId === 'all'
  ? events
  : events.filter(e => e.module_id === activeModuleId)
```

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Claude returns invalid JSON | 422 from API, "no dates found" message in UI |
| Briefing file has no text | 422 with `"NO_TEXT"` code, specific message |
| Event form missing required fields | Inline validation, form not submitted |
| Bulk insert partial failure | All-or-nothing transaction; full error toast |
