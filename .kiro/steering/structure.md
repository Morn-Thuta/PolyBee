---
name: structure
description: PolyBee project folder layout, naming conventions, import patterns, and architectural patterns. Load this in every session.
inclusion: always
---

# PolyBee — Project Structure

## Top-Level Directory Layout
```
E:\PolyBee\
├── .kiro/
│   ├── specs/          # Feature specs (requirements, design, tasks)
│   └── steering/       # Persistent project context for Kiro agents
├── app/                # Next.js App Router pages and API routes
├── components/         # Shared React components
├── lib/                # Utility functions and service clients
├── supabase/           # Supabase config, migrations, and generated types
├── public/             # Static assets (logo, icons)
├── PRD.md              # Product Requirements Document
├── .env.local          # Local environment variables (not committed)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## `app/` Directory (Next.js App Router)
```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + main layout
│   ├── page.tsx                # Dashboard home (upcoming events widget)
│   ├── modules/
│   │   ├── page.tsx            # All modules list
│   │   ├── new/page.tsx        # Create module form
│   │   └── [moduleId]/
│   │       ├── page.tsx        # Module workspace page
│   │       ├── notes/[noteId]/page.tsx
│   │       └── calendar/page.tsx
│   ├── generate/page.tsx       # Note generation flow
│   ├── merge/page.tsx          # File consolidation flow
│   └── calendar/page.tsx       # Full academic calendar
└── api/
    ├── generate-notes/route.ts         # POST: AI note generation
    ├── extract-calendar-events/route.ts # POST: AI date extraction from briefing
    ├── merge-pptx/route.ts             # POST: Server-side PPTX merge
    └── modules/
        └── [moduleId]/route.ts         # GET/PATCH/DELETE module
```

## `components/` Directory
```
components/
├── ui/                     # shadcn/ui primitives (auto-generated, do not edit)
├── layout/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   └── DashboardLayout.tsx
├── modules/
│   ├── ModuleCard.tsx
│   ├── ModuleCreateForm.tsx
│   └── ModuleSidebar.tsx
├── notes/
│   ├── NoteEditor.tsx
│   ├── NoteCard.tsx
│   └── StyleSelector.tsx
├── files/
│   ├── FileUploader.tsx
│   ├── FileList.tsx
│   └── MergePanel.tsx
├── calendar/
│   ├── AcademicCalendar.tsx
│   ├── EventForm.tsx
│   ├── EventExtractModal.tsx
│   └── UpcomingEvents.tsx
└── shared/
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    └── ConfirmDialog.tsx
```

## `lib/` Directory
```
lib/
├── supabase/
│   ├── client.ts           # Browser-side Supabase client
│   ├── server.ts           # Server-side Supabase client (cookies)
│   └── middleware.ts       # Auth middleware
├── ai/
│   ├── gemini.ts           # Google Generative AI client singleton
│   ├── prompts.ts          # All Gemini prompt templates
│   └── note-styles.ts      # Style definitions (Notion-Friendly, Deep Dive, etc.)
├── files/
│   ├── pdf-utils.ts        # PDF text extraction (pdfjs-dist)
│   ├── pdf-merge.ts        # PDF merge logic (pdf-lib)
│   ├── pptx-utils.ts       # PPTX text extraction (officeparser)
│   └── file-helpers.ts     # MIME type checks, size formatting
└── utils.ts                # General utilities (cn(), formatDate(), etc.)
```

## `supabase/` Directory
```
supabase/
├── migrations/             # Numbered SQL migration files
├── types.ts                # Auto-generated TypeScript types (supabase gen types)
└── config.toml             # Local Supabase config
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `NoteEditor.tsx` |
| Pages | `page.tsx` in route folder | `app/modules/page.tsx` |
| API routes | `route.ts` in route folder | `app/api/generate-notes/route.ts` |
| Utility functions | camelCase | `extractPdfText()` |
| Supabase tables | snake_case | `module_files` |
| TypeScript interfaces | PascalCase with `I` optional | `StudyNote`, `CalendarEvent` |
| CSS classes | Tailwind utility classes only | `className="flex gap-4 p-2"` |
| Env vars | SCREAMING_SNAKE_CASE | `GOOGLE_GENERATIVE_AI_API_KEY` |

## Import Path Aliases
```typescript
// Always use @/ alias — never relative ../../
import { cn } from '@/lib/utils'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { createClient } from '@/lib/supabase/client'
```

## Key Architectural Patterns

### Server Components vs Client Components
- Pages and layouts default to **Server Components** — fetch data server-side
- Mark `'use client'` only for components with interactivity (forms, editors, drag-and-drop)
- API calls to Claude and Supabase are **never** made from the browser directly — always through `/api/` routes or server actions

### Supabase Data Fetching
```typescript
// Server component pattern
import { createClient } from '@/lib/supabase/server'
const supabase = createClient()
const { data } = await supabase.from('modules').select('*')
```

### API Route Pattern
```typescript
// app/api/generate-notes/route.ts
export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  // ... handler logic
}
```

### Database Schema Conventions
- Every table has: `id uuid DEFAULT gen_random_uuid()`, `user_id uuid REFERENCES auth.users`, `created_at timestamptz DEFAULT now()`
- RLS enabled on every table: `USING (auth.uid() = user_id)`
