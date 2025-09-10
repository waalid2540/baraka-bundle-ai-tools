// DALL-E Islamic Image Generator Service
// Creates beautiful Islamic-themed images with dua text

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || ''
const DALLE_API_URL = 'https://api.openai.com/v1/images/generations'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
  topic?: string
}

interface ImageTheme {
  name: string
  style: string
  colors: string
  elements: string
}

const imageThemes: Record<string, ImageTheme> = {
  light: {
    name: 'Light',
    style: 'minimalist Islamic art',
    colors: 'soft white, light gray, and gold accents',
    elements: 'geometric patterns, subtle mosque silhouette'
  },
  night: {
    name: 'Night',
    style: 'night sky Islamic art',
    colors: 'deep blue, purple, gold stars',
    elements: 'crescent moon, stars, mosque under night sky'
  },
  gold: {
    name: 'Gold',
    style: 'luxurious Islamic calligraphy art',
    colors: 'gold, cream, deep brown',
    elements: 'ornate Islamic patterns, golden Arabic calligraphy'
  },
  rizq: {
    name: 'Sustenance',
    style: 'abundant nature Islamic art',
    colors: 'green, gold, earth tones',
    elements: 'growing plants, wheat fields, Islamic geometric patterns'
  },
  protection: {
    name: 'Protection',
    style: 'protective Islamic art',
    colors: 'blue, silver, white',
    elements: 'protective geometric patterns, fortress-like mosque design'
  },
  guidance: {
    name: 'Guidance',
    style: 'illuminating Islamic art',
    colors: 'bright yellow, orange, white',
    elements: 'light rays, compass rose with Islamic patterns, guiding star'
  },
  forgiveness: {
    name: 'Forgiveness',
    style: 'peaceful Islamic art',
    colors: 'soft purple, lavender, white',
    elements: 'flowing water, peaceful mosque garden, gentle Islamic patterns'
  }
}

class DalleService {
  private apiKey: string

  constructor() {
    this.apiKey = OPENAI_API_KEY
  }

  async generateDuaImage(duaData: DuaData, theme: string = 'light'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const imageTheme = imageThemes[theme] || imageThemes.light
    
    // Create a beautiful prompt for DALL-E
    const prompt = this.createImagePrompt(duaData, imageTheme)

    try {
      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        })
      })

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].url
    } catch (error) {
      console.error('DALL-E generation error:', error)
      throw new Error('Failed to generate image')
    }
  }

  async generateHdDuaImage(duaData: DuaData, theme: string = 'light'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const imageTheme = imageThemes[theme] || imageThemes.light
    const prompt = this.createImagePrompt(duaData, imageTheme)

    try {
      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1792x1024', // HD size
          quality: 'hd', // HD quality
          style: 'vivid'
        })
      })

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].url
    } catch (error) {
      console.error('DALL-E HD generation error:', error)
      throw new Error('Failed to generate HD image')
    }
  }

  private createImagePrompt(duaData: DuaData, theme: ImageTheme): string {
    // Create a detailed prompt for beautiful Islamic art
    return `Create a beautiful Islamic art piece in ${theme.style} style with ${theme.colors} colors. 
    Include ${theme.elements}. 
    The image should have a serene, spiritual atmosphere suitable for a dua (Islamic prayer).
    At the center, elegantly display the Arabic text: "${duaData.arabicText}" in beautiful Arabic calligraphy.
    Below it, add the English translation in elegant typography: "${duaData.translation}".
    Make it suitable for ${duaData.situation || 'spiritual reflection'}.
    The overall design should be respectful, beautiful, and suitable for sharing or printing.
    Style: Professional Islamic digital art, high quality, no portraits of people or animals.`
  }

  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      throw new Error('Failed to download image')
    }
  }

  // Generate a simple text-based image as fallback
  async generateTextImage(duaData: DuaData, theme: string = 'light'): Promise<string> {
    // This creates a canvas-based image as a fallback
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    const themeColors = {
      light: { bg: '#FFFFFF', text: '#1F2937', accent: '#8B5CF6' },
      night: { bg: '#111827', text: '#F9FAFB', accent: '#A78BFA' },
      gold: { bg: '#FFFBEB', text: '#78350F', accent: '#F59E0B' }
    }

    const colors = themeColors[theme as keyof typeof themeColors] || themeColors.light

    // Background
    ctx.fillStyle = colors.bg
    ctx.fillRect(0, 0, 1024, 1024)

    // Add gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0, colors.accent + '20')
    gradient.addColorStop(1, colors.accent + '10')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)

    // Title
    ctx.fillStyle = colors.accent
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('الدعاء', 512, 150)

    // Arabic text
    ctx.fillStyle = colors.text
    ctx.font = '36px Arial'
    ctx.textAlign = 'center'
    
    // Wrap Arabic text
    const arabicLines = this.wrapText(duaData.arabicText, 800)
    let y = 300
    arabicLines.forEach(line => {
      ctx.fillText(line, 512, y)
      y += 50
    })

    // Translation
    ctx.fillStyle = colors.text + 'CC'
    ctx.font = 'italic 24px Arial'
    const translationLines = this.wrapText(duaData.translation, 800)
    y += 100
    translationLines.forEach(line => {
      ctx.fillText(line, 512, y)
      y += 35
    })

    // Footer
    ctx.fillStyle = colors.accent
    ctx.font = '20px Arial'
    ctx.fillText('BarakahTool - Islamic Digital Platform', 512, 950)

    return canvas.toDataURL('image/png')
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (testLine.length > maxWidth / 12) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) lines.push(currentLine)
    return lines
  }
}

export const dalleService = new DalleService()
export default dalleService