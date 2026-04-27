import * as pdfjsLib from 'pdfjs-dist'

// Use the worker file copied to /public by next.config.mjs at startup.
// Serving it locally avoids CDN 404s, CORS issues, and Next.js .mjs bundling
// problems that occur when loading workers from an external URL.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
}

/**
 * Extract all text content from a PDF file
 * @param file - PDF file as Blob or File
 * @returns Extracted text as a single string, or null if no text found
 */
export async function extractPdfText(file: Blob): Promise<string | null> {
  try {
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const textParts: string[] = []

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      if (pageText.trim()) {
        textParts.push(pageText)
      }
    }

    const fullText = textParts.join('\n\n').trim()

    // Return null if no text was extracted (image-only PDF)
    if (!fullText || fullText.length === 0) {
      return null
    }

    return fullText
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

/**
 * Check if a PDF file contains extractable text
 * @param file - PDF file as Blob or File
 * @returns true if text is found, false otherwise
 */
export async function hasPdfText(file: Blob): Promise<boolean> {
  const text = await extractPdfText(file)
  return text !== null && text.length > 0
}
