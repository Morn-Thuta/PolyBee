import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
 * Server-side Supabase client
 * Used in Server Components, API Routes, and Server Actions
 * Handles cookie-based authentication
 * 
 * TEMPORARY: Returns mock user but uses real database
 * Uses service role key to bypass RLS for testing
 */
export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Use service role key to bypass RLS during testing
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const client = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        // Block Supabase auth cookies so the service role key is used
        // as the Bearer token instead of any stale session token from cookies
        if (name.includes('auth-token')) return undefined
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  // TEMPORARY AUTH BYPASS: Override auth methods for mock user testing
  // getSession returns null so the service role key (not stale cookies) is
  // used as the Bearer token on every Supabase request.
  // getUser returns the mock user so API route auth checks pass.
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
