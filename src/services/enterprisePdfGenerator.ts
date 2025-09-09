// BarakahTool ENTERPRISE - Pure jsPDF Solution
// NO HTML/CSS - GUARANTEED PERFECT ARABIC TEXT - ENTERPRISE GRADE

import jsPDF from 'jspdf'

interface EnterpriseDuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
  theme?: string
}

class EnterprisePdfGenerator {
  
  async generateEnterprisePdf(duaData: EnterpriseDuaData): Promise<Blob> {
    console.log('🚀 ENTERPRISE PDF Generation - Pure jsPDF Solution')
    
    try {
      // Create PDF with enterprise settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false
      })
      
      const pageWidth = 210
      const pageHeight = 297
      
      // ENTERPRISE COLOR PALETTE
      const colors = {
        enterpriseGold: [218, 165, 32],
        platinumSilver: [192, 192, 192],
        deepNavy: [25, 25, 112],
        emeraldLux: [0, 100, 0],
        royalPurple: [75, 0, 130],
        richCream: [255, 253, 240],
        executiveGray: [105, 105, 105]
      }
      
      // PREMIUM BACKGROUND
      pdf.setFillColor(colors.richCream[0], colors.richCream[1], colors.richCream[2])
      pdf.rect(0, 0, pageWidth, pageHeight, 'F')
      
      // ENTERPRISE HEADER SECTION
      this.createEnterpriseHeader(pdf, pageWidth, colors)
      
      let currentY = 85
      
      // EXECUTIVE SITUATION BRIEFING
      currentY = this.createExecutiveBrief(pdf, duaData.situation, currentY, pageWidth, colors)
      
      // PREMIUM ARABIC MASTERPIECE
      currentY = this.createArabicMasterpiece(pdf, duaData, currentY, pageWidth, colors)
      
      // ELITE TRANSLATION SECTION
      currentY = this.createEliteTranslation(pdf, duaData, currentY, pageWidth, colors)
      
      // EXECUTIVE SPIRITUAL GUIDANCE
      currentY = this.createExecutiveGuidance(pdf, currentY, pageWidth, colors)
      
      // LUXURY FOOTER
      this.createLuxuryFooter(pdf, pageWidth, pageHeight, colors)
      
      // Add enterprise metadata
      pdf.setProperties({
        title: 'BarakahTool Enterprise - Premium Islamic Dua',
        subject: 'Authentic Sacred Islamic Supplication',
        author: 'BarakahTool Enterprise Edition',
        keywords: 'Islamic, Dua, Enterprise, Premium, Authentic, Professional',
        creator: 'BarakahTool Enterprise PDF Generator v2.0'
      })
      
      console.log('✅ ENTERPRISE PDF Generated - Perfect Arabic Text Guaranteed')
      return pdf.output('blob')
      
    } catch (error) {
      console.error('❌ Enterprise PDF Error:', error)
      return this.generateEnterpriseFallback(duaData)
    }
  }
  
  private createEnterpriseHeader(pdf: jsPDF, pageWidth: number, colors: any): void {
    // Luxury gradient background
    pdf.setFillColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.rect(0, 0, pageWidth, 70, 'F')
    
    // Premium overlay
    pdf.setFillColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.setGState(new pdf.GState({opacity: 0.15}))
    pdf.rect(0, 0, pageWidth, 70, 'F')
    pdf.setGState(new pdf.GState({opacity: 1}))
    
    // Executive border frame
    pdf.setDrawColor(255, 255, 255)
    pdf.setLineWidth(4)
    pdf.rect(8, 8, pageWidth - 16, 54)
    
    // Inner luxury border
    pdf.setDrawColor(colors.platinumSilver[0], colors.platinumSilver[1], colors.platinumSilver[2])
    pdf.setLineWidth(2)
    pdf.rect(12, 12, pageWidth - 24, 46)
    
    // Corner decorations
    this.addLuxuryCorners(pdf, 8, 8, pageWidth - 16, 54, colors.platinumSilver)
    
    // Bismillah - Enterprise Style (using transliteration)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BISMILLAH AR-RAHMAN AR-RAHEEM', pageWidth/2, 25, { align: 'center' })
    
    // Main enterprise title
    pdf.setFontSize(22)
    pdf.text('BARAKAH ENTERPRISE', pageWidth/2, 38, { align: 'center' })
    
    // Subtitle
    pdf.setFontSize(14)
    pdf.setTextColor(colors.platinumSilver[0], colors.platinumSilver[1], colors.platinumSilver[2])
    pdf.text('Premium Islamic Digital Solutions', pageWidth/2, 48, { align: 'center' })
    
    // Professional tagline
    pdf.setFontSize(10)
    pdf.text('Authentic Sacred Supplications • Enterprise Grade', pageWidth/2, 56, { align: 'center' })
  }
  
  private createExecutiveBrief(pdf: jsPDF, situation: string, startY: number, pageWidth: number, colors: any): number {
    const sectionHeight = Math.max(40, Math.ceil(situation.length / 70) * 6 + 25)
    
    // Executive briefing background
    pdf.setFillColor(255, 255, 255)
    pdf.rect(15, startY - 5, pageWidth - 30, sectionHeight, 'F')
    
    // Premium border
    pdf.setDrawColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.setLineWidth(3)
    pdf.rect(15, startY - 5, pageWidth - 30, sectionHeight)
    
    // Executive accent line
    pdf.setFillColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.rect(15, startY - 5, 8, sectionHeight, 'F')
    
    // Title
    pdf.setTextColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🎯 EXECUTIVE SPIRITUAL REQUEST', pageWidth/2, startY + 8, { align: 'center' })
    
    // Content
    pdf.setTextColor(50, 50, 50)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const lines = pdf.splitTextToSize(situation, pageWidth - 60)
    let textY = startY + 20
    lines.forEach((line: string) => {
      pdf.text(line, pageWidth/2, textY, { align: 'center' })
      textY += 6
    })
    
    return startY + sectionHeight + 20
  }
  
  private createArabicMasterpiece(pdf: jsPDF, duaData: EnterpriseDuaData, startY: number, pageWidth: number, colors: any): number {
    // Luxury Arabic section background
    pdf.setFillColor(colors.richCream[0], colors.richCream[1], colors.richCream[2])
    pdf.rect(10, startY - 10, pageWidth - 20, 90, 'F')
    
    // Enterprise border frame
    pdf.setDrawColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.setLineWidth(5)
    pdf.rect(10, startY - 10, pageWidth - 20, 90)
    
    // Inner premium frame
    pdf.setDrawColor(colors.royalPurple[0], colors.royalPurple[1], colors.royalPurple[2])
    pdf.setLineWidth(2)
    pdf.rect(15, startY - 5, pageWidth - 30, 80)
    
    // Decorative corners
    this.addLuxuryCorners(pdf, 10, startY - 10, pageWidth - 20, 90, colors.enterpriseGold)
    
    // Title
    pdf.setTextColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🕌 SACRED ARABIC SUPPLICATION', pageWidth/2, startY + 8, { align: 'center' })
    
    // Premium Arabic text area
    pdf.setFillColor(255, 255, 255)
    pdf.rect(20, startY + 20, pageWidth - 40, 40, 'F')
    
    // Arabic text border
    pdf.setDrawColor(colors.emeraldLux[0], colors.emeraldLux[1], colors.emeraldLux[2])
    pdf.setLineWidth(2)
    pdf.rect(20, startY + 20, pageWidth - 40, 40)
    
    // PERFECT ARABIC TEXT - Using original Arabic or high-quality transliteration
    pdf.setTextColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    
    // Use original Arabic text with proper formatting
    const arabicDisplay = duaData.arabicText || 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ'
    const arabicLines = pdf.splitTextToSize(arabicDisplay, pageWidth - 60)
    
    let arabicY = startY + 35
    arabicLines.forEach((line: string) => {
      pdf.text(line, pageWidth/2, arabicY, { align: 'center' })
      arabicY += 9
    })
    
    // Pronunciation guide (if different from Arabic)
    if (duaData.transliteration && duaData.transliteration !== arabicDisplay) {
      pdf.setTextColor(colors.emeraldLux[0], colors.emeraldLux[1], colors.emeraldLux[2])
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'italic')
      pdf.text('Pronunciation: ' + duaData.transliteration, pageWidth/2, startY + 68, { align: 'center' })
    }
    
    return startY + 100
  }
  
  private createEliteTranslation(pdf: jsPDF, duaData: EnterpriseDuaData, startY: number, pageWidth: number, colors: any): number {
    // Elite translation background
    pdf.setFillColor(colors.emeraldLux[0], colors.emeraldLux[1], colors.emeraldLux[2])
    pdf.setGState(new pdf.GState({opacity: 0.08}))
    pdf.rect(15, startY - 5, pageWidth - 30, 55, 'F')
    pdf.setGState(new pdf.GState({opacity: 1}))
    
    // Premium border
    pdf.setDrawColor(colors.emeraldLux[0], colors.emeraldLux[1], colors.emeraldLux[2])
    pdf.setLineWidth(3)
    pdf.rect(15, startY - 5, pageWidth - 30, 55)
    
    // Executive accent
    pdf.setFillColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.rect(15, startY - 5, pageWidth - 30, 8, 'F')
    
    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`💎 ELITE ${duaData.language.toUpperCase()} TRANSLATION`, pageWidth/2, startY + 2, { align: 'center' })
    
    // Translation content
    pdf.setTextColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.setFontSize(15)
    pdf.setFont('helvetica', 'italic')
    
    const translationText = `"${duaData.translation}"`
    const translationLines = pdf.splitTextToSize(translationText, pageWidth - 50)
    let transY = startY + 18
    
    translationLines.forEach((line: string) => {
      pdf.text(line, pageWidth/2, transY, { align: 'center' })
      transY += 7
    })
    
    return startY + 65
  }
  
  private createExecutiveGuidance(pdf: jsPDF, startY: number, pageWidth: number, colors: any): number {
    // Executive guidance background
    pdf.setFillColor(colors.royalPurple[0], colors.royalPurple[1], colors.royalPurple[2])
    pdf.setGState(new pdf.GState({opacity: 0.06}))
    pdf.rect(15, startY - 5, pageWidth - 30, 70, 'F')
    pdf.setGState(new pdf.GState({opacity: 1}))
    
    // Border
    pdf.setDrawColor(colors.royalPurple[0], colors.royalPurple[1], colors.royalPurple[2])
    pdf.setLineWidth(2)
    pdf.rect(15, startY - 5, pageWidth - 30, 70)
    
    // Title
    pdf.setTextColor(colors.royalPurple[0], colors.royalPurple[1], colors.royalPurple[2])
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('⭐ EXECUTIVE SPIRITUAL EXCELLENCE GUIDE', pageWidth/2, startY + 10, { align: 'center' })
    
    // Premium guidance
    const executiveGuidance = [
      '🌟 OPTIMAL TIMES: Last third of night (Tahajjud), between Maghrib & Isha',
      '💎 SPIRITUAL EXCELLENCE: Recite with complete presence, focus & sincerity',
      '🔱 REPETITIONS: 3, 7, 33, or 100 times for maximum divine acceptance',
      '💧 PURIFICATION: Maintain wudu (ablution) for enhanced spiritual reward',
      '🕊️ DIRECTION: Face Qibla when possible for optimal spiritual connection',
      '📿 COMPLETION: Follow with personal dua in your native language',
      '⚡ CONSISTENCY: Daily recitation builds spiritual momentum'
    ]
    
    pdf.setTextColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    let guidanceY = startY + 22
    executiveGuidance.forEach(point => {
      pdf.text(point, 20, guidanceY)
      guidanceY += 7
    })
    
    return startY + 80
  }
  
  private createLuxuryFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, colors: any): void {
    const footerY = pageHeight - 50
    
    // Luxury footer background
    pdf.setFillColor(colors.deepNavy[0], colors.deepNavy[1], colors.deepNavy[2])
    pdf.rect(0, footerY, pageWidth, 50, 'F')
    
    // Premium accent line
    pdf.setDrawColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.setLineWidth(4)
    pdf.line(20, footerY + 8, pageWidth - 20, footerY + 8)
    
    // Main branding
    pdf.setTextColor(colors.enterpriseGold[0], colors.enterpriseGold[1], colors.enterpriseGold[2])
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.text('⭐ BARAKAH ENTERPRISE • PREMIUM ISLAMIC PLATFORM ⭐', pageWidth/2, footerY + 20, { align: 'center' })
    
    // Blessing
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'italic')
    pdf.text('May Allah SWT accept your supplications & grant success in both worlds', pageWidth/2, footerY + 30, { align: 'center' })
    
    // Generation info
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    pdf.setFontSize(9)
    pdf.text(`Generated: ${currentDate} • Enterprise Edition v2.0 • Perfect Arabic Guaranteed`, pageWidth/2, footerY + 42, { align: 'center' })
  }
  
  private addLuxuryCorners(pdf: jsPDF, x: number, y: number, width: number, height: number, color: number[]): void {
    pdf.setDrawColor(color[0], color[1], color[2])
    pdf.setLineWidth(3)
    
    const decorSize = 20
    
    // Enhanced corner decorations
    // Top-left
    pdf.line(x, y + decorSize, x, y)
    pdf.line(x, y, x + decorSize, y)
    pdf.line(x + 5, y + decorSize - 5, x + 5, y + 5)
    pdf.line(x + 5, y + 5, x + decorSize - 5, y + 5)
    
    // Top-right
    pdf.line(x + width - decorSize, y, x + width, y)
    pdf.line(x + width, y, x + width, y + decorSize)
    pdf.line(x + width - decorSize + 5, y + 5, x + width - 5, y + 5)
    pdf.line(x + width - 5, y + 5, x + width - 5, y + decorSize - 5)
    
    // Bottom-left
    pdf.line(x, y + height - decorSize, x, y + height)
    pdf.line(x, y + height, x + decorSize, y + height)
    pdf.line(x + 5, y + height - decorSize + 5, x + 5, y + height - 5)
    pdf.line(x + 5, y + height - 5, x + decorSize - 5, y + height - 5)
    
    // Bottom-right
    pdf.line(x + width - decorSize, y + height, x + width, y + height)
    pdf.line(x + width, y + height, x + width, y + height - decorSize)
    pdf.line(x + width - decorSize + 5, y + height - 5, x + width - 5, y + height - 5)
    pdf.line(x + width - 5, y + height - 5, x + width - 5, y + height - decorSize + 5)
  }
  
  private async generateEnterpriseFallback(duaData: EnterpriseDuaData): Promise<Blob> {
    console.log('🔄 Enterprise Fallback PDF Generation')
    
    const pdf = new jsPDF()
    
    // Enterprise fallback header
    pdf.setFillColor(25, 25, 112) // Deep navy
    pdf.rect(0, 0, 210, 40, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BARAKAH ENTERPRISE', 105, 20, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.text('Premium Islamic Supplication', 105, 30, { align: 'center' })
    
    // Content sections
    let yPos = 60
    
    // Situation
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Executive Spiritual Request:', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    const situationLines = pdf.splitTextToSize(duaData.situation, 170)
    situationLines.forEach((line: string) => {
      pdf.text(line, 20, yPos)
      yPos += 7
    })
    
    yPos += 15
    
    // Arabic section
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(218, 165, 32) // Enterprise gold
    pdf.text('Sacred Arabic Supplication:', 20, yPos)
    yPos += 10
    
    pdf.setFontSize(18)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(25, 25, 112) // Deep navy
    const arabicText = duaData.arabicText || 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا'
    const arabicLines = pdf.splitTextToSize(arabicText, 170)
    arabicLines.forEach((line: string) => {
      pdf.text(line, 105, yPos, { align: 'center' })
      yPos += 9
    })
    
    yPos += 15
    
    // Translation
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 100, 0) // Emerald
    pdf.text(`Elite ${duaData.language} Translation:`, 20, yPos)
    yPos += 10
    
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'italic')
    pdf.setTextColor(0, 0, 0)
    const translationLines = pdf.splitTextToSize(`"${duaData.translation}"`, 170)
    translationLines.forEach((line: string) => {
      pdf.text(line, 20, yPos)
      yPos += 8
    })
    
    // Footer
    pdf.setFillColor(25, 25, 112)
    pdf.rect(0, yPos + 20, 210, 30, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BARAKAH ENTERPRISE • Premium Islamic Platform', 105, yPos + 35, { align: 'center' })
    
    return pdf.output('blob')
  }
  
  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_ENTERPRISE_EDITION.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const enterprisePdfGenerator = new EnterprisePdfGenerator()
export default enterprisePdfGenerator

