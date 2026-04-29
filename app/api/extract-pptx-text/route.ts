import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import JSZip from 'jszip'

/**
 * POST /api/extract-pptx-text
 * Extracts text from a PDF or PPTX file stored in Supabase Storage.
 *
 * Download strategy: generate a short-lived signed URL and fetch the file
 * directly with the global fetch() API into an ArrayBuffer.
 *
 * File-type detection: read the first 4 magic bytes.
 *   - %PDF (0x25 0x50 0x44 0x46) → PDF  → pdfjs-dist (no worker, main thread)
 *   - PK\x03\x04 (0x50 0x4B 0x03 0x04) → ZIP/PPTX → JSZip + <a:t> parsing
 *
 * Both paths are pure JavaScript with zero native deps.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase URL' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Missing service role key' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
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

    console.log('Extracting text from:', storagePath)

    // Step 1: generate a signed URL (60 s)
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

    // Step 2: fetch raw bytes
    const fileRes = await fetch(signedData.signedUrl)
    if (!fileRes.ok) {
      console.error('File fetch failed:', fileRes.status, fileRes.statusText)
      return NextResponse.json(
        { error: `Failed to download file (HTTP ${fileRes.status})` },
        { status: 500 }
      )
    }

    const arrayBuffer = await fileRes.arrayBuffer()
    console.log('File download ok, size:', arrayBuffer.byteLength, 'bytes')

    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Downloaded file is empty' }, { status: 500 })
    }

    // Step 3: detect file type by magic bytes
    const header = new Uint8Array(arrayBuffer, 0, 4)
    const isPDF =
      header[0] === 0x25 && // %
      header[1] === 0x50 && // P
      header[2] === 0x44 && // D
      header[3] === 0x46    // F

    console.log('Detected file type:', isPDF ? 'PDF' : 'PPTX/ZIP')

    // Step 4: extract text
    const text = isPDF
      ? await extractPdfText(arrayBuffer)
      : await extractPptxText(arrayBuffer)

    console.log('Extracted text length:', text?.length ?? 0)

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ text: null })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('Error extracting file text:', msg)
    if (stack) console.error('Stack:', stack)
    
    // Return more detailed error message for debugging
    return NextResponse.json(
      { 
        error: 'Failed to extract text from file',
        details: msg,
        hint: 'Check Vercel logs for more details'
      },
      { status: 500 }
    )
  }
}

/**
 * Extract plain text from a PDF ArrayBuffer using pdfjs-dist.
 * Runs entirely in the main thread (no worker) — safe for Node.js serverless.
 */
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  // Dynamic import so webpack can tree-shake it if unused,
  // and to defer the heavy module load until needed.
  const pdfjsLib = await import('pdfjs-dist')

  // Disable the worker — pdfjs falls back to a synchronous GenericWorker
  // when workerSrc is empty, which works fine in Node.js serverless.
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''

  let pdf: Awaited<ReturnType<typeof pdfjsLib.getDocument>>['promise'] extends Promise<infer T> ? T : never

  try {
    pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      // Suppress password/encryption errors gracefully
      verbosity: 0,
    }).promise
  } catch (err) {
    console.error('pdfjs getDocument failed:', err)
    throw new Error(`Failed to parse PDF: ${err instanceof Error ? err.message : String(err)}`)
  }

  console.log('PDF pages:', pdf.numPages)

  const pageParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim()
    if (pageText) pageParts.push(pageText)
  }

  return pageParts.join('\n\n')
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
    throw new Error(
      `Not a valid ZIP/PPTX file: ${zipErr instanceof Error ? zipErr.message : String(zipErr)}`
    )
  }

  const allFiles = Object.keys(zip.files)
  console.log('ZIP contains', allFiles.length, 'entries')

  const slideNames = allFiles
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0], 10)
      const numB = parseInt(b.match(/\d+/)![0], 10)
      return numA - numB
    })

  console.log('Slide files found:', slideNames.length, slideNames)

  if (slideNames.length === 0) return ''

  const slideParts: string[] = []

  for (const name of slideNames) {
    const xml = await zip.files[name].async('text')
    const runs = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)]
      .map((m) => m[1].trim())
      .filter(Boolean)
    if (runs.length > 0) {
      slideParts.push(runs.join(' '))
    }
  }

  return slideParts.join('\n\n')
}
