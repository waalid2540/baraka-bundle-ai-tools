// BarakahTool Premium PDF Generation Service
// Clean PDF Documents with Safe Character Support

import jsPDF from 'jspdf'
import { PDFTheme, getTheme } from './pdfTemplates'

// PDF Configuration
const PDF_CONFIG = {
  orientation: 'portrait' as const,
  unit: 'mm' as const,
  format: 'a4' as const,
  putOnlyUsedFonts: true,
  compress: true
}

class PDFService {
  private doc: jsPDF | null = null

  // Initialize new PDF document
  private initDocument(): jsPDF {
    this.doc = new jsPDF(PDF_CONFIG)
    return this.doc
  }

  // Convert hex to RGB
  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  // Add Clean Themed Islamic Border
  private addThemedBorder(doc: jsPDF, theme: PDFTheme): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    const primaryColor = this.hexToRgb(theme.primary)
    const secondaryColor = this.hexToRgb(theme.secondary)
    const accentColor = this.hexToRgb(theme.accent)
    
    // Triple border design
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(3)
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
    
    doc.setDrawColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.setLineWidth(1.5)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)
    
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(0.8)
    doc.rect(16, 16, pageWidth - 32, pageHeight - 32)
    
    // Corner decorations
    const corners = [
      { x: 10, y: 10 },
      { x: pageWidth - 10, y: 10 },
      { x: 10, y: pageHeight - 10 },
      { x: pageWidth - 10, y: pageHeight - 10 }
    ]
    
    corners.forEach(corner => {
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
      doc.circle(corner.x, corner.y, 4, 'F')
      doc.setFillColor(255, 255, 255)
      doc.circle(corner.x, corner.y, 2, 'F')
    })
    
    // Top decoration
    doc.setFontSize(12)
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('*** ISLAMIC DESIGN ***', pageWidth / 2, 20, { align: 'center' })
  }

  // Add Clean Header
  private addThemedHeader(doc: jsPDF, theme: PDFTheme, title: string, subtitle?: string): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const primaryColor = this.hexToRgb(theme.primary)
    const accentColor = this.hexToRgb(theme.accent)
    
    // Title with shadow effect
    doc.setFontSize(24)
    doc.setTextColor(primaryColor.r - 30, primaryColor.g - 30, primaryColor.b - 30)
    doc.text(title, pageWidth / 2 + 0.5, 38.5, { align: 'center' })
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text(title, pageWidth / 2, 38, { align: 'center' })
    
    // Subtitle
    if (subtitle) {
      doc.setFontSize(12)
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
      doc.text(subtitle, pageWidth / 2, 48, { align: 'center' })
    }
    
    // Decorative line
    const lineY = 54
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(1)
    doc.line(40, lineY, pageWidth - 40, lineY)
    
    // Decorative elements
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    doc.circle(35, lineY, 2, 'F')
    doc.circle(pageWidth - 35, lineY, 2, 'F')
    doc.circle(pageWidth / 2, lineY, 2.5, 'F')
  }

  // Add Arabic text safely
  private addArabicText(doc: jsPDF, text: string, x: number, y: number, options?: any): void {
    doc.setFontSize(options?.fontSize || 18)
    
    // Clean the text and display it properly
    const cleanText = text.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]/g, '')
    
    if (cleanText.trim()) {
      doc.text(cleanText, x, y, { 
        ...options, 
        align: options?.align || 'right'
      })
    } else {
      // Fallback if Arabic text has issues
      doc.text('[Arabic Dua Text - Please refer to authentic Islamic sources]', x, y, { 
        ...options, 
        align: options?.align || 'center'
      })
    }
  }

  // Generate Clean Themed Dua PDF
  async generateDuaPDF(duaData: {
    name: string
    situation: string
    arabicText: string
    translation: string
    language: string
    theme?: string
  }): Promise<Blob> {
    const doc = this.initDocument()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Get selected theme
    const theme = getTheme(duaData.theme || 'royalGold')
    
    // Apply theme colors
    const primaryColor = this.hexToRgb(theme.primary)
    const secondaryColor = this.hexToRgb(theme.secondary)
    const accentColor = this.hexToRgb(theme.accent)
    const textColor = this.hexToRgb(theme.text)
    const bgColor = this.hexToRgb(theme.background)
    
    // Add themed border and header
    this.addThemedBorder(doc, theme)
    this.addThemedHeader(doc, theme, 'Sacred Islamic Dua', `Blessed supplication for ${duaData.name}`)
    
    let yPosition = 70
    
    // Situation section
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    doc.roundedRect(20, yPosition - 5, pageWidth - 40, 25, 3, 3, 'FD')
    doc.setFontSize(11)
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    doc.setFont('helvetica', 'bold')
    doc.text('YOUR REQUEST:', 25, yPosition + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const situationLines = doc.splitTextToSize(duaData.situation, pageWidth - 50)
    situationLines.forEach((line: string, index: number) => {
      doc.text(line, 25, yPosition + 10 + (index * 5))
    })
    yPosition += 35

    // Arabic section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('*** BLESSED ARABIC SUPPLICATION ***', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
    
    // Arabic text container
    const arabicHeight = 50
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    doc.setLineWidth(1.5)
    doc.roundedRect(20, yPosition, pageWidth - 40, arabicHeight, 5, 5, 'FD')
    
    // Arabic text
    doc.setFontSize(20)
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    this.addArabicText(doc, duaData.arabicText, pageWidth - 30, yPosition + 25, {
      fontSize: 20,
      maxWidth: pageWidth - 60,
      align: 'right'
    })
    yPosition += arabicHeight + 20

    // Translation section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.text(`*** ${duaData.language.toUpperCase()} TRANSLATION ***`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
    
    // Translation text
    doc.setFontSize(13)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    const translationText = `"${duaData.translation}"`
    const translationLines = doc.splitTextToSize(translationText, pageWidth - 40)
    translationLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 7
    })
    yPosition += 15

    // Spiritual guidance
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(0.8)
    doc.line(30, yPosition, pageWidth - 30, yPosition)
    yPosition += 12
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('SPIRITUAL GUIDANCE', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10
    
    const guidance = [
      'Crafted from authentic Quranic and Prophetic traditions',
      'Recite with complete sincerity and trust in Allah',
      'Best times: Before Fajr, between Maghrib-Isha, while fasting',
      'Repeat 3, 7, or 33 times for increased blessing'
    ]
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    guidance.forEach(line => {
      doc.text(`• ${line}`, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 6
    })
    
    // Decorative separator
    yPosition += 10
    doc.setFontSize(14)
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('* * *', pageWidth / 2, yPosition, { align: 'center' })

    // Footer
    const footerY = pageHeight - 25
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(0.8)
    doc.line(25, footerY, pageWidth - 25, footerY)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('*** BarakahTool Premium ***', pageWidth / 2, footerY + 8, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    doc.text(`Premium Islamic Digital Platform | Theme: ${theme.name}`, pageWidth / 2, footerY + 15, { align: 'center' })
    
    return doc.output('blob')
  }

  // Download PDF
  downloadPDF(blob: Blob, filename: string): void {
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

export const pdfService = new PDFService()
export default pdfService