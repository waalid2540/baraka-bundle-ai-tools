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
      console.error('OpenAI API key not configured')
      // Return a data URL instead of throwing error
      return this.generateTextImage(duaData, theme)
    }

    const imageTheme = imageThemes[theme] || imageThemes.light
    
    // Create a simple, clear prompt for DALL-E
    const prompt = `Beautiful Islamic geometric pattern design with ${imageTheme.colors} colors. ${imageTheme.elements}. Include elegant Arabic calligraphy text in the center. Professional Islamic art style, no people or animals.`

    try {
      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-2', // Use DALL-E 2 which is more reliable
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        })
      })

      if (!response.ok) {
        console.error(`DALL-E API error: ${response.status}`)
        // Return fallback image instead of throwing
        return this.generateTextImage(duaData, theme)
      }

      const data = await response.json()
      return data.data[0].url
    } catch (error) {
      console.error('DALL-E generation error:', error)
      // Return fallback image instead of throwing
      return this.generateTextImage(duaData, theme)
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
    // Create a detailed prompt for stunning Islamic art
    return `Create an exquisite Islamic art masterpiece featuring:
    
    DESIGN STYLE: ${theme.style} with ${theme.colors} color palette
    DECORATIVE ELEMENTS: ${theme.elements}, intricate geometric patterns, ornate borders
    LAYOUT: Centered composition with elegant symmetry
    
    VISUAL ELEMENTS:
    - Stunning Islamic geometric mandala patterns
    - Ornate golden borders with traditional Islamic motifs  
    - Beautiful mosque silhouettes or Islamic architecture elements
    - Decorative crescents, stars, and geometric flourishes
    - Elegant Arabic calligraphy styling (decorative, not readable text)
    - Sophisticated color gradients and lighting effects
    
    ATMOSPHERE: Peaceful, spiritual, majestic, and deeply reverent
    QUALITY: Museum-quality Islamic art, professional digital illustration
    STYLE: Traditional Islamic geometric art meets modern design aesthetics
    
    NO TEXT, NO PEOPLE, NO ANIMALS - Pure decorative Islamic geometric art only.
    Perfect for social media sharing and printing as spiritual wall art.`
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

  // 📖 Generate Book Cover
  async generateBookCover(storyTitle: string, theme: string, ageGroup: string): Promise<string> {
    if (!this.apiKey) {
      return this.generateFallbackBookCover(storyTitle, theme)
    }

    const prompt = `Create a beautiful children's book cover for an Islamic story titled "${storyTitle}".
    
    Style: Professional children's book cover, vibrant colors for ages ${ageGroup}, Islamic geometric patterns, 
    beautiful mosque or Islamic architecture, warm inviting atmosphere.
    Theme: ${theme}
    
    Requirements: NO human faces, NO animals, focus on Islamic architecture and nature, child-friendly design.
    Include space for title text overlay.`

    try {
      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        })
      })

      if (!response.ok) {
        return this.generateFallbackBookCover(storyTitle, theme)
      }

      const data = await response.json()
      return data.data[0].url
    } catch (error) {
      console.error('Book cover generation error:', error)
      return this.generateFallbackBookCover(storyTitle, theme)
    }
  }

  private generateFallbackBookCover(title: string, theme: string): string {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1000)
    gradient.addColorStop(0, '#2D5A27')
    gradient.addColorStop(1, '#8B5CF6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 1000)

    // Border
    ctx.strokeStyle = '#D4AF37'
    ctx.lineWidth = 10
    ctx.strokeRect(40, 40, 720, 920)

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 56px Arial'
    ctx.textAlign = 'center'
    const lines = this.wrapText(title, 600)
    let y = 200
    lines.forEach(line => {
      ctx.fillText(line, 400, y)
      y += 70
    })

    // Islamic decoration
    ctx.font = '100px Arial'
    ctx.fillText('☪️', 400, 500)

    // Theme
    ctx.font = '32px Arial'
    ctx.fillText(theme, 400, 700)

    return canvas.toDataURL('image/png')
  }

  // 📚 Generate Multiple Scene Illustrations for Story (one per page)
  async generateStoryScenes(storyTitle: string, storyContent: string, characterName: string, theme: string, ageGroup: string): Promise<string[]> {
    if (!this.apiKey) {
      console.error('OpenAI API key not configured')
      // Generate fallback images for each page
      const pages = this.splitStoryIntoPages(storyContent)
      const fallbacks: string[] = []
      for (let i = 0; i < pages.length; i++) {
        fallbacks.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme))
      }
      return fallbacks
    }

    // Split story into pages for book format
    const pages = this.splitStoryIntoPages(storyContent)
    const illustrations: string[] = []

    console.log(`🎨 Generating ${pages.length} page illustrations for "${storyTitle}"`)
    
    // Generate an illustration for each page
    for (let i = 0; i < pages.length; i++) {
      try {
        console.log(`Creating illustration ${i + 1}/${pages.length}...`)
        const scenePrompt = this.createPageIllustration(pages[i], i + 1, pages.length, storyTitle, theme, ageGroup)
        const illustration = await this.generateSingleScene(scenePrompt)
        illustrations.push(illustration)
        console.log(`✅ Page ${i + 1} illustration generated successfully`)
        
        // Small delay between requests to avoid rate limits
        if (i < pages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`❌ Error generating illustration for page ${i + 1}:`, error)
        // Add fallback for this page
        const fallback = await this.generateFallbackStoryImage(storyTitle, characterName, theme)
        illustrations.push(fallback)
        console.log(`🔧 Using fallback illustration for page ${i + 1}`)
      }
    }

    // If no scenes generated, provide fallback
    if (illustrations.length === 0) {
      illustrations.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme))
    }

    return illustrations
  }

  // Split story into book pages
  private splitStoryIntoPages(storyContent: string, wordsPerPage: number = 80): string[] {
    const words = storyContent.split(' ')
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageContent = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ')
      if (pageContent.trim()) {
        pages.push(pageContent)
      }
    }
    
    return pages.length > 0 ? pages : [storyContent]
  }

  // Create illustration prompt for specific page
  private createPageIllustration(pageContent: string, pageNumber: number, totalPages: number, title: string, theme: string, ageGroup: string): string {
    // Determine scene type based on page position
    let sceneType = 'middle'
    if (pageNumber === 1) sceneType = 'beginning'
    else if (pageNumber === totalPages) sceneType = 'ending'
    
    return `Create a beautiful, unique children's book illustration for page ${pageNumber} of "${title}".

    PAGE CONTENT CONTEXT: ${pageContent.substring(0, 200)}...
    SCENE POSITION: ${sceneType} of the story
    
    VISUAL REQUIREMENTS:
    - Professional children's book illustration quality
    - Unique scene different from other pages
    - Age-appropriate for ${ageGroup} years old
    - Warm, engaging colors and atmosphere
    - Islamic architectural elements or nature scenes
    
    SPECIFIC ELEMENTS FOR THIS PAGE:
    ${sceneType === 'beginning' ? '- Establishing scene with Islamic setting (mosque, garden, home)' : ''}
    ${sceneType === 'middle' ? '- Action or key moment from the story' : ''}
    ${sceneType === 'ending' ? '- Resolution scene with peaceful, happy atmosphere' : ''}
    - Theme focus: ${theme}
    - Include Islamic geometric patterns or decorative elements
    
    STRICT RULES:
    - NO human faces or figures
    - NO anthropomorphic animals
    - Focus on environments, objects, and Islamic architecture
    - Each page must look visually distinct
    - Professional quality for children's book publishing
    
    Create a unique, engaging illustration for page ${pageNumber} of ${totalPages}.`
  }

  private extractScenes(storyContent: string): string[] {
    // Split story into meaningful scenes
    const paragraphs = storyContent.split('\n\n').filter(p => p.trim().length > 50)
    
    if (paragraphs.length >= 3) {
      return paragraphs.slice(0, 3) // First 3 paragraphs
    }
    
    // If not enough paragraphs, split by sentences
    const sentences = storyContent.split(/[.!?]+/).filter(s => s.trim().length > 30)
    const scenes: string[] = []
    
    // Group sentences into scenes
    for (let i = 0; i < sentences.length; i += 2) {
      const scene = sentences.slice(i, i + 2).join('. ').trim()
      if (scene.length > 30) {
        scenes.push(scene)
      }
      if (scenes.length >= 3) break
    }
    
    return scenes.length > 0 ? scenes : [storyContent.substring(0, 200)]
  }

  private createScenePrompt(sceneContent: string, sceneNumber: number, storyTitle: string, theme: string, ageGroup: string): string {
    return `Create a beautiful, child-friendly Islamic illustration for scene ${sceneNumber} of the story "${storyTitle}".

    SCENE CONTEXT: ${sceneContent.substring(0, 150)}...
    
    VISUAL STYLE:
    - Vibrant, colorful children's book illustration
    - Islamic geometric patterns in background
    - Age-appropriate for ${ageGroup} years old
    - Professional storybook quality
    - Warm, inviting colors that engage children
    
    SCENE ELEMENTS:
    - Beautiful Islamic architecture (mosque, garden, Islamic home)
    - Focus on Islamic values: ${theme}
    - Environmental storytelling elements
    - Objects and settings that support the scene
    - Islamic decorative elements (crescents, stars, geometric patterns)
    
    STRICT REQUIREMENTS:
    - NO human faces or figures (Islamic guidelines)
    - NO anthropomorphic animals
    - Focus on beautiful environments and objects
    - Child-safe and educational content
    - Suitable for printing in children's books
    
    Create scene ${sceneNumber} that visually represents this part of the Islamic story.`
  }

  private async generateSingleScene(prompt: string): Promise<string> {
    const response = await fetch(DALLE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    })

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data[0].url
  }

  // 📚 Generate Islamic Kids Story Illustration (single image - kept for backward compatibility)
  async generateStoryImage(storyTitle: string, characterName: string, theme: string, ageGroup: string): Promise<string> {
    if (!this.apiKey) {
      console.error('OpenAI API key not configured')
      // Return fallback image
      return this.generateFallbackStoryImage(storyTitle, characterName, theme)
    }

    // Create kid-friendly, Islamic-appropriate prompt
    const prompt = `Create a beautiful, child-friendly Islamic illustration for a children's story titled "${storyTitle}". 

    VISUAL STYLE:
    - Warm, colorful, and inviting illustration perfect for ages ${ageGroup}
    - Islamic geometric patterns and designs in the background
    - Beautiful mosque or Islamic architecture elements
    - Soft, bright colors that appeal to children
    - Professional children's book illustration style
    
    SCENE ELEMENTS:
    - Focus on Islamic values: ${theme}
    - Include subtle Islamic decorative elements (crescents, stars, geometric patterns)
    - Beautiful landscape or indoor Islamic setting
    - Child-appropriate and educational visual elements
    
    IMPORTANT RESTRICTIONS:
    - NO human faces or figures (Islamic guidelines)
    - NO animals with human characteristics
    - Focus on environments, objects, and Islamic architectural elements
    - Keep it colorful and engaging for children
    - Professional quality suitable for printing in children's books

    Create a warm, educational illustration that supports the story's Islamic moral lesson.`

    try {
      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        })
      })

      if (!response.ok) {
        console.error(`DALL-E API error: ${response.status}`)
        return this.generateFallbackStoryImage(storyTitle, characterName, theme)
      }

      const data = await response.json()
      return data.data[0].url
    } catch (error) {
      console.error('DALL-E story illustration error:', error)
      return this.generateFallbackStoryImage(storyTitle, characterName, theme)
    }
  }

  // Fallback text-based story image
  async generateFallbackStoryImage(storyTitle: string, characterName: string, theme: string): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!

    // Create colorful background
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024)
    gradient.addColorStop(0, '#E8F5E8')
    gradient.addColorStop(1, '#F0F8FF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)

    // Add Islamic pattern border
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 4
    ctx.strokeRect(50, 50, 924, 924)

    // Title
    ctx.fillStyle = '#2D5A27'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('📚 Islamic Story', 512, 150)

    // Story title
    ctx.fillStyle = '#1F2937'
    ctx.font = '36px Arial'
    const titleLines = this.wrapText(storyTitle, 800)
    let y = 300
    titleLines.forEach(line => {
      ctx.fillText(line, 512, y)
      y += 50
    })

    // Theme decoration
    ctx.fillStyle = '#8B5CF6'
    ctx.font = '24px Arial'
    ctx.fillText(`Theme: ${theme}`, 512, y + 100)

    // Character name
    ctx.fillStyle = '#059669'
    ctx.font = 'italic 28px Arial'
    ctx.fillText(`Featuring: ${characterName}`, 512, y + 150)

    // Islamic decoration
    ctx.fillStyle = '#D4AF37'
    ctx.font = '48px Arial'
    ctx.fillText('☪️', 512, y + 250)

    return canvas.toDataURL('image/png')
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