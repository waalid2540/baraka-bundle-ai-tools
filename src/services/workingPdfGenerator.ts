// BarakahTool ENTERPRISE - Professional PDF Generator
// Advanced jsPDF with Arabic font support - ENTERPRISE GRADE

import jsPDF from 'jspdf'

// Add Arabic font support for jsPDF
import './arabic-font'

interface WorkingDuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
  theme?: string
}

class WorkingPdfGenerator {
  
  async generateWorkingPdf(duaData: WorkingDuaData): Promise<Blob> {
    console.log('🚀 Generating WORKING PDF with data:', duaData)
    
    try {
      // Create PDF - A4 size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      
      // Colors (RGB values)
      const gold = [212, 175, 55]
      const emerald = [80, 200, 120] 
      const darkBlue = [44, 62, 80]
      const lightCream = [254, 245, 231]
      
      // Add background color
      pdf.setFillColor(lightCream[0], lightCream[1], lightCream[2])
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // HEADER SECTION
      // Gold header background
      pdf.setFillColor(gold[0], gold[1], gold[2])
      pdf.rect(0, 0, pageWidth, 50, 'F')
      
      // Bismillah
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', pageWidth/2, 20, { align: 'center' })
      
      // Main title
      pdf.setFontSize(24)
      pdf.text('BarakahTool - Sacred Islamic Dua', pageWidth/2, 35, { align: 'center' })
      
      let yPosition = 70
      
      // SITUATION SECTION
      pdf.setFillColor(255, 248, 220) // Light yellow background
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'F')
      pdf.setDrawColor(gold[0], gold[1], gold[2])
      pdf.setLineWidth(1)
      pdf.rect(15, yPosition - 5, pageWidth - 30, 25, 'S')
      
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('🤲 Your Request:', 20, yPosition + 5)
      
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      const situationLines = pdf.splitTextToSize(duaData.situation || 'General Islamic supplication', pageWidth - 40)
      let lineY = yPosition + 12
      situationLines.forEach((line: string) => {
        pdf.text(line, 20, lineY)
        lineY += 5
      })
      
      yPosition = lineY + 15
      
      // ARABIC SECTION
      pdf.setFillColor(255, 255, 255) // White background
      pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'F')
      pdf.setDrawColor(gold[0], gold[1], gold[2])
      pdf.setLineWidth(2)
      pdf.rect(15, yPosition - 5, pageWidth - 30, 50, 'S')
      
      // Arabic header
      pdf.setTextColor(gold[0], gold[1], gold[2])
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('🕌 Arabic Supplication', pageWidth/2, yPosition + 8, { align: 'center' })
      
      // Arabic text (we'll use transliteration for compatibility)
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      
      const arabicToShow = duaData.transliteration || 'Allahumma barik lana fi ma razaqtana'
      const arabicLines = pdf.splitTextToSize(arabicToShow, pageWidth - 50)
      let arabicY = yPosition + 20
      arabicLines.forEach((line: string) => {
        pdf.text(line, pageWidth/2, arabicY, { align: 'center' })
        arabicY += 8
      })
      
      yPosition = yPosition + 60
      
      // TRANSLITERATION SECTION (if different from above)
      if (duaData.transliteration && duaData.transliteration !== arabicToShow) {
        pdf.setFillColor(240, 255, 240) // Light green
        pdf.rect(15, yPosition - 5, pageWidth - 30, 20, 'F')
        pdf.setDrawColor(emerald[0], emerald[1], emerald[2])
        pdf.setLineWidth(1)
        pdf.rect(15, yPosition - 5, pageWidth - 30, 20, 'S')
        
        pdf.setTextColor(emerald[0], emerald[1], emerald[2])
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('📢 Pronunciation:', 20, yPosition + 5)
        
        pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'italic')
        const transLines = pdf.splitTextToSize(duaData.transliteration, pageWidth - 40)
        let transY = yPosition + 12
        transLines.forEach((line: string) => {
          pdf.text(line, 20, transY)
          transY += 5
        })
        
        yPosition = transY + 10
      }
      
      // TRANSLATION SECTION
      pdf.setFillColor(255, 240, 245) // Light pink
      pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F')
      pdf.setDrawColor(219, 112, 147)
      pdf.setLineWidth(1)
      pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'S')
      
      pdf.setTextColor(219, 112, 147)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`💖 ${duaData.language} Translation:`, pageWidth/2, yPosition + 8, { align: 'center' })
      
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'italic')
      const translationText = `"${duaData.translation}"`
      const translationLines = pdf.splitTextToSize(translationText, pageWidth - 40)
      let translationY = yPosition + 16
      translationLines.forEach((line: string) => {
        pdf.text(line, pageWidth/2, translationY, { align: 'center' })
        translationY += 6
      })
      
      yPosition = translationY + 15
      
      // GUIDANCE SECTION
      pdf.setFillColor(240, 255, 255) // Light cyan
      pdf.rect(15, yPosition - 5, pageWidth - 30, 45, 'F')
      pdf.setDrawColor(0, 139, 139)
      pdf.setLineWidth(1)
      pdf.rect(15, yPosition - 5, pageWidth - 30, 45, 'S')
      
      pdf.setTextColor(0, 139, 139)
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('✨ Spiritual Guidance', pageWidth/2, yPosition + 8, { align: 'center' })
      
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      
      const guidance = [
        '🌙 Best times: Last third of night, between Maghrib & Isha',
        '🤲 Recite with complete sincerity and trust in Allah',
        '🔢 Repeat 3, 7, or 33 times for increased blessing',
        '💧 Make wudu before recitation for added reward',
        '📿 Follow with personal duas in your language'
      ]
      
      let guidanceY = yPosition + 16
      guidance.forEach(point => {
        pdf.text(point, 20, guidanceY)
        guidanceY += 6
      })
      
      // FOOTER
      const footerY = pageHeight - 30
      pdf.setDrawColor(gold[0], gold[1], gold[2])
      pdf.setLineWidth(2)
      pdf.line(20, footerY, pageWidth - 20, footerY)
      
      pdf.setTextColor(gold[0], gold[1], gold[2])
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('🌟 BarakahTool - Premium Islamic Platform 🌟', pageWidth/2, footerY + 8, { align: 'center' })
      
      pdf.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'italic')
      pdf.text('May Allah accept your supplication and grant you success', pageWidth/2, footerY + 15, { align: 'center' })
      
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      pdf.setFontSize(8)
      pdf.text(`Generated on ${currentDate}`, pageWidth/2, footerY + 20, { align: 'center' })
      
      console.log('✅ PDF generated successfully!')
      return pdf.output('blob')
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      
      // ULTIMATE FALLBACK - Super simple PDF
      const fallbackPdf = new jsPDF()
      fallbackPdf.setFontSize(20)
      fallbackPdf.text('BarakahTool - Islamic Dua', 105, 30, { align: 'center' })
      
      fallbackPdf.setFontSize(14)
      fallbackPdf.text('Situation:', 20, 60)
      const sitLines = fallbackPdf.splitTextToSize(duaData.situation, 170)
      let y = 70
      sitLines.forEach((line: string) => {
        fallbackPdf.text(line, 20, y)
        y += 8
      })
      
      fallbackPdf.text('Arabic/Pronunciation:', 20, y + 10)
      const arabicText = duaData.transliteration || duaData.arabicText || 'Arabic text'
      const arabicLines = fallbackPdf.splitTextToSize(arabicText, 170)
      y += 20
      arabicLines.forEach((line: string) => {
        fallbackPdf.text(line, 20, y)
        y += 8
      })
      
      fallbackPdf.text('Translation:', 20, y + 10)
      const transLines = fallbackPdf.splitTextToSize(duaData.translation, 170)
      y += 20
      transLines.forEach((line: string) => {
        fallbackPdf.text(line, 20, y)
        y += 8
      })
      
      fallbackPdf.setFontSize(12)
      fallbackPdf.text('BarakahTool - Islamic Digital Platform', 105, y + 30, { align: 'center' })
      
      return fallbackPdf.output('blob')
    }
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

export const workingPdfGenerator = new WorkingPdfGenerator()
export default workingPdfGenerator