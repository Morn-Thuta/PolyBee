import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/signed-url
 * Generates a short-lived signed URL for a private storage object.
 * Used to let the browser download private files (e.g. for PDF text extraction).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { storagePath } = body

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid storagePath' },
        { status: 400 }
      )
    }

    // Create a signed URL that expires in 60 seconds — enough to download once
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUrl(storagePath, 60)

    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: data.signedUrl })
  } catch (error) {
    console.error('Unexpected error in POST /api/signed-url:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
