// BarakahBundle Backend API Service
// Secure API calls to backend server (no exposed API keys)

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class BackendApiService {
  private apiUrl: string

  constructor() {
    // Always use production API for audio generation
    const baseUrl = 'https://baraka-bundle-ai-tools.onrender.com'
    this.apiUrl = `${baseUrl}/api`
    console.log('🔧 BackendApiService initialized')
    console.log('🔧 Base URL:', baseUrl)
    console.log('🔧 API URL:', this.apiUrl)
    console.log('🔧 API URL type:', typeof this.apiUrl)
    console.log('🔧 API URL length:', this.apiUrl?.length || 0)
  }

  private async makeRequest<T>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const userEmail = localStorage.getItem('user_email')

      // Safeguard against empty URLs
      if (!this.apiUrl) {
        console.error('❌ API URL is empty!')
        console.error('this.apiUrl:', this.apiUrl)
        console.error('typeof this.apiUrl:', typeof this.apiUrl)
        this.apiUrl = 'https://baraka-bundle-ai-tools.onrender.com/api'
        console.log('🔧 Reset API URL to:', this.apiUrl)
      }

      if (!endpoint) {
        console.error('❌ Endpoint is empty!')
        console.error('endpoint:', endpoint)
        console.error('typeof endpoint:', typeof endpoint)
        throw new Error('API endpoint is required')
      }

      const url = `${this.apiUrl}${endpoint}`

      console.log(`🌐 Making API request to: ${url}`)
      console.log(`🔗 Base URL: "${this.apiUrl}", Endpoint: "${endpoint}"`)
      console.log(`📧 User email: ${userEmail || 'not set'}`)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        body: JSON.stringify({ ...payload, email: userEmail })
      })

      console.log(`📨 Response status: ${response.status}`)

      const data = await response.json()

      console.log('🔍 Raw response data from server:')
      console.log(JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error(`❌ API Error Response:`, {
          status: response.status,
          error: data.error,
          details: data.details,
          fullData: data
        })
        return {
          success: false,
          error: data.error || `Server error: ${response.status}`,
          data: data // Include data even on error for debugging
        }
      }

      // For successful responses, return the data directly if it has success field
      // Otherwise wrap it in our expected format
      if (data && typeof data === 'object' && 'success' in data) {
        console.log('✅ Response has success field:', data.success)
        return data
      } else {
        console.log('⚠️ Response missing success field, wrapping it')
        return {
          success: true,
          data: data
        }
      }
    } catch (error) {
      console.error('Backend API Error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error. Please try again.' 
      }
    }
  }

  // 📚 Generate Kids Story (Backend Secure)
  async generateKidsStory(age: string, name: string, theme: string, language: string): Promise<ApiResponse> {
    return this.makeRequest('/generate/kids-story', {
      mode: 'preset',
      age,
      name,
      theme,
      language
    })
  }

  // ✨ Generate Custom Story (Backend Secure)
  async generateCustomStory(customPrompt: string, age: string, language: string): Promise<ApiResponse> {
    return this.makeRequest('/generate/kids-story', {
      mode: 'custom',
      customPrompt,
      age,
      language
    })
  }

  // 🤲 Generate Dua (Backend Secure)
  async generateDua(name: string, situation: string, languages: string[]): Promise<ApiResponse> {
    return this.makeRequest('/generate/dua', {
      name,
      situation,
      languages
    })
  }

  // 🔊 Generate Story Audio (Backend Secure)
  async generateStoryAudio(storyText: string, language: string): Promise<string | object> {
    console.log('🎤 Calling backend audio generation...')
    console.log('this.apiUrl:', this.apiUrl)
    console.log('Expected full URL:', `${this.apiUrl}/generate/story-audio`)
    console.log('Story text length:', storyText.length)
    console.log('Language:', language)

    const response = await this.makeRequest<{
      audioData?: string,
      audioUrl?: string,
      type?: string,
      quality?: string,
      useEnhancedBrowserTTS?: boolean,
      audioMetadata?: any,
      details?: string
    }>('/generate/story-audio', {
      storyText,
      language
    })

    console.log('📡 Backend response success:', response.success)
    console.log('📡 Backend response error:', response.error)
    console.log('📡 Backend response data keys:', response.data ? Object.keys(response.data) : [])

    // Log the FULL response for debugging
    console.log('🔍 FULL RESPONSE OBJECT:')
    console.log(JSON.stringify(response, null, 2))

    if (response.success && response.data) {
      // Check for real audio URL first (best quality)
      if (response.data.audioUrl || response.data.audioData) {
        console.log(`✅ Got REAL audio: ${response.data.type}, quality: ${response.data.quality}`)
        return response.data.audioUrl || response.data.audioData
      }
      // Fallback to enhanced browser TTS
      else if (response.data.useEnhancedBrowserTTS && response.data.audioMetadata) {
        console.log('🔊 Using enhanced browser TTS fallback')
        return {
          useEnhancedBrowserTTS: true,
          audioMetadata: response.data.audioMetadata
        }
      }
    }

    // Log the actual error for debugging
    console.error('❌ Audio generation failed:')
    console.error('Error:', response.error)
    console.error('Data details:', response.data?.details)
    console.error('Full response JSON:')
    console.error(JSON.stringify(response, null, 2))

    throw new Error(response.error || 'Failed to generate audio')
  }

  // 🌍 Get Supported Languages
  getSupportedLanguages(): string[] {
    return [
      'Arabic',
      'English', 
      'Somali',
      'Urdu',
      'Turkish',
      'Indonesian',
      'French',
      'Spanish',
      'Malay',
      'Bengali',
      'Swahili',
      'German',
      'Russian',
      'Persian',
      'Chinese',
      'Japanese'
    ]
  }

  // Generate AI-powered reflections for the dua
  async generateReflections(situation: string, arabicText: string, language: string = 'English'): Promise<string[]> {
    // For now, return default reflections since this is a simple feature
    // Could be extended to use backend API if needed
    return [
      'Du\'a is the essence of worship and our direct connection to Allah',
      'Through sincere supplication, hearts find peace and souls find guidance'
    ]
  }
}

export const backendApiService = new BackendApiService()
export default backendApiService