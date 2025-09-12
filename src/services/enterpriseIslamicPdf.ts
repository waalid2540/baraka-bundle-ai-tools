// Enterprise Islamic PDF Generator - 4 Professional Corporate Designs
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

type DesignTheme = 'executive' | 'corporate' | 'premium' | 'luxury'

class EnterpriseIslamicPdf {
  async generateEnterprisePdf(duaData: DuaData, theme: DesignTheme = 'executive'): Promise<Blob> {
    // Create high-resolution canvas for enterprise quality
    const canvas = document.createElement('canvas')
    canvas.width = 900   // Enterprise width
    canvas.height = 1500  // Enterprise height
    const ctx = canvas.getContext('2d')!
    
    // Apply selected enterprise theme
    const design = this.getEnterpriseDesign(theme)
    
    // Professional gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bgGradient.addColorStop(0, design.background.start)
    bgGradient.addColorStop(0.5, design.background.mid)
    bgGradient.addColorStop(1, design.background.end)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Enterprise header with pattern
    this.drawEnterpriseHeader(ctx, canvas, design)
    
    let yPosition = 100
    
    // Corporate branding section
    ctx.fillStyle = design.primary
    ctx.font = `bold ${design.titleSize}px ${design.font}`
    ctx.textAlign = 'center'
    ctx.shadowColor = design.shadowColor
    ctx.shadowBlur = design.shadowBlur
    ctx.fillText(design.arabicTitle, canvas.width / 2, yPosition)
    ctx.shadowBlur = 0
    
    yPosition += 60
    
    // Enterprise subtitle
    ctx.fillStyle = design.secondary
    ctx.font = `${design.subtitleSize}px ${design.font}`
    ctx.fillText(design.englishTitle, canvas.width / 2, yPosition)
    
    yPosition += 40
    
    // Professional tagline
    ctx.fillStyle = design.accent
    ctx.font = `italic ${design.taglineSize}px ${design.font}`
    ctx.fillText(design.tagline, canvas.width / 2, yPosition)
    
    yPosition += 60
    
    // Enterprise divider
    this.drawEnterpriseDivider(ctx, canvas.width / 2 - 200, yPosition, 400, design)
    yPosition += 50
    
    // Request section with corporate styling
    if (duaData.situation) {
      this.drawEnterpriseSection(ctx, 60, yPosition, canvas.width - 120, 70, design, 'REQUEST')
      ctx.fillStyle = design.textColor
      ctx.font = `${design.bodySize}px ${design.font}`
      ctx.textAlign = 'center'
      const requestLines = this.wrapText(ctx, duaData.situation, canvas.width - 140)
      requestLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPosition + 35 + (index * 22))
      })
      yPosition += 90
    }
    
    // Arabic section - Enterprise style
    yPosition += 30
    this.drawEnterpriseSection(ctx, 50, yPosition, canvas.width - 100, 160, design, 'ARABIC')
    
    // Professional Arabic text
    ctx.fillStyle = design.arabicColor
    ctx.font = `bold ${design.arabicSize}px ${design.arabicFont}`
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'
    
    const arabicLines = this.wrapArabicText(ctx, duaData.arabicText, canvas.width - 130)
    let arabicY = yPosition + 50
    
    arabicLines.forEach(line => {
      // Corporate shadow effect
      ctx.shadowColor = design.arabicShadow
      ctx.shadowBlur = design.arabicShadowBlur
      ctx.fillText(line, canvas.width / 2, arabicY)
      ctx.shadowBlur = 0
      arabicY += 55
    })
    
    yPosition += 190
    
    // Transliteration - Professional style
    if (duaData.transliteration) {
      this.drawEnterpriseSection(ctx, 60, yPosition, canvas.width - 120, 80, design, 'PRONUNCIATION')
      ctx.fillStyle = design.translitColor
      ctx.font = `italic ${design.translitSize}px ${design.font}`
      ctx.textAlign = 'center'
      const translitLines = this.wrapText(ctx, duaData.transliteration, canvas.width - 140)
      let translitY = yPosition + 30
      translitLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, translitY)
        translitY += 24
      })
      yPosition += 100
    }
    
    // Translation - Enterprise prominence
    yPosition += 20
    this.drawEnterpriseSection(ctx, 50, yPosition, canvas.width - 100, 110, design, 'TRANSLATION')
    
    ctx.fillStyle = design.translationColor
    ctx.font = `bold ${design.translationSize}px ${design.font}`
    ctx.textAlign = 'center'
    const translationLines = this.wrapText(ctx, `"${duaData.translation}"`, canvas.width - 130)
    let transY = yPosition + 35
    
    translationLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, transY)
      transY += 26
    })
    
    yPosition += 130
    
    // Professional insights section
    yPosition += 30
    this.drawEnterpriseSection(ctx, 40, yPosition, canvas.width - 80, 220, design, 'INSIGHTS')
    
    ctx.fillStyle = design.insightTitle
    ctx.font = `bold ${design.insightTitleSize}px ${design.font}`
    ctx.textAlign = 'center'
    ctx.fillText('Spiritual Insights & Professional Guidance', canvas.width / 2, yPosition + 30)
    
    const insights = this.getEnterpriseInsights(duaData.situation)
    ctx.fillStyle = design.insightText
    ctx.font = `${design.insightSize}px ${design.font}`
    ctx.textAlign = 'left'
    
    let insightY = yPosition + 55
    insights.forEach(insight => {
      // Enterprise bullet
      ctx.fillStyle = design.bulletColor
      ctx.font = `bold ${design.bulletSize}px ${design.font}`
      ctx.fillText(design.bullet, 60, insightY)
      
      // Insight text
      ctx.fillStyle = design.insightText
      ctx.font = `${design.insightSize}px ${design.font}`
      const insightLines = this.wrapText(ctx, insight, canvas.width - 160)
      insightLines.forEach((line, index) => {
        ctx.fillText(line, 90, insightY + (index * 20))
      })
      insightY += insightLines.length * 20 + 12
    })
    
    yPosition += 250
    
    // Implementation guidelines - Corporate style
    this.drawEnterpriseSection(ctx, 40, yPosition, canvas.width - 80, 110, design, 'GUIDELINES')
    
    const guidelines = [
      `${design.guideIcon} Optimal recitation: ${this.getOptimalTime()}`,
      `${design.guideIcon} Recommended frequency: 3, 7, or 33 repetitions`,
      `${design.guideIcon} Professional mindset: Focus and sincerity required`,
      `${design.guideIcon} Enterprise success: Combine with ethical practices`
    ]
    
    ctx.fillStyle = design.guideText
    ctx.font = `${design.guideSize}px ${design.font}`
    let guideY = yPosition + 28
    
    guidelines.forEach(guide => {
      ctx.fillText(guide, 60, guideY)
      guideY += 22
    })
    
    // Enterprise footer
    this.drawEnterpriseFooter(ctx, canvas, design)
    
    // Convert to PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, '', 'FAST')
    
    return pdf.output('blob')
  }
  
  private getEnterpriseDesign(theme: DesignTheme) {
    const designs = {
      executive: {
        name: 'Executive Suite',
        background: { start: '#FAFAFA', mid: '#F5F5F5', end: '#EEEEEE' },
        primary: '#1A237E',      // Deep indigo
        secondary: '#283593',    // Indigo
        accent: '#3949AB',       // Light indigo
        arabicColor: '#1A237E',
        translitColor: '#424242',
        translationColor: '#212121',
        textColor: '#424242',
        shadowColor: 'rgba(26, 35, 126, 0.2)',
        shadowBlur: 8,
        arabicShadow: 'rgba(26, 35, 126, 0.15)',
        arabicShadowBlur: 5,
        font: 'Helvetica, Arial, sans-serif',
        arabicFont: '"Traditional Arabic", Helvetica, Arial',
        titleSize: 36,
        subtitleSize: 24,
        taglineSize: 16,
        bodySize: 15,
        arabicSize: 40,
        translitSize: 16,
        translationSize: 18,
        arabicTitle: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        englishTitle: 'EXECUTIVE ISLAMIC SOLUTIONS',
        tagline: 'Professional Spiritual Excellence',
        bullet: '▸',
        bulletColor: '#3949AB',
        bulletSize: 18,
        insightTitle: '#1A237E',
        insightTitleSize: 20,
        insightText: '#424242',
        insightSize: 14,
        guideIcon: '◆',
        guideText: '#616161',
        guideSize: 13,
        borderStyle: 'executive'
      },
      corporate: {
        name: 'Corporate Professional',
        background: { start: '#FFFFFF', mid: '#F8F9FA', end: '#E9ECEF' },
        primary: '#004D40',      // Teal
        secondary: '#00695C',    // Dark teal
        accent: '#00897B',       // Medium teal
        arabicColor: '#004D40',
        translitColor: '#37474F',
        translationColor: '#263238',
        textColor: '#455A64',
        shadowColor: 'rgba(0, 77, 64, 0.2)',
        shadowBlur: 10,
        arabicShadow: 'rgba(0, 77, 64, 0.18)',
        arabicShadowBlur: 6,
        font: 'Georgia, Times, serif',
        arabicFont: '"Traditional Arabic", Georgia, serif',
        titleSize: 38,
        subtitleSize: 26,
        taglineSize: 17,
        bodySize: 16,
        arabicSize: 42,
        translitSize: 17,
        translationSize: 19,
        arabicTitle: 'الدُّعَاءُ الشَّرِيف',
        englishTitle: 'CORPORATE ISLAMIC SERVICES',
        tagline: 'Enterprise Spiritual Solutions',
        bullet: '►',
        bulletColor: '#00897B',
        bulletSize: 20,
        insightTitle: '#004D40',
        insightTitleSize: 21,
        insightText: '#455A64',
        insightSize: 15,
        guideIcon: '▪',
        guideText: '#607D8B',
        guideSize: 14,
        borderStyle: 'corporate'
      },
      premium: {
        name: 'Premium Business',
        background: { start: '#FFF8E1', mid: '#FFF3E0', end: '#FFE0B2' },
        primary: '#E65100',      // Deep orange
        secondary: '#F57C00',    // Orange
        accent: '#FF9800',       // Light orange
        arabicColor: '#BF360C',
        translitColor: '#5D4037',
        translationColor: '#3E2723',
        textColor: '#4E342E',
        shadowColor: 'rgba(230, 81, 0, 0.25)',
        shadowBlur: 12,
        arabicShadow: 'rgba(191, 54, 12, 0.2)',
        arabicShadowBlur: 7,
        font: 'Verdana, Geneva, sans-serif',
        arabicFont: '"Traditional Arabic", Verdana, sans-serif',
        titleSize: 40,
        subtitleSize: 28,
        taglineSize: 18,
        bodySize: 16,
        arabicSize: 44,
        translitSize: 18,
        translationSize: 20,
        arabicTitle: 'صَلَاةٌ مُبَارَكَة',
        englishTitle: 'PREMIUM ISLAMIC ENTERPRISE',
        tagline: 'Excellence in Spiritual Leadership',
        bullet: '●',
        bulletColor: '#FF9800',
        bulletSize: 16,
        insightTitle: '#E65100',
        insightTitleSize: 22,
        insightText: '#4E342E',
        insightSize: 15,
        guideIcon: '✦',
        guideText: '#6D4C41',
        guideSize: 14,
        borderStyle: 'premium'
      },
      luxury: {
        name: 'Luxury Edition',
        background: { start: '#F5F5F5', mid: '#EEEEEE', end: '#E0E0E0' },
        primary: '#212121',      // Near black
        secondary: '#424242',    // Dark gray
        accent: '#BF9000',       // Gold
        arabicColor: '#212121',
        translitColor: '#424242',
        translationColor: '#212121',
        textColor: '#424242',
        shadowColor: 'rgba(191, 144, 0, 0.3)',
        shadowBlur: 15,
        arabicShadow: 'rgba(33, 33, 33, 0.2)',
        arabicShadowBlur: 8,
        font: 'Palatino, "Book Antiqua", serif',
        arabicFont: '"Traditional Arabic", Palatino, serif',
        titleSize: 42,
        subtitleSize: 30,
        taglineSize: 19,
        bodySize: 17,
        arabicSize: 46,
        translitSize: 19,
        translationSize: 21,
        arabicTitle: 'دُعَاءٌ ذَهَبِيّ',
        englishTitle: 'LUXURY ISLAMIC COLLECTION',
        tagline: 'Exclusive Spiritual Excellence',
        bullet: '◈',
        bulletColor: '#BF9000',
        bulletSize: 22,
        insightTitle: '#212121',
        insightTitleSize: 23,
        insightText: '#424242',
        insightSize: 16,
        guideIcon: '❋',
        guideText: '#616161',
        guideSize: 15,
        borderStyle: 'luxury'
      }
    }
    
    return designs[theme]
  }
  
  private drawEnterpriseHeader(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: any) {
    // Enterprise header pattern
    const headerHeight = 80
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, headerHeight)
    gradient.addColorStop(0, design.primary)
    gradient.addColorStop(0.5, design.secondary)
    gradient.addColorStop(1, design.primary)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, headerHeight)
    
    // Corporate pattern overlay
    ctx.strokeStyle = design.accent
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.3
    
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + 20, headerHeight)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }
  
  private drawEnterpriseDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, design: any) {
    // Main line
    const gradient = ctx.createLinearGradient(x, y, x + width, y)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(0.3, design.accent)
    gradient.addColorStop(0.5, design.primary)
    gradient.addColorStop(0.7, design.accent)
    gradient.addColorStop(1, 'transparent')
    
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
    
    // Center ornament
    ctx.fillStyle = design.primary
    ctx.font = `bold 20px ${design.font}`
    ctx.textAlign = 'center'
    ctx.fillText('◆', x + width/2, y + 5)
  }
  
  private drawEnterpriseSection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, design: any, type: string) {
    // Enterprise section background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fillRect(x, y, width, height)
    
    // Professional border
    ctx.strokeStyle = design.primary
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Inner accent
    ctx.strokeStyle = design.accent
    ctx.lineWidth = 1
    ctx.strokeRect(x + 4, y + 4, width - 8, height - 8)
    
    // Section label
    if (type) {
      ctx.fillStyle = design.primary
      ctx.fillRect(x + width/2 - 60, y - 10, 120, 20)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold 11px ${design.font}`
      ctx.textAlign = 'center'
      ctx.fillText(type, x + width/2, y + 2)
    }
  }
  
  private drawEnterpriseFooter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: any) {
    const footerY = canvas.height - 120
    
    // Footer background
    const gradient = ctx.createLinearGradient(0, footerY, 0, canvas.height)
    gradient.addColorStop(0, 'transparent')
    gradient.addColorStop(0.3, design.background.end)
    gradient.addColorStop(1, design.background.mid)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, footerY, canvas.width, 120)
    
    // Enterprise divider
    this.drawEnterpriseDivider(ctx, canvas.width / 2 - 180, footerY + 15, 360, design)
    
    // Corporate branding
    ctx.fillStyle = design.primary
    ctx.font = `bold 20px ${design.font}`
    ctx.textAlign = 'center'
    ctx.fillText('BARAKAHTOOL ENTERPRISE', canvas.width / 2, footerY + 45)
    
    // Tagline
    ctx.fillStyle = design.secondary
    ctx.font = `14px ${design.font}`
    ctx.fillText('Professional Islamic Solutions for Modern Business', canvas.width / 2, footerY + 70)
    
    // Copyright and date
    ctx.fillStyle = design.textColor
    ctx.font = `12px ${design.font}`
    ctx.fillText(`© ${new Date().getFullYear()} BarakahTool Enterprise | Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, canvas.width / 2, footerY + 95)
  }
  
  private getOptimalTime(): string {
    const hour = new Date().getHours()
    if (hour < 5) return 'Last third of night (Tahajjud)'
    if (hour < 7) return 'Before Fajr prayer'
    if (hour < 12) return 'Morning hours (Duha)'
    if (hour < 15) return 'After Dhuhr prayer'
    if (hour < 18) return 'Before Asr prayer'
    if (hour < 20) return 'After Maghrib prayer'
    return 'Before Isha prayer'
  }
  
  private getEnterpriseInsights(situation: string): string[] {
    const lower = situation.toLowerCase()
    
    if (lower.includes('business') || lower.includes('work') || lower.includes('career')) {
      return [
        'Strategic alignment of spiritual principles with business excellence',
        'Islamic ethics as a competitive advantage in modern enterprise',
        'Building trust through faith-based professional integrity',
        'Leveraging divine guidance for organizational success'
      ]
    }
    
    if (lower.includes('patience') || lower.includes('strength')) {
      return [
        'Patience as a strategic asset in professional development',
        'Building resilience through structured spiritual practice',
        'Converting challenges into opportunities for growth',
        'Developing emotional intelligence through faith-based frameworks'
      ]
    }
    
    if (lower.includes('guidance') || lower.includes('decision')) {
      return [
        'Decision-making excellence through divine consultation (Istikhara)',
        'Strategic planning aligned with spiritual principles',
        'Risk management through faith-based wisdom',
        'Leadership development through prophetic examples'
      ]
    }
    
    // Default enterprise insights
    return [
      'Integration of spiritual excellence with professional achievement',
      'Building sustainable success through ethical foundations',
      'Creating value through faith-inspired innovation',
      'Developing high-performance teams with spiritual alignment'
    ]
  }
  
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) lines.push(currentLine)
    return lines
  }
  
  private wrapArabicText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) lines.push(currentLine)
    return lines
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

export const enterpriseIslamicPdf = new EnterpriseIslamicPdf()
export default enterpriseIslamicPdf