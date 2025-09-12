// Creative Islamic PDF Generator - Multiple Distinct Designs for Content Creators
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

type CreativeTheme = 'golden_mosque' | 'sunset_desert' | 'ocean_waves' | 'forest_green' | 'royal_purple' | 'rainbow_gradient' | 'minimalist_black' | 'vintage_cream'

interface CreativeDesign {
  name: string
  description: string
  background: {
    type: 'gradient' | 'pattern' | 'solid'
    colors: string[]
    pattern?: string
  }
  primary: string
  secondary: string
  accent: string
  text: string
  arabicText: string
  decorativeElements: string[]
  typography: {
    arabic: string
    english: string
    decorative: string
  }
  layout: 'centered' | 'split' | 'layered' | 'artistic'
  socialMediaFriendly: boolean
}

class CreativeIslamicPdf {
  private designs: Record<CreativeTheme, CreativeDesign> = {
    golden_mosque: {
      name: 'Golden Mosque',
      description: 'Luxurious gold with mosque silhouettes',
      background: {
        type: 'gradient',
        colors: ['#FFFEF7', '#FFF8E7', '#F5F5DC', '#FAEBD7']
      },
      primary: '#8B4513',
      secondary: '#DAA520',
      accent: '#FFD700',
      text: '#1A0E0A',
      arabicText: '#000000',
      decorativeElements: ['🕌', '☪️', '✨', '🌙', '⭐'],
      typography: {
        arabic: 'bold 42px "Traditional Arabic", Georgia, serif',
        english: 'bold 18px "Playfair Display", Georgia, serif',
        decorative: 'bold 24px "Brush Script MT", cursive'
      },
      layout: 'centered',
      socialMediaFriendly: true
    },
    
    sunset_desert: {
      name: 'Sunset Desert',
      description: 'Warm desert sunset with flowing dunes',
      background: {
        type: 'gradient',
        colors: ['#FFF8F0', '#FFEEE6', '#FFE4D6', '#FFDAB9']
      },
      primary: '#8B4513',
      secondary: '#CD853F',
      accent: '#FF6347',
      text: '#2F1B14',
      arabicText: '#000000',
      decorativeElements: ['🏜️', '🐪', '☀️', '🌅', '🔥'],
      typography: {
        arabic: 'bold 40px "Traditional Arabic", serif',
        english: 'italic 16px "Georgia", serif',
        decorative: 'bold 22px "Papyrus", fantasy'
      },
      layout: 'layered',
      socialMediaFriendly: true
    },

    ocean_waves: {
      name: 'Ocean Waves',
      description: 'Tranquil blue waves with pearl accents',
      background: {
        type: 'gradient',
        colors: ['#F0F8FF', '#E6F3FF', '#DBEAFE', '#BFDBFE']
      },
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#F0F9FF',
      text: '#1E293B',
      arabicText: '#000000',
      decorativeElements: ['🌊', '🐚', '💎', '🌙', '⭐'],
      typography: {
        arabic: 'bold 38px "Traditional Arabic", serif',
        english: 'normal 17px "Times New Roman", serif',
        decorative: 'bold 20px "Lucida Handwriting", cursive'
      },
      layout: 'split',
      socialMediaFriendly: true
    },

    forest_green: {
      name: 'Forest Green',
      description: 'Natural green with botanical elements',
      background: {
        type: 'gradient',
        colors: ['#F0FDF4', '#ECFDF5', '#D1FAE5', '#A7F3D0']
      },
      primary: '#065F46',
      secondary: '#047857',
      accent: '#ECFDF5',
      text: '#1F2937',
      arabicText: '#000000',
      decorativeElements: ['🌿', '🍃', '🌳', '🌱', '🦋'],
      typography: {
        arabic: 'bold 41px "Traditional Arabic", serif',
        english: 'normal 16px "Trebuchet MS", sans-serif',
        decorative: 'bold 21px "Brush Script MT", cursive'
      },
      layout: 'artistic',
      socialMediaFriendly: true
    },

    royal_purple: {
      name: 'Royal Purple',
      description: 'Majestic purple with crown elements',
      background: {
        type: 'gradient',
        colors: ['#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE']
      },
      primary: '#6B21A8',
      secondary: '#7C2D92',
      accent: '#F3E8FF',
      text: '#1F2937',
      arabicText: '#000000',
      decorativeElements: ['👑', '💜', '✨', '🌟', '💎'],
      typography: {
        arabic: 'bold 39px "Traditional Arabic", serif',
        english: 'bold 18px "Georgia", serif',
        decorative: 'bold 23px "Lucida Calligraphy", cursive'
      },
      layout: 'centered',
      socialMediaFriendly: true
    },

    rainbow_gradient: {
      name: 'Rainbow Gradient',
      description: 'Vibrant rainbow colors for joy',
      background: {
        type: 'gradient',
        colors: ['#FFFFFF', '#FEFEFE', '#FDFDFD', '#F8F8FF']
      },
      primary: '#4A5568',
      secondary: '#2D3748',
      accent: '#FF6B6B',
      text: '#1A202C',
      arabicText: '#000000',
      decorativeElements: ['🌈', '🎨', '✨', '🎭', '🎪'],
      typography: {
        arabic: 'bold 44px "Traditional Arabic", serif',
        english: 'bold 19px "Impact", sans-serif',
        decorative: 'bold 25px "Comic Sans MS", cursive'
      },
      layout: 'artistic',
      socialMediaFriendly: true
    },

    minimalist_black: {
      name: 'Minimalist Black',
      description: 'Clean black and white modern design',
      background: {
        type: 'gradient',
        colors: ['#FFFFFF', '#F9FAFB', '#F3F4F6', '#E5E7EB']
      },
      primary: '#000000',
      secondary: '#374151',
      accent: '#FFFFFF',
      text: '#1F2937',
      arabicText: '#000000',
      decorativeElements: ['◆', '●', '■', '▲', '◊'],
      typography: {
        arabic: 'bold 40px "Traditional Arabic", serif',
        english: 'normal 16px "Helvetica", sans-serif',
        decorative: 'bold 20px "Arial Black", sans-serif'
      },
      layout: 'split',
      socialMediaFriendly: true
    },

    vintage_cream: {
      name: 'Vintage Cream',
      description: 'Classic vintage with ornate borders',
      background: {
        type: 'gradient',
        colors: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#F9E2AF']
      },
      primary: '#92400E',
      secondary: '#B45309',
      accent: '#FFFBEB',
      text: '#451A03',
      arabicText: '#000000',
      decorativeElements: ['🌹', '📜', '🎭', '🏛️', '🖋️'],
      typography: {
        arabic: 'bold 37px "Traditional Arabic", serif',
        english: 'italic 15px "Times New Roman", serif',
        decorative: 'bold 19px "Old English Text MT", serif'
      },
      layout: 'layered',
      socialMediaFriendly: true
    }
  }

  async generateCreativePdf(duaData: DuaData, theme: CreativeTheme = 'golden_mosque'): Promise<Blob> {
    const design = this.designs[theme]
    
    // Create compact canvas for professional PDFs
    const canvas = document.createElement('canvas')
    canvas.width = 800    // Professional width
    canvas.height = 600   // Short, compact height
    const ctx = canvas.getContext('2d')!
    
    // Apply background based on design
    this.drawCreativeBackground(ctx, canvas, design)
    
    // Simple border
    ctx.strokeStyle = design.secondary
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    
    let yPosition = 50
    
    // Simple title
    ctx.fillStyle = design.primary
    ctx.font = 'bold 24px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText('Islamic Du\'a', canvas.width / 2, yPosition)
    yPosition += 60
    
    // Only essential content - clean and compact
    yPosition = this.drawCompactLayout(ctx, canvas, design, duaData, yPosition)
    
    // Convert to PDF with perfect quality
    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height, '', 'FAST')
    
    return pdf.output('blob')
  }

  private drawCreativeBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign) {
    if (design.background.type === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      const colors = design.background.colors
      
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color)
      })
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    // Add texture overlay for some themes
    if (['sunset_desert', 'vintage_cream'].includes(design.name.toLowerCase().replace(' ', '_'))) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      for (let i = 0; i < 50; i++) {
        ctx.beginPath()
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private drawDecorativeBorder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign) {
    // Outer decorative border
    ctx.strokeStyle = design.secondary
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
    
    // Inner accent border  
    ctx.strokeStyle = design.accent
    ctx.lineWidth = 3
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
    
    // Corner decorations with theme elements
    const corners = [
      {x: 40, y: 40}, {x: canvas.width - 40, y: 40},
      {x: 40, y: canvas.height - 40}, {x: canvas.width - 40, y: canvas.height - 40}
    ]
    
    ctx.fillStyle = design.secondary
    ctx.font = '30px serif'
    ctx.textAlign = 'center'
    
    corners.forEach((corner, index) => {
      if (design.decorativeElements[index]) {
        ctx.fillText(design.decorativeElements[index], corner.x, corner.y + 10)
      }
    })
  }

  private drawCreativeHeader(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, yPosition: number): number {
    // Bismillah with theme styling
    ctx.fillStyle = design.primary
    ctx.font = design.typography.decorative
    ctx.textAlign = 'center'
    ctx.shadowColor = design.accent
    ctx.shadowBlur = 3
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, yPosition)
    ctx.shadowBlur = 0
    
    yPosition += 60
    
    // Theme-specific title
    const gradient = ctx.createLinearGradient(200, yPosition, 880, yPosition)
    gradient.addColorStop(0, design.primary)
    gradient.addColorStop(0.5, design.secondary)
    gradient.addColorStop(1, design.primary)
    
    ctx.fillStyle = gradient
    ctx.font = design.typography.english
    ctx.fillText(`${design.name} • Sacred Du'a Collection`, canvas.width / 2, yPosition)
    
    yPosition += 40
    
    // Decorative separator with theme elements
    const separator = design.decorativeElements.join('  ')
    ctx.fillStyle = design.accent
    ctx.font = '20px serif'
    ctx.fillText(separator, canvas.width / 2, yPosition)
    
    return yPosition + 50
  }

  private drawCompactLayout(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number): number {
    // Arabic text only - clean and simple
    ctx.fillStyle = design.arabicText
    ctx.font = 'bold 28px Georgia'
    ctx.textAlign = 'center'
    ctx.fillText(duaData.arabicText, canvas.width / 2, yPosition)
    yPosition += 60
    
    // Translation only - no extra content
    ctx.fillStyle = design.text
    ctx.font = '16px Georgia'
    const lines = this.wrapText(ctx, duaData.translation, canvas.width - 60)
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, yPosition)
      yPosition += 25
    })
    
    return yPosition
  }

  private drawCenteredLayout(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number): number {
    // Arabic text in center
    this.drawStyledSection(ctx, canvas, design, 'Arabic Du\'a', duaData.arabicText, yPosition, 'arabic')
    yPosition += 200
    
    // Always show transliteration (pronunciation guide)
    const transliteration = duaData.transliteration || this.generateTransliteration(duaData.arabicText)
    this.drawStyledSection(ctx, canvas, design, 'Pronunciation Guide', transliteration, yPosition, 'transliteration')
    yPosition += 120
    
    // Translation
    this.drawStyledSection(ctx, canvas, design, `Translation (${duaData.language})`, duaData.translation, yPosition, 'translation')
    yPosition += 150
    
    // Add Islamic reflections and wisdom
    this.drawReflections(ctx, canvas, design, duaData, yPosition)
    yPosition += 180
    
    return yPosition
  }

  private drawSplitLayout(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number): number {
    const centerX = canvas.width / 2
    
    // Left side - Arabic
    ctx.save()
    this.drawStyledBox(ctx, 60, yPosition, centerX - 100, 200, design)
    ctx.fillStyle = design.arabicText
    ctx.font = design.typography.arabic
    ctx.textAlign = 'center'
    const arabicLines = this.wrapText(ctx, duaData.arabicText, centerX - 140)
    let arabicY = yPosition + 50
    arabicLines.forEach(line => {
      ctx.fillText(line, centerX / 2, arabicY)
      arabicY += 45
    })
    ctx.restore()
    
    // Right side - Translation
    ctx.save()
    this.drawStyledBox(ctx, centerX + 40, yPosition, centerX - 100, 200, design)
    ctx.fillStyle = design.text
    ctx.font = design.typography.english
    ctx.textAlign = 'center'
    const translationLines = this.wrapText(ctx, duaData.translation, centerX - 140)
    let transY = yPosition + 50
    translationLines.forEach(line => {
      ctx.fillText(line, centerX + centerX / 2, transY)
      transY += 25
    })
    ctx.restore()
    
    yPosition += 250
    
    // Transliteration below
    const transliteration = duaData.transliteration || this.generateTransliteration(duaData.arabicText)
    this.drawStyledSection(ctx, canvas, design, 'Pronunciation Guide', transliteration, yPosition, 'transliteration')
    yPosition += 120
    
    // Add reflections
    this.drawReflections(ctx, canvas, design, duaData, yPosition)
    yPosition += 180
    
    return yPosition
  }

  private drawLayeredLayout(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number): number {
    // Light background layer for better readability
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.fillRect(50, yPosition, canvas.width - 100, 300)
    
    // Subtle border
    ctx.strokeStyle = design.secondary
    ctx.lineWidth = 2
    ctx.strokeRect(50, yPosition, canvas.width - 100, 300)
    
    // Arabic text with background for visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(60, yPosition + 20, canvas.width - 120, 80)
    
    ctx.fillStyle = design.arabicText
    ctx.font = design.typography.arabic
    ctx.textAlign = 'center'
    ctx.fillText(duaData.arabicText, canvas.width / 2, yPosition + 70)
    
    // Overlay decorative elements (lighter)
    ctx.fillStyle = `${design.secondary}60`
    ctx.font = '25px serif'
    design.decorativeElements.slice(0, 3).forEach((elem, i) => {
      ctx.fillText(elem, 100 + (i * 300), yPosition + 140)
    })
    
    // Translation with background for visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(60, yPosition + 170, canvas.width - 120, 100)
    
    ctx.fillStyle = design.text
    ctx.font = design.typography.english
    const lines = this.wrapText(ctx, duaData.translation, canvas.width - 140)
    let lineY = yPosition + 200
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, lineY)
      lineY += 25
    })
    
    yPosition += 350
    
    // Add transliteration
    const transliteration = duaData.transliteration || this.generateTransliteration(duaData.arabicText)
    this.drawStyledSection(ctx, canvas, design, 'Pronunciation Guide', transliteration, yPosition, 'transliteration')
    yPosition += 120
    
    // Add reflections
    this.drawReflections(ctx, canvas, design, duaData, yPosition)
    yPosition += 180
    
    return yPosition
  }

  private drawArtisticLayout(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number): number {
    // Artistic curved background
    ctx.beginPath()
    ctx.moveTo(50, yPosition)
    ctx.quadraticCurveTo(canvas.width / 2, yPosition - 30, canvas.width - 50, yPosition)
    ctx.quadraticCurveTo(canvas.width / 2, yPosition + 250, 50, yPosition + 220)
    ctx.fillStyle = `${design.primary}30`
    ctx.fill()
    
    // Arabic text following curve with background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(60, yPosition + 60, canvas.width - 120, 80)
    
    ctx.fillStyle = design.arabicText
    ctx.font = design.typography.arabic
    ctx.textAlign = 'center'
    ctx.fillText(duaData.arabicText, canvas.width / 2, yPosition + 110)
    
    // Scattered decorative elements (lighter)
    design.decorativeElements.forEach((elem, i) => {
      ctx.fillStyle = `${design.secondary}60`
      ctx.font = '25px serif'
      const x = 100 + (i * 120) + Math.sin(i) * 30
      const y = yPosition + 160 + Math.cos(i) * 20
      ctx.fillText(elem, x, y)
    })
    
    // Translation with background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(60, yPosition + 180, canvas.width - 120, 80)
    
    ctx.fillStyle = design.text
    ctx.font = design.typography.english
    ctx.textAlign = 'center'
    const lines = this.wrapText(ctx, duaData.translation, canvas.width - 140)
    let lineY = yPosition + 210
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, lineY)
      lineY += 25
    })
    
    yPosition += 300
    
    // Add transliteration
    const transliteration = duaData.transliteration || this.generateTransliteration(duaData.arabicText)
    this.drawStyledSection(ctx, canvas, design, 'Pronunciation Guide', transliteration, yPosition, 'transliteration')
    yPosition += 120
    
    // Add reflections
    this.drawReflections(ctx, canvas, design, duaData, yPosition)
    yPosition += 180
    
    return yPosition
  }

  private drawStyledSection(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, title: string, content: string, yPosition: number, type: 'arabic' | 'transliteration' | 'translation') {
    // Section background
    this.drawStyledBox(ctx, 60, yPosition, canvas.width - 120, type === 'arabic' ? 160 : 100, design)
    
    // Section title
    ctx.fillStyle = design.secondary
    ctx.font = design.typography.english
    ctx.textAlign = 'center'
    ctx.fillText(`✦ ${title} ✦`, canvas.width / 2, yPosition + 25)
    
    // Content
    const font = type === 'arabic' ? design.typography.arabic : design.typography.english
    const color = type === 'arabic' ? design.arabicText : design.text
    
    ctx.fillStyle = color
    ctx.font = font
    ctx.textAlign = 'center'
    
    const lines = this.wrapText(ctx, content, canvas.width - 140)
    let contentY = yPosition + 60
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, contentY)
      contentY += type === 'arabic' ? 45 : 25
    })
  }

  private drawStyledBox(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, design: CreativeDesign) {
    // Light background for better text readability
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(x, y, width, height)
    
    // Subtle inner shadow for depth
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4)
    
    // Border with design colors
    ctx.strokeStyle = design.secondary
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    
    // Corner accents with better visibility
    ctx.fillStyle = design.primary
    const cornerSize = 10
    // Top corners
    ctx.fillRect(x, y, cornerSize, 3)
    ctx.fillRect(x, y, 3, cornerSize)
    ctx.fillRect(x + width - cornerSize, y, cornerSize, 3)
    ctx.fillRect(x + width - 3, y, 3, cornerSize)
    // Bottom corners  
    ctx.fillRect(x, y + height - 3, cornerSize, 3)
    ctx.fillRect(x, y + height - cornerSize, 3, cornerSize)
    ctx.fillRect(x + width - cornerSize, y + height - 3, cornerSize, 3)
    ctx.fillRect(x + width - 3, y + height - cornerSize, 3, cornerSize)
  }

  private drawCreativeFooter(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign) {
    const footerY = canvas.height - 120
    
    // Decorative line with elements
    ctx.strokeStyle = design.secondary
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(80, footerY)
    ctx.lineTo(canvas.width - 80, footerY)
    ctx.stroke()
    
    // Central decorative element
    ctx.fillStyle = design.primary
    ctx.font = '30px serif'
    ctx.textAlign = 'center'
    ctx.fillText(design.decorativeElements[0], canvas.width / 2, footerY - 10)
    
    // Footer text
    ctx.fillStyle = design.text
    ctx.font = design.typography.english.replace('18px', '14px')
    ctx.fillText('BarakahTool • Creative Islamic Design Collection', canvas.width / 2, footerY + 30)
    
    // Date and design name
    ctx.font = '12px sans-serif'
    ctx.fillStyle = design.secondary
    ctx.fillText(`${design.name} Design • ${new Date().toLocaleDateString()}`, canvas.width / 2, footerY + 50)
    
    // Social media hashtag suggestions
    ctx.font = '10px sans-serif'
    ctx.fillStyle = `${design.text}80`
    ctx.fillText('#IslamicDesign #DuaArt #BarakahTool #IslamicContent', canvas.width / 2, footerY + 70)
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

  private generateTransliteration(arabicText: string): string {
    // Simple transliteration mapping - you can enhance this
    const transliterationMap: { [key: string]: string } = {
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ': 'Bismillahi Rahmani Raheem',
      'اللَّهُمَّ': 'Allahumma',
      'رَبَّنَا': 'Rabbana',
      'سُبْحَانَ اللَّهِ': 'Subhan Allah',
      'الْحَمْدُ لِلَّهِ': 'Alhamdulillah',
      'اللَّهُ أَكْبَرُ': 'Allahu Akbar'
    }
    
    // Check if we have a direct mapping
    for (const [arabic, transliteration] of Object.entries(transliterationMap)) {
      if (arabicText.includes(arabic)) {
        return transliteration
      }
    }
    
    // Default transliteration guide
    return 'Arabic pronunciation guide available'
  }

  private drawReflections(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, design: CreativeDesign, duaData: DuaData, yPosition: number) {
    // Header for reflections
    ctx.fillStyle = design.secondary
    ctx.font = design.typography.english.replace('18px', '16px')
    ctx.textAlign = 'center'
    ctx.fillText('✦ Islamic Reflections & Wisdom ✦', canvas.width / 2, yPosition)
    yPosition += 30
    
    // Get reflections based on the du'a content
    const reflections = this.getReflections(duaData.situation || duaData.translation)
    
    // Draw reflection box
    this.drawStyledBox(ctx, 60, yPosition, canvas.width - 120, 120, design)
    
    // Draw reflections
    ctx.fillStyle = design.text
    ctx.font = design.typography.english.replace('18px', '14px')
    ctx.textAlign = 'left'
    
    let reflectionY = yPosition + 25
    reflections.slice(0, 2).forEach((reflection, index) => {
      // Bullet point
      ctx.fillStyle = design.secondary
      ctx.font = 'bold 14px serif'
      ctx.fillText('•', 80, reflectionY)
      
      // Reflection text
      ctx.fillStyle = design.text
      ctx.font = design.typography.english.replace('18px', '13px')
      const lines = this.wrapText(ctx, reflection, canvas.width - 180)
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, 95, reflectionY + (lineIndex * 18))
      })
      reflectionY += lines.length * 18 + 10
    })
  }

  private getReflections(situation: string): string[] {
    const lower = situation.toLowerCase()
    
    if (lower.includes('forgiveness') || lower.includes('maghfirah')) {
      return [
        'Allah\'s mercy encompasses all things, and seeking forgiveness purifies the heart',
        'Every sincere repentance brings the believer closer to Allah\'s infinite compassion'
      ]
    }
    
    if (lower.includes('guidance') || lower.includes('hidayah')) {
      return [
        'True guidance comes from Allah alone, and sincere supplication opens the doors of wisdom',
        'The Quran is our eternal guide, and du\'a is the key to understanding its teachings'
      ]
    }
    
    if (lower.includes('protection') || lower.includes('safety')) {
      return [
        'Allah is the ultimate protector, and His refuge is the safest sanctuary',
        'Seeking Allah\'s protection strengthens faith and brings peace to the heart'
      ]
    }
    
    if (lower.includes('health') || lower.includes('healing')) {
      return [
        'Allah is Ash-Shafi, the ultimate healer of both body and soul',
        'Patience during illness and gratitude in health are signs of true faith'
      ]
    }
    
    if (lower.includes('sustenance') || lower.includes('rizq')) {
      return [
        'Allah provides sustenance in ways beyond our imagination and understanding',
        'Seeking halal rizq with trust in Allah brings both worldly and spiritual prosperity'
      ]
    }
    
    // Default reflections
    return [
      'Du\'a is the essence of worship and our direct connection to the Divine',
      'Through sincere supplication, hearts find peace and souls find their true direction'
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

  getAvailableThemes(): Array<{id: CreativeTheme, name: string, description: string}> {
    return Object.entries(this.designs).map(([id, design]) => ({
      id: id as CreativeTheme,
      name: design.name,
      description: design.description
    }))
  }
}

export const creativeIslamicPdf = new CreativeIslamicPdf()
export default creativeIslamicPdf