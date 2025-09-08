// BarakahTool Premium PDF Generation Service
// Beautiful Islamic PDF Documents with Multiple Themes & Tashkeel

import jsPDF from 'jspdf'
import { PDFTheme, getTheme, formatArabicWithTashkeel, getTemplateDecorations } from './pdfTemplates'

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

  // Add Powerful Themed Islamic Border
  private addThemedBorder(doc: jsPDF, theme: PDFTheme): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Convert hex colors to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }
    
    const primaryColor = hexToRgb(theme.primary)
    const secondaryColor = hexToRgb(theme.secondary)
    const accentColor = hexToRgb(theme.accent)
    
    // Outer powerful border
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(4)
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12)
    
    // Middle decorative border
    doc.setDrawColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.setLineWidth(2)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
    
    // Inner accent border
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(1)
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28)
    
    // Theme-specific corner decorations
    this.addCornerDecorations(doc, theme, pageWidth, pageHeight)
    
    // Top center Islamic symbol
    doc.setFontSize(18)
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    const symbol = this.getThemeSymbol(theme.name)
    doc.text(symbol, pageWidth / 2, 18, { align: 'center' })
  }

  // Get theme-specific symbol
  private getThemeSymbol(themeName: string): string {
    const symbols: { [key: string]: string } = {
      'Night Prayer': '🌙',
      'Fajr Dawn': '🌅', 
      'Masjid Green': '🕌',
      'Royal Gold': '👑',
      'Rose Garden': '🌹',
      'Ocean Depth': '🌊',
      'Sunset Orange': '🔥',
      'Midnight Black': '⭐'
    }
    return symbols[themeName] || '✨'
  }

  // Add corner decorations based on theme
  private addCornerDecorations(doc: jsPDF, theme: PDFTheme, pageWidth: number, pageHeight: number): void {
    const corners = [
      { x: 8, y: 8 },
      { x: pageWidth - 8, y: 8 },
      { x: 8, y: pageHeight - 8 },
      { x: pageWidth - 8, y: pageHeight - 8 }
    ]
    
    const primaryColor = this.hexToRgb(theme.primary)
    const accentColor = this.hexToRgb(theme.accent)
    
    corners.forEach(corner => {
      if (theme.borderStyle === 'ornate') {
        // Ornate style - multiple circles
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
        doc.circle(corner.x, corner.y, 6, 'F')
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
        doc.circle(corner.x, corner.y, 4, 'F')
        doc.setFillColor(255, 255, 255)
        doc.circle(corner.x, corner.y, 2, 'F')
      } else if (theme.borderStyle === 'modern') {
        // Modern style - geometric squares
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
        doc.rect(corner.x - 3, corner.y - 3, 6, 6, 'F')
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
        doc.circle(corner.x, corner.y, 2, 'F')
      } else {
        // Classic style - simple circles
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
        doc.circle(corner.x, corner.y, 4, 'F')
      }
    })
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

  // Add themed header
  private addThemedHeader(doc: jsPDF, theme: PDFTheme, title: string, subtitle?: string): void {
    const pageWidth = doc.internal.pageSize.getWidth()
    const primaryColor = this.hexToRgb(theme.primary)
    const accentColor = this.hexToRgb(theme.accent)
    
    // Decorative element above title
    doc.setFontSize(20)
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('۞', pageWidth / 2, 32, { align: 'center' })
    
    // Title with shadow effect
    doc.setFontSize(26)
    doc.setTextColor(primaryColor.r - 20, primaryColor.g - 20, primaryColor.b - 20)
    doc.text(title, pageWidth / 2 + 0.5, 43.5, { align: 'center' })
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text(title, pageWidth / 2, 43, { align: 'center' })
    
    // Subtitle
    if (subtitle) {
      doc.setFontSize(12)
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
      doc.text(subtitle, pageWidth / 2, 52, { align: 'center' })
    }
    
    // Decorative line
    const lineY = 58
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(0.8)
    doc.line(50, lineY, pageWidth - 50, lineY)
    
    // Decorative dots
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    doc.circle(45, lineY, 1.5, 'F')
    doc.circle(pageWidth - 45, lineY, 1.5, 'F')
    doc.circle(pageWidth / 2, lineY, 2, 'F')
  }

  // Add Arabic text with proper tashkeel
  private addArabicText(doc: jsPDF, text: string, x: number, y: number, options?: any): void {
    // Format Arabic with proper tashkeel
    const formattedText = formatArabicWithTashkeel(text)
    doc.setFontSize(options?.fontSize || 20)
    doc.text(formattedText, x, y, { 
      ...options, 
      align: options?.align || 'right',
      direction: 'rtl'
    })
  }

  // Generate Powerful Themed Dua PDF
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
    const decorations = getTemplateDecorations(theme)
    
    // Apply theme colors
    const primaryColor = this.hexToRgb(theme.primary)
    const secondaryColor = this.hexToRgb(theme.secondary)
    const accentColor = this.hexToRgb(theme.accent)
    const textColor = this.hexToRgb(theme.text)
    const bgColor = this.hexToRgb(theme.background)
    
    // Add themed border and header
    this.addThemedBorder(doc, theme)
    this.addThemedHeader(doc, theme, '✨ Sacred Islamic Duʿā ✨', `Blessed supplication for ${duaData.name}`)
    
    let yPosition = 75
    
    // Situation section with themed box
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    doc.roundedRect(18, yPosition - 5, pageWidth - 36, 28, 4, 4, 'FD')
    doc.setFontSize(11)
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    doc.setFont('helvetica', 'bold')
    doc.text('YOUR SACRED REQUEST:', 22, yPosition + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(duaData.situation, 22, yPosition + 12, { maxWidth: pageWidth - 44 })
    yPosition += 38

    // Arabic section with powerful styling
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    const arabicHeader = theme.name === 'Masjid Green' 
      ? '۞ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۞' 
      : '۞ ۞ ۞  BLESSED ARABIC SUPPLICATION  ۞ ۞ ۞'
    doc.text(arabicHeader, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12
    
    // Arabic text container with theme styling
    const arabicHeight = 55
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b)
    doc.setLineWidth(2)
    
    // Theme-specific border style
    if (theme.borderStyle === 'ornate') {
      doc.setLineDashPattern([6, 4], 0)
    } else if (theme.borderStyle === 'modern') {
      doc.setLineDashPattern([10, 5], 0)
    }
    
    doc.roundedRect(16, yPosition, pageWidth - 32, arabicHeight, 8, 8, 'FD')
    doc.setLineDashPattern([], 0)
    
    // Arabic text with tashkeel
    doc.setFontSize(26)
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    this.addArabicText(doc, duaData.arabicText, pageWidth - 25, yPosition + 28, {
      fontSize: 26,
      maxWidth: pageWidth - 50,
      align: 'right'
    })
    yPosition += arabicHeight + 20

    // Translation section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.text(`۞ ۞ ۞  ${duaData.language.toUpperCase()} TRANSLATION  ۞ ۞ ۞`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12
    
    // Translation text
    doc.setFontSize(14)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    const translationText = `"${duaData.translation}"`
    const translationLines = doc.splitTextToSize(translationText, pageWidth - 50)
    translationLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 8
    })
    yPosition += 15

    // Spiritual guidance section
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b)
    doc.setLineWidth(1)
    doc.line(35, yPosition, pageWidth - 35, yPosition)
    yPosition += 10
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('★ SPIRITUAL GUIDANCE ★', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10
    
    const guidance = [
      '• Crafted from authentic Qur\'anic and Prophetic traditions',
      '• Recite with complete sincerity and unwavering faith',
      '• Best times: Before Fajr, between Maghrib-Isha, while fasting',
      '• Repeat 3, 7, or 33 times for increased divine blessing'
    ]
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor.r, textColor.g, textColor.b)
    guidance.forEach(line => {
      doc.text(line, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 6
    })
    
    // Decorative separator
    yPosition += 8
    doc.setFontSize(18)
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text('◆ ◆ ◆', pageWidth / 2, yPosition, { align: 'center' })

    // Premium footer
    const footerY = pageHeight - 25
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setLineWidth(1)
    doc.line(25, footerY, pageWidth - 25, footerY)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b)
    doc.text(`${this.getThemeSymbol(theme.name)} BarakahTool ${this.getThemeSymbol(theme.name)}`, pageWidth / 2, footerY + 8, { align: 'center' })
    
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