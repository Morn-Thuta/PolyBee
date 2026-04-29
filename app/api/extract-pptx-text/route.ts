import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

/**
 * POST /api/extract-pptx-text
 * Extracts text from a PPTX file stored in Supabase Storage.
 *
 * Implementation: Downloads the file via service role key, then reads it as a
 * ZIP archive (PPTX = ZIP + XML) using JSZip. Iterates slide XMLs and strips
 * tags to return plain text. Pure JavaScript — no native modules, no pdfjs
 * worker, works reliably in Vercel serverless (Node.js 22+/24).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

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

    // Convert Blob → ArrayBuffer → Buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse the PPTX file (ZIP archive containing XML slide files)
    const text = await extractPptxText(buffer)

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ text: null })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error('Error extracting PPTX text:', error)
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}

/**
 * Extract plain text from a PPTX buffer.
 * PPTX format: ZIP archive with slide XML files at ppt/slides/slide*.xml
 * Text content lives in <a:t> elements within those XML files.
 */
async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer)

  // Collect slide file names and sort them numerically
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] ?? '0', 10)
      const numB = parseInt(b.match(/\d+/)?.[0] ?? '0', 10)
      return numA - numB
    })

  if (slideNames.length === 0) {
    return ''
  }

  const slideParts: string[] = []

  for (const slideName of slideNames) {
    const xml = await zip.files[slideName].async('text')

    // Extract all text runs: <a:t>...</a:t>
    const textRuns = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
      .map((m) => m[1].trim())
      .filter(Boolean)

    if (textRuns.length > 0) {
      slideParts.push(textRuns.join(' '))
    }
  }

  return slideParts.join('\n\n')
}
