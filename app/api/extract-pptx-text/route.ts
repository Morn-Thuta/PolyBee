import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseOfficeAsync } from 'officeparser'
import * as os from 'os'
import * as path from 'path'
import * as fs from 'fs/promises'

/**
 * POST /api/extract-pptx-text
 * Extracts text from a PDF or PPTX file stored in Supabase Storage.
 * Downloads the file using the service role key (bypasses private bucket RLS),
 * writes it to a temp file with the correct extension so officeparser can
 * determine the format, then cleans up.
 */
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

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

    // Parse request body
    const body = await request.json()
    const { storagePath } = body

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid storagePath' },
        { status: 400 }
      )
    }

    // Download file from Supabase Storage using service role key
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('Storage download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download file from storage' },
        { status: 404 }
      )
    }

    // Determine the file extension from the storage path
    const ext = path.extname(storagePath).toLowerCase() || '.pptx'

    // Write to a temp file with the correct extension so officeparser
    // can unambiguously identify the file format
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    tempFilePath = path.join(os.tmpdir(), `polybee_extract_${Date.now()}${ext}`)
    await fs.writeFile(tempFilePath, buffer)

    // Extract text using officeparser (supports PDF, PPTX, DOCX, XLSX, etc.)
    const text = await parseOfficeAsync(tempFilePath)

    // Check if text was extracted
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ text: null })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('Error extracting text:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      fs.unlink(tempFilePath).catch(() => {})
    }
  }
}
