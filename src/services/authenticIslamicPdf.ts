// Authentic Islamic PDF Generator with Beautiful Design, Multiple Translations & Reflections
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
  topic?: string
  translations?: {
    english?: string
    somali?: string
    urdu?: string
    turkish?: string
    indonesian?: string
    french?: string
  }
}

interface EnhancedDuaData extends DuaData {
  translations?: {
    english?: string
    somali?: string
    urdu?: string
    turkish?: string
    indonesian?: string
    french?: string
  }
  reflection?: string
  benefits?: string[]
  bestTimes?: string[]
  references?: string
}

class AuthenticIslamicPdf {
  async generateComprehensiveIslamicPdf(duaData: DuaData, theme: string = 'light'): Promise<Blob> {
    // Enhanced dua data with reflections and multiple translations
    const enhancedData = await this.enhanceDuaData(duaData)
    
    // Create high-quality canvas
    const canvas = document.createElement('canvas')
    canvas.width = 794  // A4 width
    canvas.height = 1400 // Extended height for more content
    const ctx = canvas.getContext('2d')!
    
    // Get theme colors
    const colors = this.getIslamicThemeColors(theme)
    
    // Draw authentic Islamic background
    this.drawIslamicBackground(ctx, canvas, colors)
    
    // Draw Islamic border frame
    this.drawIslamicBorderFrame(ctx, canvas, colors)
    
    let yPosition = 60
    
    // Islamic Header with authentic calligraphy style
    this.drawIslamicHeader(ctx, canvas, colors, yPosition)
    yPosition += 120
    
    // Main Arabic Dua Section with ornate frame
    yPosition = this.drawMainArabicSection(ctx, canvas, enhancedData, colors, yPosition)
    yPosition += 40
    
    // Transliteration Section
    if (enhancedData.transliteration) {
      yPosition = this.drawTransliterationSection(ctx, canvas, enhancedData.transliteration, colors, yPosition)
      yPosition += 30
    }
    
    // Multiple Translations Section
    yPosition = this.drawMultipleTranslations(ctx, canvas, enhancedData, colors, yPosition)
    yPosition += 30
    
    // Reflection Section
    if (enhancedData.reflection) {
      yPosition = this.drawReflectionSection(ctx, canvas, enhancedData.reflection, colors, yPosition)
      yPosition += 30
    }
    
    // Benefits Section
    if (enhancedData.benefits && enhancedData.benefits.length > 0) {
      yPosition = this.drawBenefitsSection(ctx, canvas, enhancedData.benefits, colors, yPosition)
      yPosition += 30
    }
    
    // Best Times to Recite
    if (enhancedData.bestTimes && enhancedData.bestTimes.length > 0) {
      yPosition = this.drawBestTimesSection(ctx, canvas, enhancedData.bestTimes, colors, yPosition)
    }
    
    // Islamic Footer
    this.drawIslamicFooter(ctx, canvas, colors)
    
    // Convert to PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, '', 'SLOW')
    
    return pdf.output('blob')
  }
  
  private async enhanceDuaData(duaData: DuaData): Promise<EnhancedDuaData> {
    // Add reflections based on the topic/situation
    const reflection = this.getReflection(duaData.situation)
    const benefits = this.getBenefits(duaData.situation)
    const bestTimes = this.getBestTimes()
    
    // Use existing translations from OpenAI or fallback
    const translations = (duaData as any).translations || {
      english: duaData.translation
    }
    
    return {
      ...duaData,
      translations,
      reflection,
      benefits,
      bestTimes,
      references: 'Authentic Islamic Sources'
    }
  }
  
  private drawIslamicBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors.background)
    gradient.addColorStop(0.5, colors.backgroundMid)
    gradient.addColorStop(1, colors.backgroundEnd)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Islamic geometric pattern overlay
    ctx.globalAlpha = 0.1
    this.drawIslamicGeometricPattern(ctx, canvas, colors)
    ctx.globalAlpha = 1
  }
  
  private drawIslamicGeometricPattern(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 1
    
    // Draw Islamic 8-pointed star pattern
    const centerX = canvas.width / 2
    const centerY = 300
    const size = 150
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const x1 = centerX + Math.cos(angle) * size
      const y1 = centerY + Math.sin(angle) * size
      
      for (let j = i + 1; j < 8; j++) {
        const angle2 = (j * Math.PI * 2) / 8
        const x2 = centerX + Math.cos(angle2) * size
        const y2 = centerY + Math.sin(angle2) * size
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }
    
    // Add smaller patterns around
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (row === 1 && col === 1) continue // Skip center
        const x = 150 + col * 250
        const y = 200 + row * 400
        this.drawSmallIslamicStar(ctx, x, y, 40, colors)
      }
    }
  }
  
  private drawSmallIslamicStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colors: any) {
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 0.5
    
    const points = 8
    for (let i = 0; i < points; i++) {
      const angle = (i * Math.PI * 2) / points
      const innerAngle = ((i + 0.5) * Math.PI * 2) / points
      
      const outerX = x + Math.cos(angle) * size
      const outerY = y + Math.sin(angle) * size
      const innerX = x + Math.cos(innerAngle) * (size * 0.5)
      const innerY = y + Math.sin(innerAngle) * (size * 0.5)
      
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(outerX, outerY)
      ctx.lineTo(innerX, innerY)
      ctx.closePath()
      ctx.stroke()
    }
  }
  
  private drawIslamicBorderFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    // Outer border
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 3
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Inner decorative border
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
    
    // Corner ornaments
    this.drawCornerOrnament(ctx, 40, 40, colors) // Top left
    this.drawCornerOrnament(ctx, canvas.width - 40, 40, colors, 90) // Top right
    this.drawCornerOrnament(ctx, 40, canvas.height - 40, colors, -90) // Bottom left
    this.drawCornerOrnament(ctx, canvas.width - 40, canvas.height - 40, colors, 180) // Bottom right
  }
  
  private drawCornerOrnament(ctx: CanvasRenderingContext2D, x: number, y: number, colors: any, rotation: number = 0) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rotation * Math.PI) / 180)
    
    ctx.fillStyle = colors.accent
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    
    // Draw Islamic corner pattern
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(30, 0)
    ctx.lineTo(30, 5)
    ctx.lineTo(5, 5)
    ctx.lineTo(5, 30)
    ctx.lineTo(0, 30)
    ctx.closePath()
    ctx.stroke()
    
    // Add decorative dot
    ctx.beginPath()
    ctx.arc(15, 15, 3, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()
  }
  
  private drawIslamicHeader(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any, y: number) {
    // Bismillah with decorative frame
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 32px "Arial", "Traditional Arabic"'
    ctx.textAlign = 'center'
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, y)
    
    // Decorative underline
    y += 15
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 150, y, 300, colors)
    
    // App title in elegant style
    y += 35
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 24px Arial'
    ctx.fillText('BarakahTool', canvas.width / 2, y)
    
    // Subtitle
    y += 25
    ctx.font = '16px Arial'
    ctx.fillStyle = colors.secondary
    ctx.fillText('Authentic Islamic Digital Platform', canvas.width / 2, y)
  }
  
  private drawOrnamentalDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, colors: any) {
    // Center ornament
    const centerX = x + width / 2
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.arc(centerX, y, 5, 0, Math.PI * 2)
    ctx.fill()
    
    // Side lines with gradient
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    
    // Left line
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(centerX - 20, y)
    ctx.stroke()
    
    // Right line
    ctx.beginPath()
    ctx.moveTo(centerX + 20, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
    
    // Small decorative dots
    for (let i = 0; i < 3; i++) {
      ctx.beginPath()
      ctx.arc(x + 30 + i * 30, y, 2, 0, Math.PI * 2)
      ctx.arc(x + width - 30 - i * 30, y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  private drawMainArabicSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, duaData: EnhancedDuaData, colors: any, y: number): number {
    // Section title
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('الدعاء', canvas.width / 2, y)
    y += 40
    
    // Ornate frame for Arabic text
    const frameX = 60
    const frameWidth = canvas.width - 120
    const frameHeight = 160
    
    // Draw ornate Islamic frame
    this.drawOrnateFrame(ctx, frameX, y - 20, frameWidth, frameHeight, colors)
    
    // Arabic text with beautiful styling
    ctx.fillStyle = colors.text
    ctx.font = 'bold 30px "Arial", "Traditional Arabic", "Amiri"'
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'
    
    // Split and render Arabic text
    const arabicLines = this.wrapArabicText(ctx, duaData.arabicText, frameWidth - 40)
    const lineHeight = 45
    const startY = y + 30
    
    arabicLines.forEach((line, index) => {
      const textY = startY + (index * lineHeight)
      // Text shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(line, canvas.width / 2, textY)
      ctx.shadowBlur = 0
    })
    
    return y + frameHeight
  }
  
  private drawOrnateFrame(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: any) {
    // Main frame
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, width, height)
    
    // Inner frame
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1
    ctx.strokeRect(x + 10, y + 10, width - 20, height - 20)
    
    // Decorative corners
    const cornerSize = 20
    ctx.fillStyle = colors.accent
    
    // Top left corner decoration
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + cornerSize, y)
    ctx.lineTo(x, y + cornerSize)
    ctx.closePath()
    ctx.fill()
    
    // Top right corner decoration
    ctx.beginPath()
    ctx.moveTo(x + width, y)
    ctx.lineTo(x + width - cornerSize, y)
    ctx.lineTo(x + width, y + cornerSize)
    ctx.closePath()
    ctx.fill()
    
    // Bottom left corner decoration
    ctx.beginPath()
    ctx.moveTo(x, y + height)
    ctx.lineTo(x + cornerSize, y + height)
    ctx.lineTo(x, y + height - cornerSize)
    ctx.closePath()
    ctx.fill()
    
    // Bottom right corner decoration
    ctx.beginPath()
    ctx.moveTo(x + width, y + height)
    ctx.lineTo(x + width - cornerSize, y + height)
    ctx.lineTo(x + width, y + height - cornerSize)
    ctx.closePath()
    ctx.fill()
  }
  
  private drawTransliterationSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, transliteration: string, colors: any, y: number): number {
    // Section header
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('〜 Pronunciation Guide 〜', canvas.width / 2, y)
    y += 25
    
    // Transliteration text
    ctx.fillStyle = colors.text
    ctx.font = 'italic 18px Arial'
    const lines = this.wrapText(ctx, transliteration, canvas.width - 120)
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y)
      y += 25
    })
    
    return y
  }
  
  private drawMultipleTranslations(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, duaData: EnhancedDuaData, colors: any, y: number): number {
    // Only show if there are user-selected translations
    if (!duaData.translations || Object.keys(duaData.translations).length === 0) {
      return y
    }

    // Section header with ornament
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('✦ Selected Translations ✦', canvas.width / 2, y)
    y += 35
    
    // Dynamic language labels - support any language
    const getLanguageFlag = (lang: string): string => {
      const flags: Record<string, string> = {
        english: '🇬🇧',
        somali: '🇸🇴',
        arabic: '🇸🇦',
        urdu: '🇵🇰',
        turkish: '🇹🇷',
        indonesian: '🇮🇩',
        french: '🇫🇷',
        spanish: '🇪🇸',
        malay: '🇲🇾',
        bengali: '🇧🇩',
        persian: '🇮🇷',
        german: '🇩🇪'
      }
      return flags[lang.toLowerCase()] || '🌍'
    }
    
    // ONLY display user-selected translations
    for (const [lang, translation] of Object.entries(duaData.translations)) {
      if (translation && translation.trim()) {
        // Language label with proper capitalization
        const langName = lang.charAt(0).toUpperCase() + lang.slice(1)
        const flag = getLanguageFlag(lang)
        
        ctx.fillStyle = colors.secondary
        ctx.font = 'bold 14px Arial'
        ctx.fillText(`${flag} ${langName}`, canvas.width / 2, y)
        y += 20
        
        // Translation text
        ctx.fillStyle = colors.text
        ctx.font = ['arabic', 'urdu', 'persian'].includes(lang.toLowerCase()) ? 'bold 16px Arial' : 'italic 16px Arial'
        const lines = this.wrapText(ctx, `"${translation}"`, canvas.width - 100)
        lines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, y)
          y += 22
        })
        y += 20
      }
    }
    
    return y
  }
  
  private drawReflectionSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, reflection: string, colors: any, y: number): number {
    // Section header
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('💭 Reflection', canvas.width / 2, y)
    y += 25
    
    // Reflection text in a box
    const boxX = 60
    const boxWidth = canvas.width - 120
    const boxPadding = 20
    
    // Background box
    ctx.fillStyle = colors.cardBg
    ctx.fillRect(boxX, y - 10, boxWidth, 80)
    ctx.strokeStyle = colors.border
    ctx.strokeRect(boxX, y - 10, boxWidth, 80)
    
    // Reflection text
    ctx.fillStyle = colors.text
    ctx.font = '14px Arial'
    const reflectionLines = this.wrapText(ctx, reflection, boxWidth - boxPadding * 2)
    reflectionLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, y + 15 + index * 20)
    })
    
    return y + 80
  }
  
  private drawBenefitsSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, benefits: string[], colors: any, y: number): number {
    // Section header
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('🌟 Benefits of this Dua', canvas.width / 2, y)
    y += 25
    
    // Benefits list
    ctx.fillStyle = colors.text
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    
    benefits.forEach(benefit => {
      ctx.fillText(`• ${benefit}`, 80, y)
      y += 22
    })
    
    ctx.textAlign = 'center'
    return y
  }
  
  private drawBestTimesSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bestTimes: string[], colors: any, y: number): number {
    // Section header
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('⏰ Best Times to Recite', canvas.width / 2, y)
    y += 25
    
    // Times list
    ctx.fillStyle = colors.text
    ctx.font = '14px Arial'
    const timesText = bestTimes.join(' • ')
    ctx.fillText(timesText, canvas.width / 2, y)
    
    return y + 30
  }
  
  private drawIslamicFooter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    const footerY = canvas.height - 120
    
    // Decorative line
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 150, footerY, 300, colors)
    
    // Islamic quote
    ctx.fillStyle = colors.secondary
    ctx.font = 'italic 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('"And your Lord says: Call upon Me; I will respond to you."', canvas.width / 2, footerY + 25)
    ctx.fillText('[Quran 40:60]', canvas.width / 2, footerY + 45)
    
    // App branding
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 16px Arial'
    ctx.fillText('BarakahTool', canvas.width / 2, footerY + 70)
    
    // Date and source
    ctx.fillStyle = colors.secondary
    ctx.font = '12px Arial'
    ctx.fillText(`Generated with Love & Prayers • ${new Date().toLocaleDateString()}`, canvas.width / 2, footerY + 90)
  }
  
  private getReflection(situation: string): string {
    const reflections: Record<string, string> = {
      'forgiveness': 'Seeking forgiveness cleanses the heart and brings one closer to Allah. Regular istighfar opens doors of mercy and blessings.',
      'guidance': 'Guidance from Allah is the greatest blessing. This dua helps illuminate the right path in times of confusion.',
      'protection': 'Allah is the ultimate protector. This dua creates a spiritual shield against all forms of harm.',
      'health': 'Health is a blessing we often take for granted. This dua seeks both physical and spiritual wellness.',
      'sustenance': 'Rizq comes only from Allah. This dua opens doors of lawful provision and barakah in wealth.',
      'default': 'Every sincere dua brings us closer to Allah. Trust in His wisdom and timing for the best outcome.'
    }
    
    // Find matching reflection based on situation keywords
    for (const [key, reflection] of Object.entries(reflections)) {
      if (situation.toLowerCase().includes(key)) {
        return reflection
      }
    }
    
    return reflections.default
  }
  
  private getBenefits(situation: string): string[] {
    return [
      'Strengthens connection with Allah',
      'Brings peace and tranquility to the heart',
      'Opens doors of mercy and blessings',
      'Protection from harm and evil',
      'Increases faith and trust in Allah'
    ]
  }
  
  private getBestTimes(): string[] {
    return [
      'Last third of the night',
      'Between Adhan and Iqamah',
      'During Sujood',
      'Friday afternoon',
      'While fasting'
    ]
  }
  
  
  private wrapArabicText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }
  
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return lines
  }
  
  private getIslamicThemeColors(theme: string) {
    const themes: any = {
      light: {
        background: '#FEFEFE',
        backgroundMid: '#FAF9F6',
        backgroundEnd: '#F5F5F0',
        text: '#2C3E50',
        primary: '#34495E',
        secondary: '#7F8C8D',
        accent: '#C9A961', // Gold
        cardBg: '#FFFFFF',
        border: '#E8DCC4'
      },
      night: {
        background: '#1A1A2E',
        backgroundMid: '#16213E',
        backgroundEnd: '#0F3460',
        text: '#F5F5F5',
        primary: '#E94560',
        secondary: '#BDC3C7',
        accent: '#FFD700', // Gold
        cardBg: '#2C3E50',
        border: '#34495E'
      },
      gold: {
        background: '#FFF8E1',
        backgroundMid: '#FFECB3',
        backgroundEnd: '#FFE082',
        text: '#5D4037',
        primary: '#6D4C41',
        secondary: '#8D6E63',
        accent: '#D4AF37', // Royal Gold
        cardBg: '#FFFEF7',
        border: '#DEB887'
      }
    }
    return themes[theme] || themes.light
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

export const authenticIslamicPdf = new AuthenticIslamicPdf()
export default authenticIslamicPdf