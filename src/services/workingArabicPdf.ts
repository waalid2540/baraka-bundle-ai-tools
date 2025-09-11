// Working Arabic PDF Generator - Guaranteed Readable Arabic Text
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

class WorkingArabicPdf {
  async generateReadableArabicPdf(duaData: DuaData, theme: string = 'light'): Promise<Blob> {
    // Create a PERFECT-SIZE canvas for professional quality
    const canvas = document.createElement('canvas')
    canvas.width = 800   // Standard A4 width
    canvas.height = 1100 // Standard A4 height
    const ctx = canvas.getContext('2d')!
    
    // Get theme colors
    const colors = this.getThemeColors(theme)
    
    // Clear canvas with beautiful background
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // STUNNING Islamic border
    this.addIslamicBorder(ctx, colors, canvas.width, canvas.height)
    
    let yPosition = 60
    
    // BEAUTIFUL Header with Bismillah
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 28px Arial, "Traditional Arabic", "Arial Unicode MS"'
    ctx.textAlign = 'center'
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, yPosition)
    yPosition += 50
    
    // Professional App title
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 18px Arial'
    ctx.fillText('BarakahTool Premium - Islamic Digital Platform', canvas.width / 2, yPosition)
    yPosition += 40
    
    // BEAUTIFUL Title - الدعاء
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 24px Arial, "Traditional Arabic", "Arial Unicode MS"'
    ctx.fillText('الدعاء الشريف', canvas.width / 2, yPosition)
    yPosition += 50
    
    // Elegant decorative line
    this.drawIslamicLine(ctx, canvas.width / 2 - 120, yPosition, 240, colors)
    yPosition += 35
    
    // Situation (if provided)
    if (duaData.situation) {
      ctx.fillStyle = colors.secondary
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      const situationLines = this.wrapText(ctx, `Request: ${duaData.situation}`, canvas.width - 100)
      situationLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, yPosition)
        yPosition += 25
      })
      yPosition += 20
    }
    
    // STUNNING Arabic text container
    this.drawBeautifulContainer(ctx, 40, yPosition, canvas.width - 80, 140, colors, 'Arabic')
    
    // LARGE Beautiful Arabic text
    ctx.fillStyle = colors.text
    ctx.font = 'bold 32px Arial, "Traditional Arabic", "Arial Unicode MS", "Noto Sans Arabic"'
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'
    
    // Split Arabic text into lines
    const arabicLines = this.wrapArabicText(ctx, duaData.arabicText, canvas.width - 100)
    const lineHeight = 45
    const startY = yPosition + 35
    
    arabicLines.forEach((line, index) => {
      const y = startY + (index * lineHeight)
      
      // Beautiful shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillText(line, canvas.width / 2 + 2, y + 2)
      
      // Main Arabic text
      ctx.fillStyle = colors.text
      ctx.fillText(line, canvas.width / 2, y)
    })
    
    yPosition += 170
    
    // Transliteration (if available)
    if (duaData.transliteration) {
      ctx.fillStyle = colors.secondary
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Pronunciation:', canvas.width / 2, yPosition)
      yPosition += 25
      
      ctx.font = 'italic 16px Arial'
      ctx.fillStyle = colors.secondary
      const translitLines = this.wrapText(ctx, duaData.transliteration, canvas.width - 100)
      translitLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, yPosition)
        yPosition += 25
      })
      yPosition += 30
    }
    
    // PROMINENT English Translation Section
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${duaData.language.toUpperCase()} TRANSLATION`, canvas.width / 2, yPosition)
    yPosition += 30
    
    // Beautiful translation container
    this.drawBeautifulContainer(ctx, 40, yPosition, canvas.width - 80, 120, colors, 'Translation')
    
    // LARGE, CLEAR translation text
    ctx.font = 'bold 18px Arial'
    ctx.fillStyle = colors.text
    const translationLines = this.wrapText(ctx, `"${duaData.translation}"`, canvas.width - 100)
    let translationY = yPosition + 25
    
    translationLines.forEach(line => {
      // Text shadow for better readability
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillText(line, canvas.width / 2 + 1, translationY + 1)
      
      // Main text
      ctx.fillStyle = colors.text
      ctx.fillText(line, canvas.width / 2, translationY)
      translationY += 25
    })
    
    yPosition += 140
    
    // Footer
    this.drawFooter(ctx, canvas, colors)
    
    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, '', 'FAST')
    
    return pdf.output('blob')
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
  
  private drawTextContainer(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: any) {
    // Background
    ctx.fillStyle = colors.cardBg
    ctx.fillRect(x, y, width, height)
    
    // Border
    ctx.strokeStyle = colors.border
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Inner decoration
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 1
    ctx.strokeRect(x + 10, y + 10, width - 20, height - 20)
  }
  
  private drawDecorativeLine(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string) {
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
    
    // Add ornamental ends
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  
  private addIslamicBorder(ctx: CanvasRenderingContext2D, colors: any, width: number, height: number) {
    // STUNNING Islamic border design
    ctx.strokeStyle = colors.primary
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, width - 20, height - 20)
    
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    ctx.strokeRect(15, 15, width - 30, height - 30)
    
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1
    ctx.strokeRect(20, 20, width - 40, height - 40)
    
    // Corner Islamic decorations
    const corners = [
      {x: 20, y: 20}, {x: width - 20, y: 20},
      {x: 20, y: height - 20}, {x: width - 20, y: height - 20}
    ]
    
    corners.forEach(corner => {
      this.drawIslamicCorner(ctx, corner.x, corner.y, colors)
    })
  }
  
  private drawIslamicCorner(ctx: CanvasRenderingContext2D, x: number, y: number, colors: any) {
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = colors.primary
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = colors.background
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  
  private drawIslamicLine(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, colors: any) {
    // Main line
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
    
    // Decorative elements
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width, y, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width/2, y, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  
  private drawBeautifulContainer(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colors: any, type: string) {
    // Beautiful gradient background
    const gradient = ctx.createLinearGradient(x, y, x, y + height)
    gradient.addColorStop(0, colors.cardBg)
    gradient.addColorStop(1, colors.background)
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, width, height)
    
    // Beautiful border
    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Inner decoration
    ctx.strokeStyle = colors.secondary
    ctx.lineWidth = 1
    ctx.strokeRect(x + 5, y + 5, width - 10, height - 10)
    
    // Corner decorations
    ctx.fillStyle = colors.accent
    ctx.beginPath()
    ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width - 10, y + 10, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + 10, y + height - 10, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width - 10, y + height - 10, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  
  private drawIslamicStar(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
    const spikes = 8
    const outerRadius = radius
    const innerRadius = radius * 0.5
    
    ctx.beginPath()
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes
      const r = i % 2 === 0 ? outerRadius : innerRadius
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    ctx.stroke()
  }
  
  private drawFooter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, colors: any) {
    const footerY = canvas.height - 100
    
    // Footer background
    ctx.fillStyle = colors.primary + '10'
    ctx.fillRect(0, footerY, canvas.width, 100)
    
    // Footer text
    ctx.fillStyle = colors.secondary
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    
    ctx.fillText('Source: Inspired by authentic Islamic teachings', canvas.width / 2, footerY + 25)
    
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 16px Arial'
    ctx.fillText('BarakahTool - Islamic Digital Platform', canvas.width / 2, footerY + 50)
    
    ctx.fillStyle = colors.secondary
    ctx.font = '12px Arial'
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, footerY + 75)
  }
  
  private getThemeColors(theme: string) {
    const themes: any = {
      royalGold: {
        background: '#FFFBEB',
        text: '#451A03',
        primary: '#A16207',
        secondary: '#FBBF24',
        accent: '#F59E0B',
        cardBg: '#FEF3C7',
        border: '#D97706'
      },
      masjidGreen: {
        background: '#F0FDF4',
        text: '#14532D',
        primary: '#15803D',
        secondary: '#22C55E',
        accent: '#FBBF24',
        cardBg: '#DCFCE7',
        border: '#16A34A'
      },
      nightPrayer: {
        background: '#F0F9FF',
        text: '#1E293B',
        primary: '#1E3A8A',
        secondary: '#60A5FA',
        accent: '#C0C0C0',
        cardBg: '#DBEAFE',
        border: '#3B82F6'
      },
      oceanDepth: {
        background: '#F0FDFA',
        text: '#134E4A',
        primary: '#0F766E',
        secondary: '#14B8A6',
        accent: '#06B6D4',
        cardBg: '#CCFBF1',
        border: '#0D9488'
      },
      roseGarden: {
        background: '#FFF1F2',
        text: '#881337',
        primary: '#BE123C',
        secondary: '#FB7185',
        accent: '#FDA4AF',
        cardBg: '#FECDD3',
        border: '#E11D48'
      },
      sunsetOrange: {
        background: '#FFF7ED',
        text: '#7C2D12',
        primary: '#C2410C',
        secondary: '#FB923C',
        accent: '#FCD34D',
        cardBg: '#FED7AA',
        border: '#EA580C'
      },
      fajrDawn: {
        background: '#FDF4FF',
        text: '#581C87',
        primary: '#9333EA',
        secondary: '#EC4899',
        accent: '#FBBF24',
        cardBg: '#F3E8FF',
        border: '#A855F7'
      },
      midnightBlack: {
        background: '#FAFAFA',
        text: '#171717',
        primary: '#000000',
        secondary: '#525252',
        accent: '#FBBF24',
        cardBg: '#F5F5F5',
        border: '#404040'
      },
      // Legacy themes for backward compatibility
      light: {
        background: '#FFFBEB',
        text: '#451A03',
        primary: '#A16207',
        secondary: '#FBBF24',
        accent: '#F59E0B',
        cardBg: '#FEF3C7',
        border: '#D97706'
      },
      night: {
        background: '#F0F9FF',
        text: '#1E293B',
        primary: '#1E3A8A',
        secondary: '#60A5FA',
        accent: '#C0C0C0',
        cardBg: '#DBEAFE',
        border: '#3B82F6'
      },
      gold: {
        background: '#FFFBEB',
        text: '#451A03',
        primary: '#A16207',
        secondary: '#FBBF24',
        accent: '#F59E0B',
        cardBg: '#FEF3C7',
        border: '#D97706'
      }
    }
    return themes[theme] || themes.royalGold
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

export const workingArabicPdf = new WorkingArabicPdf()
export default workingArabicPdf