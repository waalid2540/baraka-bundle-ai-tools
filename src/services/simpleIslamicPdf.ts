// Simple, Clean Islamic PDF Generator
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

class SimpleIslamicPdf {
  async generateSimplePdf(duaData: DuaData): Promise<Blob> {
    // Create a standard A4 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20

    // Simple title
    pdf.setFontSize(20)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Islamic Du\'a', pageWidth / 2, 30, { align: 'center' })

    // Arabic text
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    const arabicLines = pdf.splitTextToSize(duaData.arabicText, pageWidth - 2 * margin)
    pdf.text(arabicLines, pageWidth / 2, 60, { align: 'center' })

    // Translation
    pdf.setFontSize(12)
    pdf.setTextColor(50, 50, 50)
    const translationLines = pdf.splitTextToSize(duaData.translation, pageWidth - 2 * margin)
    pdf.text(translationLines, margin, 100)

    return pdf.output('blob')
  }

  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const simpleIslamicPdf = new SimpleIslamicPdf()
export default simpleIslamicPdf