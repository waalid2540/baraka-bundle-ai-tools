// Simple PDF Generator That Actually Works
// No fancy stuff - just clean, working PDFs

import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
}

class SimplePdfGeneratorFixed {
  
  async generatePdf(duaData: DuaData): Promise<Blob> {
    const pdf = new jsPDF()
    
    // Simple, clean header
    pdf.setFillColor(40, 40, 40)
    pdf.rect(0, 0, 210, 35, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BarakahTool - Islamic Dua', 105, 22, { align: 'center' })
    
    let y = 50
    
    // Your request
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Your Request:', 20, y)
    y += 8
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const situationLines = pdf.splitTextToSize(duaData.situation, 170)
    situationLines.forEach((line: string) => {
      pdf.text(line, 20, y)
      y += 6
    })
    
    y += 15
    
    // Arabic pronunciation
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 100, 0)
    pdf.text('Arabic Pronunciation:', 20, y)
    y += 8
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    const pronunciation = duaData.transliteration || 'Allahumma barik lana'
    const pronounceLines = pdf.splitTextToSize(pronunciation, 170)
    pronounceLines.forEach((line: string) => {
      pdf.text(line, 105, y, { align: 'center' })
      y += 8
    })
    
    y += 15
    
    // Translation
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 150)
    pdf.text(`${duaData.language} Translation:`, 20, y)
    y += 8
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const translationLines = pdf.splitTextToSize(`"${duaData.translation}"`, 170)
    translationLines.forEach((line: string) => {
      pdf.text(line, 20, y)
      y += 7
    })
    
    // Footer
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BarakahTool - Islamic Digital Platform', 105, 270, { align: 'center' })
    
    return pdf.output('blob')
  }
  
  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const simplePdfGeneratorFixed = new SimplePdfGeneratorFixed()
export default simplePdfGeneratorFixed