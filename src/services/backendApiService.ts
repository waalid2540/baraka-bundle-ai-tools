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
    this.apiUrl = 'https://baraka-bundle-ai-tools.onrender.com/api'
  }

  private async makeRequest<T>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const userEmail = localStorage.getItem('user_email')
      
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        body: JSON.stringify({ ...payload, email: userEmail })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || `Server error: ${response.status}` 
        }
      }

      return data
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
    const response = await this.makeRequest<{ 
      audioData?: string, 
      audioUrl?: string,
      type?: string,
      quality?: string,
      useEnhancedBrowserTTS?: boolean,
      audioMetadata?: any 
    }>('/generate/story-audio', {
      storyText,
      language
    })
    
    if (response.success && response.data) {
      // Check for real audio URL first (best quality)
      if (response.data.audioUrl || response.data.audioData) {
        console.log(`✅ Got REAL audio: ${response.data.type}, quality: ${response.data.quality}`)
        return response.data.audioUrl || response.data.audioData
      }
      // Fallback to enhanced browser TTS
      else if (response.data.useEnhancedBrowserTTS && response.data.audioMetadata) {
        return {
          useEnhancedBrowserTTS: true,
          audioMetadata: response.data.audioMetadata
        }
      }
    }
    
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