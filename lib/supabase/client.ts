import { createBrowserClient } from '@supabase/ssr'

/**
 * TEMPORARY AUTH BYPASS FOR TESTING
 * Mock user for testing with real database
 * Using valid UUID format for compatibility with database
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
 * Browser-side Supabase client
 * Used in Client Components for client-side data fetching
 * 
 * TEMPORARY: Returns mock user but uses real database
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // TEMPORARY AUTH BYPASS: Override auth methods for mock user testing
  // getSession returns null so no stale localStorage session token is
  // used as the Bearer — the anon key is sent instead.
  // getUser returns the mock user so auth checks in components pass.
  const originalAuth = client.auth
  client.auth = {
    ...originalAuth,
    getUser: async () => ({
      data: { user: MOCK_USER },
      error: null,
    }),
    getSession: async () => ({
      data: { session: null },
      error: null,
    }),
  } as any

  return client
}
