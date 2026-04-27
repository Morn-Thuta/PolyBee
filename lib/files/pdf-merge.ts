import { PDFDocument } from 'pdf-lib'

/**
 * Merge multiple PDF files into a single PDF
 * @param fileBlobs - Array of PDF file blobs in the order they should be merged
 * @returns A blob containing the merged PDF
 */
export async function mergePDFs(fileBlobs: Blob[]): Promise<Blob> {
  if (fileBlobs.length === 0) {
    throw new Error('No files provided for merging')
  }

  if (fileBlobs.length === 1) {
    throw new Error('At least 2 files are required for merging')
  }

  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create()

    // Process each PDF file
    for (let i = 0; i < fileBlobs.length; i++) {
      const blob = fileBlobs[i]
      
      try {
        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer()
        
        // Load the PDF
        const pdf = await PDFDocument.load(arrayBuffer)
        
        // Copy all pages from this PDF
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        // Add each page to the merged document
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page)
        })
      } catch (error) {
        throw new Error(`Failed to process file ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save()
    
    // Return as a Blob
    return new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' })
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to merge PDFs')
  }
}

/**
 * Get the number of pages in a PDF file
 * @param fileBlob - PDF file blob
 * @returns Number of pages
 */
export async function getPdfPageCount(fileBlob: Blob): Promise<number> {
  try {
    const arrayBuffer = await fileBlob.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    return pdf.getPageCount()
  } catch (error) {
    console.error('Error getting PDF page count:', error)
    return 0
  }
}
