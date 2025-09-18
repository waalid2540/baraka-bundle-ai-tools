// DALL-E Islamic Image Generator Service
// Creates beautiful Islamic-themed images with dua text

// Get API key from environment
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY ||
                       (import.meta.env ? import.meta.env.VITE_REACT_APP_OPENAI_API_KEY : '') ||
                       ''
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
    console.log('🎨 DALL-E Service initialized')
    console.log('🔑 API key exists:', !!this.apiKey)
    console.log('🔑 API key format:', this.apiKey ? `${this.apiKey.substring(0, 7)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 'NOT SET')
    console.log('🔑 API key length:', this.apiKey?.length || 0)
    console.log('🔑 API key starts with sk-:', this.apiKey?.startsWith('sk-') || false)

    // Check if API key is valid
    const isValidKey = this.apiKey &&
                      this.apiKey !== 'your_openai_api_key_here' &&
                      this.apiKey.startsWith('sk-') &&
                      this.apiKey.length > 40;

    console.log('🔑 API key appears valid:', isValidKey)

    if (!isValidKey) {
      console.warn('⚠️ DALL-E API key is missing or invalid!')
      console.warn('📝 To enable real AI image generation:')
      console.warn('   1. Go to https://platform.openai.com/api-keys')
      console.warn('   2. Create a new API key')
      console.warn('   3. Update REACT_APP_OPENAI_API_KEY in .env file')
      console.warn('   4. For Render deployment, update environment variable in dashboard')
      console.warn('🎨 Using fallback canvas images until API key is configured')
    }
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
    console.log('🔍 Book cover generation debug:')
    console.log('🔑 API key exists:', !!this.apiKey)
    console.log('🔑 API key length:', this.apiKey?.length || 0)
    console.log('🔑 API key is placeholder:', this.apiKey === 'your_openai_api_key_here')
    console.log('🔑 Should use fallback:', !this.apiKey || this.apiKey === 'your_openai_api_key_here')

    const isValidKey = this.apiKey &&
                      this.apiKey !== 'your_openai_api_key_here' &&
                      this.apiKey.startsWith('sk-') &&
                      this.apiKey.length > 40;

    if (!isValidKey) {
      console.log('📖 API key not valid, using fallback cover')
      return this.generateFallbackBookCover(storyTitle, theme)
    }
    
    console.log('🎨 Generating book cover with DALL-E for:', storyTitle)

    const prompt = `Create a beautiful children's book cover for an Islamic story titled "${storyTitle}".

    VISUAL ELEMENTS:
    - Professional children's book cover design
    - Vibrant, engaging colors perfect for ages ${ageGroup}
    - Islamic children characters in traditional modest clothing
    - Boys wearing thobe/traditional Islamic dress with kufi caps
    - Girls wearing hijab and modest colorful dresses
    - Beautiful Islamic setting (mosque, Islamic garden, or traditional home)

    COVER DESIGN:
    - Central focus on happy Islamic children
    - Islamic architectural elements in background
    - Decorative Islamic geometric patterns as borders
    - Warm, inviting atmosphere that appeals to children
    - Theme: ${theme}
    - Colors should be bright and child-friendly

    STYLE REQUIREMENTS:
    - Professional children's book cover quality
    - Characters showing Islamic values and happiness
    - Leave space for title text overlay
    - Suitable for printing and publishing
    - Diverse representation of Muslim children

    Create an engaging cover that shows Islamic children living the story's theme.`

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
    console.log('🔍 Story scenes generation debug:')
    console.log('🔑 API key exists:', !!this.apiKey)
    console.log('🔑 API key length:', this.apiKey?.length || 0)
    console.log('🔑 API key is placeholder:', this.apiKey === 'your_openai_api_key_here')
    console.log('🔑 Should use fallback:', !this.apiKey || this.apiKey === 'your_openai_api_key_here')

    const isValidKey = this.apiKey &&
                      this.apiKey !== 'your_openai_api_key_here' &&
                      this.apiKey.startsWith('sk-') &&
                      this.apiKey.length > 40;

    if (!isValidKey) {
      console.log('🎨 API key not valid, using fallback illustrations')
      const pages = this.splitStoryIntoPages(storyContent)
      const fallbacks: string[] = []
      for (let i = 0; i < pages.length; i++) {
        fallbacks.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme))
      }
      return fallbacks
    }
    
    console.log('🎨 Starting DALL-E scene generation for:', storyTitle)

    // Split story into pages for book format
    const pages = this.splitStoryIntoPages(storyContent)
    const illustrations: string[] = []

    console.log(`🎨 Generating ${pages.length} page illustrations for "${storyTitle}"`)
    console.log(`📄 Story pages:`, pages.map((p, i) => `Page ${i+1}: ${p.substring(0, 30)}...`))
    
    // Generate an illustration for each page
    for (let i = 0; i < pages.length; i++) {
      try {
        console.log(`🖼️ Creating illustration ${i + 1}/${pages.length}...`)
        console.log(`📝 Page content: "${pages[i].substring(0, 100)}..."`)
        
        const scenePrompt = this.createPageIllustration(pages[i], i + 1, pages.length, storyTitle, theme, ageGroup)
        console.log(`🎯 DALL-E prompt for page ${i + 1}:`, scenePrompt.substring(0, 200) + '...')
        
        const illustration = await this.generateSingleScene(scenePrompt)
        
        // Validate and test the image URL
        if (illustration && illustration.length > 10) {
          // Test if the URL is accessible
          try {
            const testResponse = await fetch(illustration, { method: 'HEAD' })
            if (testResponse.ok) {
              illustrations.push(illustration)
              console.log(`✅ Page ${i + 1} illustration validated and added: ${illustration.substring(0, 50)}...`)
            } else {
              throw new Error(`Image URL not accessible: ${testResponse.status}`)
            }
          } catch (urlError) {
            console.warn(`⚠️ Image URL validation failed for page ${i + 1}:`, urlError)
            const fallback = await this.generateFallbackStoryImage(storyTitle, characterName, theme)
            illustrations.push(fallback)
          }
        } else {
          console.warn(`⚠️ Invalid illustration URL for page ${i + 1}, using fallback`)
          const fallback = await this.generateFallbackStoryImage(storyTitle, characterName, theme)
          illustrations.push(fallback)
        }
        
        // Delay between requests to avoid rate limits and allow processing
        if (i < pages.length - 1) {
          console.log(`⏳ Waiting before generating next illustration...`)
          await new Promise(resolve => setTimeout(resolve, 2000)) // Increased delay
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
      console.warn('⚠️ No illustrations generated, adding default fallback')
      illustrations.push(await this.generateFallbackStoryImage(storyTitle, characterName, theme))
    }

    console.log(`🎨 Final result: ${illustrations.length} illustrations generated for ${pages.length} pages`)
    console.log(`📋 Illustration URLs:`, illustrations.map((url, i) => `Page ${i+1}: ${url ? url.substring(0, 40) + '...' : 'MISSING'}`))
    
    // Ensure we have exactly the right number of illustrations
    while (illustrations.length < pages.length) {
      console.warn(`⚠️ Missing illustration for page ${illustrations.length + 1}, adding fallback`)
      const fallback = await this.generateFallbackStoryImage(storyTitle, characterName, theme)
      illustrations.push(fallback)
    }

    return illustrations
  }

  // Split story into book pages - MUST match ProfessionalStoryBook exactly
  private splitStoryIntoPages(storyContent: string, wordsPerPage: number = 80): string[] {
    const words = storyContent.split(' ')
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageContent = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ')
      if (pageContent.trim()) {
        pages.push(pageContent.trim())
      }
    }
    
    const result = pages.length > 0 ? pages : [storyContent]
    console.log(`📄 Split story into ${result.length} pages with ${wordsPerPage} words each`)
    return result
  }

  // Create illustration prompt for specific page
  private createPageIllustration(pageContent: string, pageNumber: number, totalPages: number, title: string, theme: string, ageGroup: string): string {
    // Determine scene type based on page position
    let sceneType = 'middle'
    if (pageNumber === 1) sceneType = 'beginning'
    else if (pageNumber === totalPages) sceneType = 'ending'

    return `Create a beautiful, engaging children's book illustration for page ${pageNumber} of "${title}".

    PAGE CONTENT CONTEXT: ${pageContent.substring(0, 300)}...
    SCENE POSITION: ${sceneType} of the story

    VISUAL REQUIREMENTS:
    - Professional children's book illustration style
    - Colorful, warm, and engaging for ages ${ageGroup}
    - Include Islamic children characters appropriate to the story
    - Beautiful Islamic setting (mosque, Islamic home, garden, market)
    - Characters wearing modest Islamic clothing (hijab, thobe, traditional dress)

    CHARACTER GUIDELINES:
    - Show Islamic children (boys and girls) in modest traditional clothing
    - Boys: wearing thobe, kufi/cap, or traditional Islamic attire
    - Girls: wearing hijab, modest dresses, or traditional Islamic clothing
    - Diverse representation of Muslim children from different backgrounds
    - Happy, friendly expressions showing Islamic values

    STORY-SPECIFIC ELEMENTS:
    ${sceneType === 'beginning' ? '- Opening scene introducing the main character and Islamic setting' : ''}
    ${sceneType === 'middle' ? '- Key story moment with character interactions and Islamic values' : ''}
    ${sceneType === 'ending' ? '- Happy resolution showing lesson learned and character growth' : ''}
    - Theme focus: ${theme}
    - Islamic decorative elements and patterns in background
    - Setting that matches the story content

    STYLE REQUIREMENTS:
    - Bright, colorful children's book art style
    - Warm lighting and inviting atmosphere
    - Professional quality suitable for publishing
    - Each page visually distinct from others
    - Characters should match the story narrative

    Create a unique illustration showing Islamic children in the story scene for page ${pageNumber} of ${totalPages}.`
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
    try {
      console.log('🎨 Making DALL-E API request...')
      console.log('🔑 Using API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'MISSING')
      console.log('🎯 Prompt:', prompt.substring(0, 100) + '...')

      const requestBody = {
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      };

      console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(DALLE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ DALL-E API error ${response.status}:`, errorText)
        throw new Error(`DALL-E API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📦 DALL-E response data:', data);

      const imageUrl = data.data[0].url

      // Validate the URL
      if (!imageUrl || imageUrl.length < 10) {
        throw new Error('Invalid image URL received from DALL-E')
      }

      console.log('✅ DALL-E image generated successfully:', imageUrl)
      return imageUrl
    } catch (error) {
      console.error('💥 Error in generateSingleScene:', error)
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error
    }
  }

  // 📚 Generate Islamic Kids Story Illustration (single image - kept for backward compatibility)
  async generateStoryImage(storyTitle: string, characterName: string, theme: string, ageGroup: string): Promise<string> {
    if (!this.apiKey) {
      console.error('OpenAI API key not configured')
      // Return fallback image
      return this.generateFallbackStoryImage(storyTitle, characterName, theme)
    }

    // Create kid-friendly, Islamic-appropriate prompt with characters
    const prompt = `Create a beautiful, engaging Islamic children's book illustration for "${storyTitle}".

    CHARACTER FOCUS:
    - Islamic children (${characterName}) as main characters
    - Boys wearing traditional Islamic clothing (thobe, kufi cap)
    - Girls wearing hijab and modest, colorful traditional dresses
    - Happy, friendly children showing Islamic values
    - Diverse representation of Muslim children

    VISUAL STYLE:
    - Warm, colorful children's book illustration
    - Professional quality suitable for ages ${ageGroup}
    - Bright, engaging colors that appeal to children
    - Islamic setting with beautiful architecture
    - Traditional Islamic home, mosque, or garden setting

    SCENE ELEMENTS:
    - Story theme: ${theme}
    - Children demonstrating Islamic values through actions
    - Islamic decorative elements and geometric patterns
    - Beautiful Islamic architectural background
    - Educational and inspiring visual elements

    ATMOSPHERE:
    - Warm, inviting, and child-friendly
    - Shows Islamic values in action
    - Suitable for children's book printing
    - Engaging and educational content

    Create an illustration showing Islamic children living the story's moral lesson.`

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

  // Simple placeholder for when all else fails
  private generateSimplePlaceholder(pageNumber: number): string {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    
    // Simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 300)
    gradient.addColorStop(0, '#4ade80')
    gradient.addColorStop(1, '#16a34a')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 300)
    
    // Add text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Page ${pageNumber}`, 200, 140)
    ctx.font = '16px Arial'
    ctx.fillText('Illustration loading...', 200, 170)
    
    return canvas.toDataURL()
  }
}

export const dalleService = new DalleService()
export default dalleService