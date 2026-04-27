# Supabase Setup Documentation

## Overview

This document describes the Supabase database setup for PolyBee, including the schema, migrations, and configuration.

## Project Information

- **Project Name:** PolyBee
- **Project Reference:** qfihunydjzmahyzclfaf
- **Project URL:** https://qfihunydjzmahyzclfaf.supabase.co
- **Region:** Northeast Asia (Tokyo)

## Database Schema

### Tables

#### 1. modules
Stores module information for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| user_id | text | User identifier |
| code | text | Module code (e.g., "INF1005") |
| name | text | Module name |
| colour | text | Hex color for UI display (default: #3b82f6) |
| created_at | timestamptz | Creation timestamp |

**Constraints:**
- UNIQUE(user_id, code) - Each user can only have one module with a given code

**Indexes:**
- idx_modules_user_id - For faster user-based queries

#### 2. notes
Stores AI-generated study notes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| user_id | text | User identifier |
| module_id | uuid | Foreign key to modules table |
| title | text | Note title |
| content | text | Note content (Markdown) |
| style | text | Note style (notion-friendly, deep-dive, quick-summary, custom) |
| source_file_path | text | Optional path to source file |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp (auto-updated) |

**Constraints:**
- CHECK (style IN ('notion-friendly', 'deep-dive', 'quick-summary', 'custom'))
- Foreign key to modules(id) with CASCADE delete

**Indexes:**
- idx_notes_user_id - For faster user-based queries
- idx_notes_module_id - For faster module-based queries
- idx_notes_updated_at - For sorting by update time

**Triggers:**
- update_notes_updated_at - Automatically updates updated_at on row update

#### 3. module_files
Stores uploaded files for each module.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| user_id | text | User identifier |
| module_id | uuid | Foreign key to modules table |
| filename | text | Original filename |
| storage_path | text | Path in Supabase Storage |
| mime_type | text | File MIME type |
| size_bytes | bigint | File size in bytes |
| created_at | timestamptz | Upload timestamp |

**Constraints:**
- Foreign key to modules(id) with CASCADE delete

**Indexes:**
- idx_module_files_user_id - For faster user-based queries
- idx_module_files_module_id - For faster module-based queries

## Row-Level Security (RLS)

All tables have RLS enabled with policies that restrict access based on user_id.

### Current Policies (Testing Mode)

For testing purposes, all policies currently allow access for the mock user ID:
`00000000-0000-0000-0000-000000000001`

**Policies:**
- `users own modules` - Users can only access their own modules
- `users own notes` - Users can only access their own notes
- `users own module_files` - Users can only access their own files

### Production Policies (Future)

When authentication is implemented, policies should be updated to:
```sql
USING (auth.uid()::text = user_id)
```

## Migration History

| Migration | Description |
|-----------|-------------|
| 001_initial_schema.sql | Initial database schema with all tables |
| 002_add_indexes.sql | Performance indexes for common queries |
| 003_fix_user_id_type.sql | Changed user_id from uuid to text type |
| 004_update_rls_policies_for_uuid.sql | Updated RLS policies for UUID format mock user |

## Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://qfihunydjzmahyzclfaf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_QJZW08MlfFTKVXkpBqpK1g_JRtrOGK7"
SUPABASE_SERVICE_ROLE_KEY="[Get from Supabase Dashboard]"

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY="[Your API Key]"
```

### Getting the Service Role Key

1. Go to https://app.supabase.com/project/qfihunydjzmahyzclfaf/settings/api
2. Find the "service_role" key (starts with "eyJ...")
3. Copy and paste into `.env.local`

**Important:** The service role key bypasses RLS and should never be exposed to the client.

## Supabase CLI Commands

### Link to Project
```bash
supabase link --project-ref qfihunydjzmahyzclfaf
```

### Push Migrations
```bash
supabase db push --linked
```

### Generate TypeScript Types
```bash
supabase gen types typescript --linked > supabase/types.ts
```

### Check Migration Status
```bash
supabase migration list --linked
```

### Create New Migration
```bash
supabase migration new <migration_name>
```

## Testing Configuration

### Mock User

For testing without authentication, a mock user is configured:

- **ID:** `00000000-0000-0000-0000-000000000001`
- **Email:** `test@polybee.com`

This mock user is injected in:
- `lib/supabase/server.ts` - Server-side client
- `lib/supabase/client.ts` - Client-side client

### Removing Mock User

When implementing real authentication:

1. Remove mock user code from both Supabase clients
2. Update RLS policies to use `auth.uid()::text`
3. Implement login/signup pages
4. Add authentication middleware

## Troubleshooting

### "Failed to check for duplicate module" Error

**Cause:** Mock user ID format mismatch or RLS blocking queries

**Solution:**
1. Ensure mock user ID is in UUID format: `00000000-0000-0000-0000-000000000001`
2. Verify RLS policies allow the mock user ID
3. Check that service role key is correct (if using server-side bypass)

### Schema Drift

**Cause:** Local migrations out of sync with hosted database

**Solution:**
```bash
supabase db pull <migration_name> --yes
supabase gen types typescript --linked > supabase/types.ts
```

### Type Errors

**Cause:** TypeScript types don't match current database schema

**Solution:**
```bash
supabase gen types typescript --linked > supabase/types.ts
```

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ TypeScript types generated
4. ✅ Mock user configured for testing
5. ⏳ Implement remaining features (notes, files, calendar)
6. ⏳ Implement real authentication
7. ⏳ Update RLS policies for production
8. ⏳ Set up Supabase Storage for file uploads
