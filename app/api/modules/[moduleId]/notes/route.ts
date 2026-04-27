import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Validation schema
const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  style: z.enum(['notion-friendly', 'deep-dive', 'quick-summary', 'custom']),
  source_file_path: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { moduleId } = params
    const mockUserId = '00000000-0000-0000-0000-000000000001'

    // Verify module exists
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('id')
      .eq('id', moduleId)
      .eq('user_id', mockUserId)
      .single()

    if (moduleError || !module) {
      return NextResponse.json(
        { error: 'Module not found or access denied' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = CreateNoteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { title, content, style, source_file_path } = validation.data

    // Insert note into database
    const { data: note, error: insertError } = await supabase
      .from('notes')
      .insert({
        user_id: mockUserId,
        module_id: moduleId,
        title,
        content,
        style,
        source_file_path: source_file_path || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting note:', insertError)
      return NextResponse.json(
        { error: 'Failed to save note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/modules/[moduleId]/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { moduleId } = params
    const mockUserId = '00000000-0000-0000-0000-000000000001'

    // Fetch notes for the module
    const { data: notes, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', mockUserId)
      .order('updated_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching notes:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error in GET /api/modules/[moduleId]/notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
