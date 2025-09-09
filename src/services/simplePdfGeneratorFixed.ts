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
    
    // Gold header background
    pdf.setFillColor(212, 175, 55) // Gold color
    pdf.rect(0, 0, 210, 40, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BarakahTool - Islamic Dua', 105, 25, { align: 'center' })
    
    let y = 55
    
    // Your request section with background
    pdf.setFillColor(255, 248, 220) // Light yellow
    pdf.rect(15, y - 5, 180, 25, 'F')
    pdf.setDrawColor(212, 175, 55) // Gold border
    pdf.setLineWidth(1)
    pdf.rect(15, y - 5, 180, 25, 'S')
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🤲 Your Request:', 20, y + 5)
    y += 10
    
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    const situationLines = pdf.splitTextToSize(duaData.situation, 170)
    situationLines.forEach((line: string) => {
      pdf.text(line, 20, y)
      y += 6
    })
    
    y += 20
    
    // Arabic pronunciation section (clear text only)
    pdf.setFillColor(255, 255, 255) // White background
    pdf.rect(15, y - 5, 180, 40, 'F')
    pdf.setDrawColor(0, 150, 0) // Green border
    pdf.setLineWidth(2)
    pdf.rect(15, y - 5, 180, 40, 'S')
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 150, 0) // Green
    pdf.text('🕌 Arabic Pronunciation:', 105, y + 8, { align: 'center' })
    y += 15
    
    // Use clear transliteration text
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(25, 25, 112) // Dark blue
    const pronunciation = duaData.transliteration || 'Allahumma barik lana fi ma razaqtana'
    const pronounceLines = pdf.splitTextToSize(pronunciation, 170)
    pronounceLines.forEach((line: string) => {
      pdf.text(line, 105, y, { align: 'center' })
      y += 7
    })
    
    y += 20
    
    // Translation section with pink background
    pdf.setFillColor(255, 240, 245) // Light pink
    pdf.rect(15, y - 5, 180, 30, 'F')
    pdf.setDrawColor(219, 112, 147)
    pdf.setLineWidth(1)
    pdf.rect(15, y - 5, 180, 30, 'S')
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(219, 112, 147) // Pink
    pdf.text(`💖 ${duaData.language} Translation:`, 105, y + 8, { align: 'center' })
    y += 15
    
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(0, 0, 0)
    const translationLines = pdf.splitTextToSize(`"${duaData.translation}"`, 170)
    translationLines.forEach((line: string) => {
      pdf.text(line, 105, y, { align: 'center' })
      y += 7
    })
    
    // Footer with gold background
    pdf.setFillColor(212, 175, 55) // Gold
    pdf.rect(0, 270, 210, 27, 'F')
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.text('🌟 BarakahTool - Islamic Digital Platform 🌟', 105, 285, { align: 'center' })
    
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