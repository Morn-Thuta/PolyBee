import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * TEMPORARY AUTH BYPASS FOR TESTING
 * Mock user for testing with real database
 */
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@polybee.com',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Server-side Supabase client using service role key.
 * Used in Server Components, API Routes, and Server Actions.
 *
 * Uses the service role key directly — no cookie/session complexity.
 * Auth methods are overridden to return a mock user during the testing phase.
 */
export function createClient() {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // TEMPORARY: Override auth to return mock user until real auth is wired up
  const originalAuth = client.auth
  client.auth = {
    ...originalAuth,
    getUser: async () => ({
      data: { user: MOCK_USER as any },
      error: null,
    }),
    getSession: async () => ({
      data: { session: null },
      error: null,
    }),
  } as any

  return client
}
