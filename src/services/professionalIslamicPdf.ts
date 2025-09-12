// Professional Islamic PDF Generator - Museum Quality Design
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

type ColorTheme = 'gold' | 'blue' | 'green' | 'purple'

interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  text: string
  arabicText: string
  background: string
  gradient1: string
  gradient2: string
}

class ProfessionalIslamicPdf {
  private themes: Record<ColorTheme, ThemeColors> = {
    gold: {
      primary: '#0A4A3C',      // Deep Islamic green
      secondary: '#D4AF37',    // Royal gold
      accent: '#FFD700',       // Bright gold
      text: '#2C2C2C',         // Professional dark gray
      arabicText: '#0A4A3C',   // Deep green for Arabic
      background: '#FEFEF8',   // Cream white
      gradient1: '#F8F4E6',    // Light cream
      gradient2: '#FFF8DC'     // Cornsilk
    },
    blue: {
      primary: '#003366',      // Deep navy blue
      secondary: '#4A90E2',    // Royal blue
      accent: '#87CEEB',       // Sky blue
      text: '#1F2937',         // Dark gray
      arabicText: '#003366',   // Navy for Arabic
      background: '#F0F8FF',   // Alice blue
      gradient1: '#E6F3FF',    // Light blue
      gradient2: '#D1E7FF'     // Pale blue
    },
    green: {
      primary: '#2E7D32',      // Forest green
      secondary: '#66BB6A',    // Light green
      accent: '#A5D6A7',       // Pale green
      text: '#1B5E20',         // Dark green
      arabicText: '#2E7D32',   // Forest green for Arabic
      background: '#F1F8E9',   // Light green tint
      gradient1: '#E8F5E9',    // Very light green
      gradient2: '#C8E6C9'     // Pale green
    },
    purple: {
      primary: '#4A148C',      // Deep purple
      secondary: '#9C27B0',    // Medium purple
      accent: '#E1BEE7',       // Light purple
      text: '#311B92',         // Dark purple
      arabicText: '#4A148C',   // Deep purple for Arabic
      background: '#F3E5F5',   // Light lavender
      gradient1: '#E1BEE7',    // Pale purple
      gradient2: '#CE93D8'     // Light purple
    }
  }

  async generateProfessionalPdf(duaData: DuaData, theme: ColorTheme = 'gold'): Promise<Blob> {
    // Create high-resolution canvas for professional quality
    const canvas = document.createElement('canvas')
    canvas.width = 850   // Professional width
    canvas.height = 1450  // Professional height for all content
    const ctx = canvas.getContext('2d')!
    
    // Get colors for selected theme
    const colors = this.themes[theme]
    
    // PROFESSIONAL BACKGROUND
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    bgGradient.addColorStop(0, colors.background)
    bgGradient.addColorStop(0.5, colors.gradient1)
    bgGradient.addColorStop(1, colors.gradient2)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // PROFESSIONAL ISLAMIC BORDER
    this.drawProfessionalBorder(ctx, canvas, colors)
    
    // STUNNING HEADER
    let yPosition = 70
    
    // Bismillah in beautiful calligraphy style
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 32px Georgia, "Traditional Arabic", serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(212, 175, 55, 0.3)'
    ctx.shadowBlur = 4
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, yPosition)
    ctx.shadowBlur = 0
    
    yPosition += 50
    
    // Professional title
    const titleGradient = ctx.createLinearGradient(200, yPosition - 20, 650, yPosition)
    titleGradient.addColorStop(0, colors.secondary)
    titleGradient.addColorStop(0.5, colors.accent)
    titleGradient.addColorStop(1, colors.secondary)
    ctx.fillStyle = titleGradient
    ctx.font = 'bold 28px Georgia, serif'
    ctx.fillText('Sacred Islamic Supplication', canvas.width / 2, yPosition)
    
    yPosition += 35
    
    // Subtitle with elegant font
    ctx.fillStyle = colors.primary
    ctx.font = 'italic 16px Georgia, serif'
    ctx.fillText('A Divine Connection Through Prayer', canvas.width / 2, yPosition)
    
    yPosition += 50
    
    // PROFESSIONAL DECORATIVE ELEMENT
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 150, yPosition, 300, colors)
    yPosition += 40
    
    // REQUEST SECTION
    if (duaData.situation) {
      this.drawElegantSection(ctx, 60, yPosition, canvas.width - 120, 60, colors, 'REQUEST')
      ctx.fillStyle = colors.text
      ctx.font = '14px Georgia, serif'
      ctx.textAlign = 'center'
      const requestLines = this.wrapText(ctx, duaData.situation, canvas.width - 140)
      requestLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yPosition + 30 + (index * 20))
      })
      yPosition += 80
    }
    
    // ARABIC DUA SECTION - CENTERPIECE
    yPosition += 20
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 20px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('❦ The Sacred Supplication ❦', canvas.width / 2, yPosition)
    yPosition += 35
    
    this.drawElegantSection(ctx, 50, yPosition, canvas.width - 100, 150, colors, 'ARABIC')
    
    // Beautiful Arabic text
    ctx.fillStyle = colors.arabicText
    ctx.font = 'bold 36px "Traditional Arabic", Georgia, serif'
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'
    
    const arabicLines = this.wrapArabicText(ctx, duaData.arabicText, canvas.width - 120)
    let arabicY = yPosition + 45
    
    arabicLines.forEach(line => {
      // Gold shadow for elegance
      ctx.shadowColor = 'rgba(212, 175, 55, 0.2)'
      ctx.shadowBlur = 3
      ctx.fillStyle = colors.arabicText
      ctx.fillText(line, canvas.width / 2, arabicY)
      ctx.shadowBlur = 0
      arabicY += 50
    })
    
    yPosition += 180
    
    // TRANSLITERATION SECTION
    if (duaData.transliteration) {
      ctx.fillStyle = colors.primary
      ctx.font = 'bold 16px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText('Pronunciation Guide', canvas.width / 2, yPosition)
      yPosition += 25
      
      ctx.fillStyle = colors.text
      ctx.font = 'italic 15px Georgia, serif'
      const translitLines = this.wrapText(ctx, duaData.transliteration, canvas.width - 120)
      translitLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, yPosition)
        yPosition += 22
      })
      yPosition += 20
    }
    
    // TRANSLATION SECTION - PROMINENT
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 100, yPosition, 200, colors)
    yPosition += 35
    
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 20px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${duaData.language} Translation`, canvas.width / 2, yPosition)
    yPosition += 30
    
    this.drawElegantSection(ctx, 50, yPosition, canvas.width - 100, 100, colors, 'TRANSLATION')
    
    ctx.fillStyle = colors.text
    ctx.font = 'bold 16px Georgia, serif'
    const translationLines = this.wrapText(ctx, `"${duaData.translation}"`, canvas.width - 120)
    let transY = yPosition + 30
    
    translationLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, transY)
      transY += 24
    })
    
    yPosition += 120
    
    // ISLAMIC REFLECTIONS
    yPosition += 20
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 120, yPosition, 240, colors)
    yPosition += 35
    
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 20px Georgia, serif'
    ctx.fillText('Spiritual Reflections & Wisdom', canvas.width / 2, yPosition)
    yPosition += 35
    
    this.drawElegantSection(ctx, 40, yPosition, canvas.width - 80, 200, colors, 'REFLECTIONS')
    
    const reflections = this.getReflections(duaData.situation)
    ctx.fillStyle = colors.text
    ctx.font = '14px Georgia, serif'
    ctx.textAlign = 'left'
    
    let reflY = yPosition + 30
    reflections.forEach(reflection => {
      // Gold bullet
      ctx.fillStyle = colors.secondary
      ctx.font = 'bold 18px Georgia'
      ctx.fillText('◆', 60, reflY)
      
      // Reflection text
      ctx.fillStyle = colors.text
      ctx.font = '13px Georgia, serif'
      const reflLines = this.wrapText(ctx, reflection, canvas.width - 160)
      reflLines.forEach((line, index) => {
        ctx.fillText(line, 85, reflY + (index * 18))
      })
      reflY += reflLines.length * 18 + 15
    })
    
    yPosition += 230
    
    // SPIRITUAL GUIDANCE
    this.drawElegantSection(ctx, 40, yPosition, canvas.width - 80, 100, colors, 'GUIDANCE')
    
    const guidance = [
      '• Recite with complete sincerity and presence of heart',
      '• Best times: Last third of night, between Adhan and Iqamah',
      '• Face the Qibla and be in a state of Wudu if possible',
      '• Repeat 3, 7, or 33 times for increased blessing'
    ]
    
    ctx.fillStyle = colors.text
    ctx.font = '12px Georgia, serif'
    let guideY = yPosition + 25
    
    guidance.forEach(guide => {
      ctx.fillText(guide, 60, guideY)
      guideY += 20
    })
    
    // PROFESSIONAL FOOTER
    this.drawProfessionalFooter(ctx, canvas, colors)
    
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
  
  private drawProfessionalBorder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    // Outer gold border
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 4
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30)
    
    // Inner green border
    ctx.strokeStyle = colors.primary
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Decorative corners
    const corners = [
      {x: 25, y: 25}, {x: canvas.width - 25, y: 25},
      {x: 25, y: canvas.height - 25}, {x: canvas.width - 25, y: canvas.height - 25}
    ]
    
    corners.forEach(corner => {
      // Gold corner ornament
      ctx.fillStyle = colors.secondary
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner green
      ctx.fillStyle = colors.primary
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, 6, 0, Math.PI * 2)
      ctx.fill()
      
      // Center dot
      ctx.fillStyle = colors.accent
      ctx.beginPath()
      ctx.arc(corner.x, corner.y, 2, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  
  private drawOrnamentalDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, colors: any) {
    // Center ornament
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 24px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('❦', x + width/2, y + 5)
    
    // Lines
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width/2 - 20, y)
    ctx.moveTo(x + width/2 + 20, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
  }
  
  private drawElegantSection(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: any, type: string) {
    // Elegant gradient background
    const gradient = ctx.createLinearGradient(x, y, x, y + height)
    gradient.addColorStop(0, 'rgba(248, 244, 230, 0.3)')
    gradient.addColorStop(1, 'rgba(255, 248, 220, 0.3)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, width, height)
    
    // Elegant border
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1.5
    ctx.strokeRect(x, y, width, height)
    
    // Corner accents
    const cornerSize = 15
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    
    // Top-left
    ctx.beginPath()
    ctx.moveTo(x, y + cornerSize)
    ctx.lineTo(x, y)
    ctx.lineTo(x + cornerSize, y)
    ctx.stroke()
    
    // Top-right
    ctx.beginPath()
    ctx.moveTo(x + width - cornerSize, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + cornerSize)
    ctx.stroke()
    
    // Bottom-left
    ctx.beginPath()
    ctx.moveTo(x, y + height - cornerSize)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x + cornerSize, y + height)
    ctx.stroke()
    
    // Bottom-right
    ctx.beginPath()
    ctx.moveTo(x + width - cornerSize, y + height)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x + width, y + height - cornerSize)
    ctx.stroke()
  }
  
  private drawProfessionalFooter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    const footerY = canvas.height - 100
    
    // Divider
    this.drawOrnamentalDivider(ctx, canvas.width / 2 - 150, footerY, 300, colors)
    
    // Arabic blessing
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 18px Georgia, "Traditional Arabic", serif'
    ctx.textAlign = 'center'
    ctx.fillText('وَصَلَّى اللَّهُ عَلَى نَبِيِّنَا مُحَمَّدٍ', canvas.width / 2, footerY + 30)
    
    // App branding
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 16px Georgia, serif'
    ctx.fillText('BarakahTool • Premium Islamic Platform', canvas.width / 2, footerY + 55)
    
    // Date
    ctx.fillStyle = colors.text
    ctx.font = '11px Georgia, serif'
    ctx.fillText(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, canvas.width / 2, footerY + 75)
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
  
  private getReflections(situation: string): string[] {
    const lower = situation.toLowerCase()
    
    if (lower.includes('patience') || lower.includes('strength')) {
      return [
        'Patience is a virtue that brings us closer to Allah\'s mercy',
        'Through trials, Allah strengthens the hearts of believers',
        'Every hardship is followed by ease, as promised in the Quran',
        'Patience in adversity is half of faith and a sign of true belief'
      ]
    }
    
    if (lower.includes('guidance') || lower.includes('wisdom')) {
      return [
        'Allah guides whom He wills to the straight path',
        'Seeking guidance shows humility and wisdom',
        'The Quran is the ultimate source of divine guidance',
        'Through sincere du\'a, hearts find their true direction'
      ]
    }
    
    // Default reflections
    return [
      'Du\'a is the essence of worship and our connection to Allah',
      'Sincere supplication can change divine decree',
      'Allah responds to every call made with a present heart',
      'Through du\'a, we acknowledge our need for divine mercy'
    ]
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

export const professionalIslamicPdf = new ProfessionalIslamicPdf()
export default professionalIslamicPdf