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

  // Add STUNNING Professional Islamic Border
  private addThemedBorder(doc: jsPDF, theme: PDFTheme): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    const primaryColor = this.hexToRgb(theme.primary)
    const secondaryColor = this.hexToRgb(theme.secondary)
    const accentColor = this.hexToRgb(theme.accent)
    
    // STUNNING Multi-layered border design
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(4)
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10)
    
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(2)
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
    
    doc.setDrawColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.setLineWidth(1)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)
    
    // BEAUTIFUL Corner decorations with Islamic patterns
    const corners = [
      { x: 15, y: 15 },
      { x: pageWidth - 15, y: 15 },
      { x: 15, y: pageHeight - 15 },
      { x: pageWidth - 15, y: pageHeight - 15 }
    ]
    
    corners.forEach(corner => {
      // Outer circle
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
      doc.circle(corner.x, corner.y, 6, 'F')
      // Middle circle
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
      doc.circle(corner.x, corner.y, 4, 'F')
      // Inner star
      doc.setFillColor(255, 255, 255)
      doc.circle(corner.x, corner.y, 2, 'F')
    })
    
    // ELEGANT Side decorations
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(1)
    
    // Top side decorative lines
    for (let i = 40; i < pageWidth - 40; i += 20) {
      doc.line(i, 8, i + 10, 8)
    }
    
    // Bottom side decorative lines  
    for (let i = 40; i < pageWidth - 40; i += 20) {
      doc.line(i, pageHeight - 8, i + 10, pageHeight - 8)
    }
    
    // Top Islamic calligraphy decoration
    doc.setFontSize(16)
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('﷽', pageWidth / 2, 18, { align: 'center' })
  }

  // Add STUNNING Professional Header
  private addThemedHeader(doc: jsPDF, theme: PDFTheme, title: string, subtitle?: string): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const primaryColor = this.hexToRgb(theme.primary)
    const accentColor = this.hexToRgb(theme.accent)
    const secondaryColor = this.hexToRgb(theme.secondary)
    
    // BEAUTIFUL Background gradient effect
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b, 0.1)
    doc.roundedRect(20, 25, pageWidth - 40, 35, 5, 5, 'F')
    
    // Main title with STUNNING shadow effect
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    // Shadow
    doc.setTextColor(primaryColor.r - 40, primaryColor.g - 40, primaryColor.b - 40, 0.3)
    doc.text(title, pageWidth / 2 + 1, 42.5, { align: 'center' })
    // Main text
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text(title, pageWidth / 2, 42, { align: 'center' })
    
    // Elegant subtitle
    if (subtitle) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
      doc.text(subtitle, pageWidth / 2, 52, { align: 'center' })
    }
    
    // STUNNING Decorative line with ornaments
    const lineY = 65
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(2)
    doc.line(30, lineY, pageWidth - 30, lineY)
    
    // Beautiful ornamental elements
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    // Left ornament
    doc.circle(25, lineY, 3, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.circle(25, lineY, 1.5, 'F')
    
    // Right ornament  
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    doc.circle(pageWidth - 25, lineY, 3, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.circle(pageWidth - 25, lineY, 1.5, 'F')
    
    // Center ornament
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    doc.circle(pageWidth / 2, lineY, 4, 'F')
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, lineY, 2, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.circle(pageWidth / 2, lineY, 1, 'F')
    
    // Additional decorative stars
    doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.circle(pageWidth / 2 - 25, lineY, 1.5, 'F')
    doc.circle(pageWidth / 2 + 25, lineY, 1.5, 'F')
  }

  // Note: Arabic text helpers removed - using transliteration approach for better PDF compatibility

  // Generate Clean Themed Dua PDF
  async generateDuaPDF(duaData: {
    name: string
    situation: string
    arabicText: string
    transliteration?: string
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
    
    // BEAUTIFUL ARABIC TEXT - Direct rendering with proper fonts
    if (duaData.arabicText && duaData.arabicText.trim()) {
      // Main Arabic Text with multiple font fallbacks
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(textColor.r, textColor.g, textColor.b)
      
      // Try to render Arabic text directly with better formatting
      try {
        // Split Arabic text into manageable lines
        const arabicLines = doc.splitTextToSize(duaData.arabicText, pageWidth - 80)
        let lineY = yPosition + 30
        
        arabicLines.forEach((line: string) => {
          // Center each line of Arabic text
          doc.text(line.trim(), pageWidth / 2, lineY, { align: 'center' })
          lineY += 12
        })
        
        yPosition = lineY + 20
        
        // Add beautiful decorative separator
        doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
        doc.setLineWidth(2)
        doc.line(pageWidth / 2 - 50, yPosition, pageWidth / 2 + 50, yPosition)
        yPosition += 15
        
      } catch (error) {
        // If Arabic rendering fails, show elegant placeholder
        doc.setFontSize(20)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
        doc.text('﷽', pageWidth / 2, yPosition + 20, { align: 'center' })
        doc.setFontSize(16)
        doc.text('[Arabic Du\'a - Authentic Islamic Supplication]', pageWidth / 2, yPosition + 35, { align: 'center' })
        yPosition += 55
      }
      
      // Show transliteration if available
      if (duaData.transliteration && duaData.transliteration.trim()) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
        doc.text('Pronunciation:', pageWidth / 2, yPosition, { align: 'center' })
        yPosition += 8
        
        doc.setFontSize(14)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
        const translitLines = doc.splitTextToSize(duaData.transliteration, pageWidth - 60)
        translitLines.forEach((line: string) => {
          doc.text(line.trim(), pageWidth / 2, yPosition, { align: 'center' })
          yPosition += 7
        })
        yPosition += 10
      }
    } else {
      // Elegant fallback when no Arabic text
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
      doc.text('﷽ Authentic Islamic Du\'a ﷽', pageWidth / 2, yPosition + 25, { align: 'center' })
      yPosition += 45
    }

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

    // STUNNING Professional Footer
    const footerY = pageHeight - 35
    
    // Beautiful footer background
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b, 0.05)
    doc.roundedRect(15, footerY - 5, pageWidth - 30, 25, 3, 3, 'F')
    
    // Decorative top line with ornaments
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(2)
    doc.line(30, footerY, pageWidth - 30, footerY)
    
    // Corner decorations
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    doc.circle(25, footerY, 2, 'F')
    doc.circle(pageWidth - 25, footerY, 2, 'F')
    
    // Premium branding
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('﷽ BarakahTool Premium ﷽', pageWidth / 2, footerY + 10, { align: 'center' })
    
    // Theme and date info
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.text(`Premium Islamic Digital Platform | ${theme.name} Theme | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 18, { align: 'center' })
    
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