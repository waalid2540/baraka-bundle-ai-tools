// Canva API Integration for Beautiful Islamic PDF Designs
// Professional content creator quality using Canva's design capabilities

import axios from 'axios'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
}

interface CanvaDesignElement {
  type: 'text' | 'image' | 'shape'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  style: any
}

class CanvaService {
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private baseUrl = 'https://api.canva.com/rest/v1'
  
  constructor() {
    // Canva OAuth credentials
    this.clientId = process.env.REACT_APP_CANVA_CLIENT_ID || ''
    this.clientSecret = process.env.REACT_APP_CANVA_CLIENT_SECRET || ''
  }

  // Get OAuth access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      console.log('✅ Using cached Canva access token')
      return this.accessToken
    }

    console.log('🔐 Authenticating with Canva API...')
    console.log('   Client ID:', this.clientId ? `${this.clientId.substring(0, 10)}...` : '❌ MISSING')
    console.log('   Client Secret:', this.clientSecret ? '✅ Set' : '❌ MISSING')

    if (!this.clientId || !this.clientSecret) {
      const error = '❌ CANVA CREDENTIALS MISSING! Please set REACT_APP_CANVA_CLIENT_ID and REACT_APP_CANVA_CLIENT_SECRET in your .env file'
      console.error(error)
      alert(error)
      throw new Error(error)
    }

    try {
      const response = await axios.post(
        'https://api.canva.com/rest/v1/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'design:content:read design:content:write asset:read asset:write'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      this.accessToken = response.data.access_token
      console.log('✅ Canva authentication successful!')
      return this.accessToken
    } catch (error: any) {
      console.error('❌ Canva authentication failed:', error.response?.data || error.message)
      alert(`Canva authentication failed! Check console for details.`)
      throw new Error('Canva authentication failed')
    }
  }

  // Professional Islamic PDF templates using Canva API
  private getIslamicTemplate(theme: string): any {
    const templates = {
      'rizq': {
        templateId: 'BAGlmwTumq0', // Professional green Islamic design
        colors: ['#2E7D32', '#4CAF50', '#81C784'],
        patterns: ['💰', '🌾', '🕌']
      },
      'protection': {
        templateId: 'BAGl8rKq4fE', // Professional blue Islamic design
        colors: ['#1565C0', '#2196F3', '#64B5F6'],
        patterns: ['🛡️', '⚔️', '🕌']
      },
      'guidance': {
        templateId: 'BAGkxzRqm8A', // Professional gold Islamic design
        colors: ['#F57C00', '#FF9800', '#FFB74D'],
        patterns: ['⭐', '🧭', '🕌']
      },
      'forgiveness': {
        templateId: 'BAGmKwVq2nE', // Professional purple Islamic design
        colors: ['#7B1FA2', '#9C27B0', '#BA68C8'],
        patterns: ['✨', '🤲', '🕌']
      },
      'default': {
        templateId: 'BAFnvTium8k', // Professional default Islamic design
        colors: ['#8D6E63', '#A1887F', '#BCAAA4'],
        patterns: ['🕌', '☪️', '✨']
      }
    }
    
    return templates[theme] || templates.default
  }

  // Create beautiful Islamic design using Canva API
  async createIslamicDesign(duaData: DuaData, theme = 'default'): Promise<string> {
    try {
      const template = this.getIslamicTemplate(theme)
      const accessToken = await this.getAccessToken()
      
      // Step 1: Create a new design from template
      const designResponse = await axios.post(
        `${this.baseUrl}/designs`,
        {
          design_type: 'PDF',
          template_id: template.templateId,
          title: `BarakahTool - ${duaData.situation}`
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const designId = designResponse.data.design.id

      // Step 2: Add Islamic elements to the design
      await this.addIslamicElements(designId, duaData, template)

      // Step 3: Export as high-quality PDF
      const exportResponse = await axios.post(
        `${this.baseUrl}/designs/${designId}/export`,
        {
          format: {
            type: 'pdf',
            quality: 'high'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const jobId = exportResponse.data.job.id
      
      // Step 4: Wait for export to complete and get download URL
      const downloadUrl = await this.waitForExport(jobId)
      
      return downloadUrl

    } catch (error) {
      console.error('❌ Canva API Error:', error)
      throw new Error('Failed to create beautiful Islamic design with Canva API')
    }
  }

  // Add Islamic elements to the Canva design
  private async addIslamicElements(designId: string, duaData: DuaData, template: any): Promise<void> {
    const elements: CanvaDesignElement[] = [
      // Bismillah header
      {
        type: 'text',
        content: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        position: { x: 400, y: 50 },
        size: { width: 600, height: 40 },
        style: {
          font_family: 'Arabic Typesetting',
          font_size: 24,
          color: '#FFFFFF',
          text_align: 'center',
          font_weight: 'bold'
        }
      },
      
      // App title
      {
        type: 'text',
        content: 'BarakahTool - Islamic Dua',
        position: { x: 400, y: 100 },
        size: { width: 600, height: 30 },
        style: {
          font_family: 'Montserrat',
          font_size: 20,
          color: '#FFFFFF',
          text_align: 'center',
          font_weight: 'bold'
        }
      },

      // Situation request
      {
        type: 'text',
        content: `${template.patterns[0]} Your Spiritual Request ${template.patterns[1]}\n\n${duaData.situation}`,
        position: { x: 50, y: 200 },
        size: { width: 700, height: 80 },
        style: {
          font_family: 'Open Sans',
          font_size: 16,
          color: template.colors[2],
          text_align: 'center',
          font_weight: '600'
        }
      },

      // Arabic text (main feature)
      {
        type: 'text',
        content: duaData.arabicText || 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رِزْقِكَ الْحَلَالِ',
        position: { x: 50, y: 320 },
        size: { width: 700, height: 120 },
        style: {
          font_family: 'Traditional Arabic',
          font_size: 28,
          color: template.colors[0],
          text_align: 'center',
          font_weight: 'bold',
          direction: 'rtl'
        }
      },

      // Pronunciation guide
      ...(duaData.transliteration ? [{
        type: 'text' as const,
        content: `📢 Pronunciation Guide 📢\n\n${duaData.transliteration}`,
        position: { x: 50, y: 480 },
        size: { width: 700, height: 60 },
        style: {
          font_family: 'Open Sans',
          font_size: 14,
          color: template.colors[1],
          text_align: 'center',
          font_style: 'italic',
          font_weight: '600'
        }
      }] : []),

      // Translation
      {
        type: 'text',
        content: `💖 ${duaData.language} Translation 💖\n\n"${duaData.translation}"`,
        position: { x: 50, y: 580 },
        size: { width: 700, height: 100 },
        style: {
          font_family: 'Crimson Text',
          font_size: 16,
          color: template.colors[0],
          text_align: 'center',
          font_style: 'italic',
          font_weight: '600'
        }
      },

      // Islamic guidance
      {
        type: 'text',
        content: `✨ Spiritual Guidance ✨\n\n🌙 Best Times: Last third of night, between Maghrib & Isha\n🤲 Recitation: With complete sincerity and focus\n🔢 Repetition: 3, 7, or 33 times for increased blessing\n🧘 Etiquette: Face Qibla and maintain wudu if possible`,
        position: { x: 50, y: 720 },
        size: { width: 700, height: 120 },
        style: {
          font_family: 'Open Sans',
          font_size: 12,
          color: template.colors[1],
          text_align: 'left',
          font_weight: '600'
        }
      },

      // Footer
      {
        type: 'text',
        content: `🌟 BarakahTool - Islamic Digital Platform 🌟\nMay Allah accept your supplication and grant you success • ${new Date().toLocaleDateString()}`,
        position: { x: 50, y: 880 },
        size: { width: 700, height: 40 },
        style: {
          font_family: 'Montserrat',
          font_size: 14,
          color: '#FFFFFF',
          text_align: 'center',
          font_weight: 'bold'
        }
      }
    ]

    // Add elements to the design
    for (const element of elements) {
      await axios.post(
        `${this.baseUrl}/designs/${designId}/elements`,
        element,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }

  // Wait for Canva export to complete and return download URL
  private async waitForExport(jobId: string, maxAttempts = 30): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/export/${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          }
        )

        const job = response.data.job
        
        if (job.status === 'success') {
          return job.result.url
        } else if (job.status === 'failed') {
          throw new Error('Canva export failed')
        }
        
        // Wait before next attempt (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000)))
        
      } catch (error) {
        console.error(`Export check attempt ${attempt + 1} failed:`, error)
      }
    }
    
    throw new Error('Export timeout - Canva taking too long')
  }

  // Download the PDF from Canva and return as Blob
  async downloadPdf(downloadUrl: string): Promise<Blob> {
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob'
      })
      
      return new Blob([response.data], { type: 'application/pdf' })
    } catch (error) {
      console.error('❌ PDF Download Error:', error)
      throw new Error('Failed to download beautiful PDF from Canva')
    }
  }

  // Test Canva connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Canva API connection...')
      const token = await this.getAccessToken()
      console.log('✅ Canva API is connected and ready!')
      alert('✅ Canva API is connected successfully! You can now generate beautiful PDFs.')
      return true
    } catch (error) {
      console.error('❌ Canva API test failed:', error)
      alert('❌ Canva API connection failed! Check console for details.')
      return false
    }
  }

  // Main method to generate beautiful Islamic PDF
  async generateBeautifulPdf(duaData: DuaData, theme = 'default'): Promise<Blob> {
    try {
      console.log('🎨 STARTING CANVA PDF GENERATION...')
      console.log('   Theme:', theme)
      console.log('   Situation:', duaData.situation)
      console.log('   Language:', duaData.language)
      
      // Create beautiful design
      console.log('📐 Step 1: Creating design with Canva...')
      const downloadUrl = await this.createIslamicDesign(duaData, theme)
      console.log('✅ Design created! URL:', downloadUrl)
      
      // Download as PDF blob
      console.log('📥 Step 2: Downloading PDF...')
      const pdfBlob = await this.downloadPdf(downloadUrl)
      console.log('✅ PDF downloaded! Size:', pdfBlob.size, 'bytes')
      
      console.log('🎉 CANVA PDF GENERATION COMPLETE!')
      alert('✅ Beautiful Canva PDF created successfully!')
      return pdfBlob
      
    } catch (error: any) {
      console.error('❌ CANVA PDF GENERATION FAILED:', error)
      console.error('   Error details:', error.response?.data || error.message)
      alert(`❌ Canva PDF generation failed! ${error.message || 'Check console for details.'}`)
      throw error
    }
  }
}

export const canvaService = new CanvaService()
export default canvaService