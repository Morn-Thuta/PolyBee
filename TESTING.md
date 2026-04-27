# PolyBee Testing Guide

## Current Status: Connected to Real Supabase Database ✅

PolyBee is now connected to a real Supabase hosted database with a temporary authentication bypass for testing.

### Mock User Configuration

**Mock User ID:** `00000000-0000-0000-0000-000000000001` (UUID format)
**Mock Email:** `test@polybee.com`

This mock user is configured in:
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client

### Database Setup

The database has been set up with the following tables:
1. **modules** - Stores module information (code, name, colour)
2. **notes** - Stores generated study notes
3. **module_files** - Stores uploaded files

All tables have Row-Level Security (RLS) enabled with policies that allow access for the mock user ID.

### Environment Variables

Required environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL="https://qfihunydjzmahyzclfaf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaWh1bnlkanptYWh5emNsZmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDEwNjIsImV4cCI6MjA5Mjg3NzA2Mn0.78Fz74KLkf6A7x2470wWdJgrOz9gjk_Lbu4-Wo1y0wk"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaWh1bnlkanptYWh5emNsZmFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMwMTA2MiwiZXhwIjoyMDkyODc3MDYyfQ.9Z6M5t2ha5pMqXqMfUSu48l8LEdjp_SGSE5ydIZjdfA"
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyAhXNImr0QLmpvrvCJ1hroaAFcjszSiNxc"
```

**Note:** The service role key is now correctly configured with a JWT token that bypasses RLS.

### Applied Migrations

1. `001_initial_schema.sql` - Initial database schema
2. `002_add_indexes.sql` - Performance indexes
3. `003_fix_user_id_type.sql` - Changed user_id from uuid to text
4. `004_update_rls_policies_for_uuid.sql` - Updated RLS policies for UUID format mock user

### Testing the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the application:**
   Open http://localhost:3000 in your browser

3. **Test module creation:**
   - Navigate to the modules page
   - Click "Create Module"
   - Fill in module code and name
   - Submit the form

4. **Verify database connection:**
   - Check that modules are saved to the database
   - Verify that you can view, edit, and delete modules

### What Works Now

✅ **Real database connection** - Data persists across page refreshes
✅ **Module CRUD operations** - Create, read, update, delete modules
✅ **Row-Level Security** - RLS policies configured for mock user
✅ **TypeScript types** - Generated from database schema

### Known Issues

✅ **RESOLVED** - All connection issues have been fixed:
- Mock user ID is now in correct UUID format
- Service role key is correctly configured with JWT token
- RLS policies updated to allow mock user access

### Next Steps

Once testing is complete, implement proper authentication:
1. Remove mock user configuration from `lib/supabase/server.ts` and `lib/supabase/client.ts`
2. Update RLS policies to use `auth.uid()` instead of hardcoded user ID
3. Implement login/signup pages
4. Add authentication middleware
