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
    // Create a canvas to render Arabic text properly
    const canvas = document.createElement('canvas')
    canvas.width = 794  // A4 width in pixels
    canvas.height = 1123 // A4 height in pixels
    const ctx = canvas.getContext('2d')!
    
    // Get theme colors
    const colors = this.getThemeColors(theme)
    
    // Clear canvas with background
    ctx.fillStyle = colors.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, colors.background)
    gradient.addColorStop(0.3, colors.cardBg)
    gradient.addColorStop(0.7, colors.cardBg)
    gradient.addColorStop(1, colors.background)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Add decorative patterns
    this.addIslamicPatterns(ctx, colors)
    
    let yPosition = 80
    
    // Header - Bismillah
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 24px Arial, "Traditional Arabic", "Arial Unicode MS"'
    ctx.textAlign = 'center'
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, yPosition)
    yPosition += 40
    
    // App title
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 20px Arial'
    ctx.fillText('BarakahTool - Islamic Digital Platform', canvas.width / 2, yPosition)
    yPosition += 60
    
    // Title - الدعاء
    ctx.fillStyle = colors.primary
    ctx.font = 'bold 32px Arial, "Traditional Arabic", "Arial Unicode MS"'
    ctx.fillText('الدعاء المبارك', canvas.width / 2, yPosition)
    yPosition += 60
    
    // Decorative line
    this.drawDecorativeLine(ctx, canvas.width / 2 - 100, yPosition, 200, colors.accent)
    yPosition += 40
    
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
    
    // Arabic text container background
    this.drawTextContainer(ctx, 50, yPosition - 20, canvas.width - 100, 150, colors)
    
    // Arabic text - Use larger size and ensure it's visible
    ctx.fillStyle = colors.text
    ctx.font = 'bold 28px Arial, "Traditional Arabic", "Arial Unicode MS", monospace'
    ctx.textAlign = 'center'
    ctx.direction = 'rtl'
    
    // Split Arabic text into lines and center each line
    const arabicLines = this.wrapArabicText(ctx, duaData.arabicText, canvas.width - 120)
    const lineHeight = 45
    const startY = yPosition + 30
    
    arabicLines.forEach((line, index) => {
      const y = startY + (index * lineHeight)
      // Draw text shadow for better readability
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillText(line, canvas.width / 2 + 2, y + 2)
      // Draw main text
      ctx.fillStyle = colors.text
      ctx.fillText(line, canvas.width / 2, y)
    })
    
    yPosition += 180
    
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
    
    // Translation
    ctx.fillStyle = colors.secondary
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Translation:', canvas.width / 2, yPosition)
    yPosition += 25
    
    // Translation container
    this.drawTextContainer(ctx, 50, yPosition - 10, canvas.width - 100, 120, colors)
    
    ctx.font = 'italic 18px Arial'
    ctx.fillStyle = colors.primary
    const translationLines = this.wrapText(ctx, `"${duaData.translation}"`, canvas.width - 120)
    translationLines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, yPosition + 20)
      yPosition += 30
    })
    
    yPosition += 80
    
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
  
  private addIslamicPatterns(ctx: CanvasRenderingContext2D, colors: any) {
    // Add subtle geometric patterns
    ctx.strokeStyle = colors.accent + '20'
    ctx.lineWidth = 1
    
    // Draw geometric pattern
    for (let i = 0; i < 10; i++) {
      const x = 100 + i * 60
      const y = 200 + (i % 2) * 30
      this.drawIslamicStar(ctx, x, y, 15)
    }
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
      light: {
        background: '#FFFFFF',
        text: '#1A202C',
        primary: '#2D3748',
        secondary: '#4A5568',
        accent: '#D69E2E',
        cardBg: '#F7FAFC',
        border: '#E2E8F0'
      },
      night: {
        background: '#1A202C',
        text: '#F7FAFC',
        primary: '#F7FAFC',
        secondary: '#E2E8F0',
        accent: '#F6E05E',
        cardBg: '#2D3748',
        border: '#4A5568'
      },
      gold: {
        background: '#FFFAF0',
        text: '#744210',
        primary: '#744210',
        secondary: '#975A16',
        accent: '#D69E2E',
        cardBg: '#FFF8DC',
        border: '#D69E2E'
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

export const workingArabicPdf = new WorkingArabicPdf()
export default workingArabicPdf