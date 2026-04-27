import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/modules
 * Creates a new module for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { code, name, colour } = body

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Module code and name are required' },
        { status: 400 }
      )
    }

    // Validate code format (trim whitespace)
    const trimmedCode = code.trim()
    const trimmedName = name.trim()

    if (!trimmedCode || !trimmedName) {
      return NextResponse.json(
        { error: 'Module code and name cannot be empty' },
        { status: 400 }
      )
    }

    // Check for duplicate module code for this user
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id')
      .eq('user_id', user.id)
      .eq('code', trimmedCode)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for duplicate module:', checkError)
      return NextResponse.json(
        { error: 'Failed to check for duplicate module' },
        { status: 500 }
      )
    }

    if (existingModule) {
      return NextResponse.json(
        { error: 'You already have a module with this code.' },
        { status: 409 }
      )
    }

    // Insert new module
    const { data: newModule, error: insertError } = await supabase
      .from('modules')
      .insert({
        user_id: user.id,
        code: trimmedCode,
        name: trimmedName,
        colour: colour || '#3b82f6', // Default to blue if no colour provided
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating module:', insertError)
      return NextResponse.json(
        { error: 'Failed to create module' },
        { status: 500 }
      )
    }

    return NextResponse.json(newModule, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
