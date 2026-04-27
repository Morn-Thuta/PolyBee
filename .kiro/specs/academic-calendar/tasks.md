# Academic Calendar — Implementation Tasks

## Overview
Implement the academic calendar: monthly/weekly/agenda views, manual event CRUD, AI-powered event extraction from briefing slides, module colour-coding, filtering, and the upcoming events dashboard widget. Depends on `modules` table and Supabase Auth.

---

## Task 1: Database Schema — Calendar Events
**Relates to:** US-018, US-019

- [ ] Create `supabase/migrations/003_calendar_events.sql` with `calendar_events` table definition
- [ ] Enable RLS, add `auth.uid() = user_id` policy
- [ ] Add index: `idx_events_user_start ON calendar_events(user_id, start_date)`
- [ ] Re-generate Supabase TypeScript types to include `CalendarEvent`

---

## Task 2: Install Calendar Library
**Relates to:** US-018

- [ ] Install `react-big-calendar` and its peer dependency `date-fns`
- [ ] Install `@types/react-big-calendar` (or use included types)
- [ ] Import CSS: `import 'react-big-calendar/lib/css/react-big-calendar.css'` in `app/layout.tsx`
- [ ] Create a `date-fns` localiser: `const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })`

---

## Task 3: Calendar Page — Base Render
**Relates to:** US-018

- [ ] Create `app/(dashboard)/calendar/page.tsx` — server component fetching all user events and modules
- [ ] Create `components/calendar/AcademicCalendar.tsx` — client component wrapping `react-big-calendar`
- [ ] Map `CalendarEvent` rows to `react-big-calendar` event shape: `{ id, title, start: new Date(start_date), end: new Date(end_date), allDay: all_day, resource: { module_id, event_type } }`
- [ ] Implement `eventStyleGetter` using `module.colour` from a `moduleColourMap`
- [ ] Add toolbar buttons for Month / Week / Agenda view switching
- [ ] Show empty-state message when no events exist (custom `messages.noEventsInRange` prop)

---

## Task 4: Event Form Component
**Relates to:** US-019, US-021

- [ ] Create `components/calendar/EventForm.tsx` using shadcn `Dialog`
- [ ] Fields: Title (text, required), Date (date input, required), Time (time input, optional), Module (select, required), Event Type (select), Description (textarea, optional)
- [ ] Module select pre-populated from user's modules list
- [ ] Inline validation: show errors for missing title and date
- [ ] Expose `mode: 'create' | 'edit'` prop; edit mode pre-fills fields and shows Delete button

---

## Task 5: Event API Routes
**Relates to:** US-019, US-021

- [ ] Create `app/api/events/route.ts` — `POST` (create single event): validate, insert, return event
- [ ] Create `app/api/events/[eventId]/route.ts` — `PATCH` (update), `DELETE` (delete)
- [ ] Create `app/api/events/bulk/route.ts` — `POST`: accept `{ events: CalendarEventInsert[] }`, insert all in a single transaction, return inserted rows
- [ ] All routes: 401 if unauthenticated, 404 if event not found or wrong owner, Zod validation on body

---

## Task 6: Create and Edit Events via Calendar
**Relates to:** US-019, US-021

- [ ] Wire `AcademicCalendar` `onSelectSlot` prop: open `EventForm` in create mode with the clicked date pre-filled
- [ ] Wire `AcademicCalendar` `onSelectEvent` prop: open an event detail popover (shadcn `Popover`) showing title, date, module name, event type
- [ ] Add Edit button in the popover → open `EventForm` in edit mode
- [ ] Add Delete button in the popover → show `ConfirmDialog` → call `DELETE /api/events/:id` → remove from calendar state optimistically

---

## Task 7: AI Date Extraction Flow
**Relates to:** US-020

- [ ] Create `lib/ai/prompts.ts` entry: `CALENDAR_EXTRACTION_SYSTEM` prompt (returns JSON array)
- [ ] Create `app/api/extract-calendar-events/route.ts`:
  - `POST { storagePath, moduleId }`
  - Download file, extract text
  - Call Claude with `CALENDAR_EXTRACTION_SYSTEM`
  - Parse JSON response (try/catch on `JSON.parse`)
  - Return `{ events: ExtractedEvent[] }` or 422 if no dates found / parse failure
- [ ] Create `components/calendar/EventExtractModal.tsx`:
  - File upload step (reuse `FileUploader`)
  - On upload: call `/api/extract-calendar-events`
  - Show loading state during extraction
  - Display confirmation table with editable rows and checkboxes
  - "Confirm & Save" calls `POST /api/events/bulk` with checked + edited events
  - Show "No dates extracted" state if API returns empty array
- [ ] Add "Import from Briefing" button to calendar page header

---

## Task 8: Module Filter Bar
**Relates to:** US-023

- [ ] Create a filter bar above the calendar with colour-coded module chips and an "All" chip
- [ ] Client-side filter: when a module chip is active, pass filtered events to `AcademicCalendar`
- [ ] "All" chip resets to show all events
- [ ] Active chip has filled background; inactive chip has outline style

---

## Task 9: Upcoming Events Dashboard Widget
**Relates to:** US-022

- [ ] Create `components/calendar/UpcomingEvents.tsx` — server component
- [ ] Fetch next 5 events: `start_date >= now()`, `ORDER BY start_date ASC`, `LIMIT 5`, join `modules` for name + colour
- [ ] Render each event as a card: colour-coded left border, title, module name, formatted date (e.g. "Tue, 15 May")
- [ ] Event within 3 days: show yellow "Soon" badge (using `differenceInDays` from `date-fns`)
- [ ] Empty state: "No upcoming events. Enjoy the break!"
- [ ] Clicking an event navigates to the Calendar page
- [ ] Add widget to `app/(dashboard)/page.tsx` (dashboard home)

---

## Task 10: Per-Module Calendar View
**Relates to:** US-018

- [ ] Add a "Calendar" tab to the module workspace page (`modules/[moduleId]/page.tsx`)
- [ ] The tab renders `AcademicCalendar` pre-filtered to only that module's events
- [ ] "Add Event" button within the tab pre-selects the current module in the `EventForm`

---

## Testing Checklist
- [ ] Navigate to Calendar page and verify events render with correct module colours
- [ ] Click an empty slot and create an event — verify it appears on the calendar
- [ ] Click an existing event and edit the title — verify update is reflected
- [ ] Delete an event — verify it is removed from the calendar
- [ ] Upload a module briefing PDF — verify extracted events appear in the confirmation modal
- [ ] Confirm extraction import — verify events are saved and appear on the calendar
- [ ] Upload a briefing with no dates — verify "no dates extracted" message
- [ ] Filter by a single module — verify only that module's events are shown
- [ ] Verify "Upcoming Events" widget on dashboard shows the correct next 5 events
- [ ] Verify events within 3 days show the "Soon" badge
- [ ] Verify `/api/extract-calendar-events` returns 401 for unauthenticated requests
