# PolyBee

AI-powered study companion for Singapore polytechnic students.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Supabase account (for database and auth)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
- Get your Supabase URL and keys from: https://app.supabase.com/project/_/settings/api
- Get your Google Gemini API key from: https://aistudio.google.com/app/apikey

3. Run database migrations:

Once you have Supabase set up, run the migrations in `supabase/migrations/` to create the necessary tables.

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
PolyBee/
├── app/                    # Next.js App Router pages and API routes
│   ├── (dashboard)/        # Dashboard layout group
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # shadcn/ui primitives
│   └── layout/             # Layout components (Sidebar, etc.)
├── lib/                    # Utility functions and service clients
│   ├── supabase/           # Supabase client setup
│   └── utils.ts            # General utilities
├── supabase/               # Supabase config and migrations
│   ├── migrations/         # SQL migration files
│   └── types.ts            # TypeScript types
└── public/                 # Static assets
```

## Features

- **AI Study Note Generation**: Upload slides and get structured study notes
- **Module Workspace**: Notion-inspired workspace per academic module
- **File Consolidation**: Merge multiple slide files for open-book exams
- **Academic Calendar**: Track CAs, submissions, and deadlines
- **Note Style Customisation**: Choose from multiple note formats

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Development

```bash
# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build
```

## License

Private project - All rights reserved
