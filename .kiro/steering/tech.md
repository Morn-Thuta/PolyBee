---
name: tech
description: PolyBee technology stack, library choices, and technical constraints. Load this in every session.
inclusion: always
---

# PolyBee — Technology Stack

## Language & Runtime
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js 20 (via Vercel serverless functions)

## Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x (App Router) | React framework, file-based routing, server components |
| React | 18.x | UI rendering |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Accessible component library built on Radix UI |
| `@uiw/react-md-editor` | latest | Markdown editor for displaying/editing generated notes |
| `react-big-calendar` | latest | Calendar UI (month/week/agenda views) |
| `react-dropzone` | latest | File upload drag-and-drop |
| `@dnd-kit/core` | latest | Drag-and-drop for slide reordering in file merger |
| `date-fns` | latest | Date formatting and manipulation |
| `lucide-react` | latest | Icon set |
| `sonner` | latest | Toast notifications |

## Backend (Next.js API Routes)
- All API logic lives in `app/api/` as serverless route handlers
- No separate backend server — Vercel handles deployment

## Database & Auth
| Service | Purpose |
|---------|---------|
| Supabase PostgreSQL | Primary database |
| Supabase Auth | Email + password and Google OAuth |
| Supabase Storage | File uploads (slides, merged outputs) |
| Supabase RLS | Row-Level Security — all rows scoped to `auth.uid()` |

## AI
| Library | Purpose |
|---------|---------|
| `@google/generative-ai` | Google Gemini API client |
| Model: `gemini-2.0-flash` | Note generation and date extraction |

## File Processing
| Library | Purpose |
|---------|---------|
| `pdfjs-dist` | Extract text content from PDF slides (client-side) |
| `pdf-lib` | Merge multiple PDFs into one (client-side, no server needed) |
| `officeparser` | Extract text from PPTX files (server-side API route) |
| `pptxgenjs` | Generate merged PPTX output (server-side API route) |

## Development Tools
| Tool | Purpose |
|------|---------|
| ESLint + Prettier | Linting and formatting |
| Husky + lint-staged | Pre-commit hooks |
| `tsx` | TypeScript script runner |
| Supabase CLI | Local dev, migrations, type generation |

## Deployment
- **Hosting:** Vercel (automatic deployments from main branch)
- **Environment variables:** managed in Vercel dashboard and `.env.local` locally
- **Required env vars:**
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  GOOGLE_GENERATIVE_AI_API_KEY
  ```

## Technical Constraints
- Maximum file upload: 50 MB (Supabase Storage default; configurable)
- Gemini API: 2M token context window; 20-slide deck ≈ 5–10k tokens
- PPTX merging: preserves slide content; complex animations/macros dropped
- Supabase free tier: 500 MB DB, 1 GB Storage, 50k MAU — sufficient for MVP/demo
- Target browsers: Chrome 120+, Firefox 120+, Safari 17+ (no IE)
