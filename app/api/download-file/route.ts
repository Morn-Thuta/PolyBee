import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
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

    const { storagePath } = await request.json()

    if (!storagePath) {
      return NextResponse.json(
        { error: 'No storage path provided' },
        { status: 400 }
      )
    }

    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .download(storagePath)

    if (error || !data) {
      console.error('Download error:', error)
      return NextResponse.json(
        { error: error?.message || 'Download failed' },
        { status: 500 }
      )
    }

    // Return the file as a blob
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${storagePath.split('/').pop()}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
