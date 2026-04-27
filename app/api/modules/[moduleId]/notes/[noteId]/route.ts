import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface RouteContext {
  params: {
    moduleId: string
    noteId: string
  }
}

/**
 * PATCH /api/modules/[moduleId]/notes/[noteId]
 * Updates a note's title and/or content
 */
export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Parse request body
    const body = await request.json()
    const { title, content } = body

    // Validate at least one field is provided
    if (title === undefined && content === undefined) {
      return NextResponse.json(
        { error: 'At least one field (title or content) must be provided' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: { title?: string; content?: string; updated_at?: string } = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) {
      const trimmedTitle = title.trim()
      if (!trimmedTitle) {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
      updates.title = trimmedTitle
    }

    if (content !== undefined) {
      updates.content = content
    }

    // Update the note (RLS ensures user can only update their own notes)
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', params.noteId)
      .eq('module_id', params.moduleId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/modules/[moduleId]/notes/[noteId]
 * Deletes a single note
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  const supabase = createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete the note (RLS ensures user can only delete their own notes)
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', params.noteId)
      .eq('module_id', params.moduleId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting note:', error)
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
