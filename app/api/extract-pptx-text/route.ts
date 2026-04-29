import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

/**
 * POST /api/extract-pptx-text
 * Extracts text from a PPTX file stored in Supabase Storage.
 *
 * Download strategy: generate a short-lived signed URL and fetch the file
 * directly with the global fetch() API, reading it straight into an
 * ArrayBuffer. This avoids the Blob → Buffer conversion that is unreliable
 * in Node.js 24 serverless runtimes.
 *
 * Parsing strategy: PPTX = ZIP archive. JSZip reads the archive, and we
 * pull text from every ppt/slides/slideN.xml file by matching <a:t> elements.
 * Pure JavaScript, zero native deps.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await request.json()
    const { storagePath } = body

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid storagePath' },
        { status: 400 }
      )
    }

    // Step 1: generate a signed URL (60 s) — no Blob download, no conversion
    const { data: signedData, error: signedError } = await supabase.storage
      .from('uploads')
      .createSignedUrl(storagePath, 60)

    if (signedError || !signedData?.signedUrl) {
      console.error('Failed to create signed URL:', signedError)
      return NextResponse.json(
        { error: 'Failed to access file in storage' },
        { status: 500 }
      )
    }

    // Step 2: fetch the file as a raw ArrayBuffer — most reliable for binary files
    const fileRes = await fetch(signedData.signedUrl)
    if (!fileRes.ok) {
      console.error('File fetch failed:', fileRes.status, fileRes.statusText)
      return NextResponse.json(
        { error: `Failed to download file (HTTP ${fileRes.status})` },
        { status: 500 }
      )
    }

    const arrayBuffer = await fileRes.arrayBuffer()
    console.log('PPTX download ok, size:', arrayBuffer.byteLength, 'bytes')

    if (arrayBuffer.byteLength === 0) {
      console.error('Downloaded file is empty')
      return NextResponse.json(
        { error: 'Downloaded file is empty' },
        { status: 500 }
      )
    }

    // Step 3: extract text from the PPTX ZIP archive
    const text = await extractPptxText(arrayBuffer)
    console.log('Extracted text length:', text.length)

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ text: null })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('Error extracting PPTX text:', msg)
    if (stack) console.error('Stack:', stack)
    return NextResponse.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    )
  }
}

/**
 * Extract plain text from a raw PPTX ArrayBuffer.
 * Iterates every ppt/slides/slideN.xml in the ZIP, strips XML tags,
 * and joins all <a:t> text runs.
 */
async function extractPptxText(arrayBuffer: ArrayBuffer): Promise<string> {
  let zip: JSZip

  try {
    zip = await JSZip.loadAsync(arrayBuffer)
  } catch (zipErr) {
    console.error('JSZip.loadAsync failed:', zipErr)
    throw new Error(`Not a valid ZIP/PPTX file: ${zipErr instanceof Error ? zipErr.message : String(zipErr)}`)
  }

  const allFiles = Object.keys(zip.files)
  console.log('ZIP contains', allFiles.length, 'entries')

  // Slide XMLs are at ppt/slides/slide1.xml, slide2.xml, …
  const slideNames = allFiles
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0], 10)
      const numB = parseInt(b.match(/\d+/)![0], 10)
      return numA - numB
    })

  console.log('Slide files found:', slideNames.length, slideNames)

  if (slideNames.length === 0) {
    // Not found — might be an older PPTX or a different structure
    return ''
  }

  const slideParts: string[] = []

  for (const name of slideNames) {
    const xml = await zip.files[name].async('text')
    // <a:t> elements hold the actual text runs in DrawingML
    const runs = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
      .map((m) => m[1].trim())
      .filter(Boolean)
    if (runs.length > 0) {
      slideParts.push(runs.join(' '))
    }
  }

  return slideParts.join('\n\n')
}
