// Browser Text-to-Speech Service
// Fallback for when OpenAI TTS is unavailable

class BrowserTTSService {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private isSupported: boolean

  constructor() {
    this.synthesis = window.speechSynthesis
    this.isSupported = 'speechSynthesis' in window
    
    if (this.isSupported) {
      this.loadVoices()
      
      // Voices might load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices()
    console.log('Available TTS voices:', this.voices.length)
  }

  private selectVoice(language: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) {
      this.loadVoices()
    }

    // Language to locale mapping
    const languageMap: Record<string, string[]> = {
      'english': ['en-US', 'en-GB', 'en'],
      'arabic': ['ar-SA', 'ar-EG', 'ar'],
      'somali': ['so-SO', 'so'],
      'urdu': ['ur-PK', 'ur-IN', 'ur'],
      'turkish': ['tr-TR', 'tr'],
      'indonesian': ['id-ID', 'id'],
      'french': ['fr-FR', 'fr'],
      'spanish': ['es-ES', 'es-MX', 'es'],
      'malay': ['ms-MY', 'ms'],
      'bengali': ['bn-BD', 'bn-IN', 'bn'],
      'swahili': ['sw-KE', 'sw-TZ', 'sw'],
      'german': ['de-DE', 'de'],
      'russian': ['ru-RU', 'ru'],
      'persian': ['fa-IR', 'fa'],
      'chinese': ['zh-CN', 'zh-TW', 'zh'],
      'japanese': ['ja-JP', 'ja']
    }

    const targetLocales = languageMap[language?.toLowerCase()] || ['en-US']
    
    // Try to find a voice for the target language
    for (const locale of targetLocales) {
      const voice = this.voices.find(v => 
        v.lang.toLowerCase().startsWith(locale.toLowerCase())
      )
      if (voice) {
        console.log(`Selected voice: ${voice.name} for ${language}`)
        return voice
      }
    }

    // Fallback to default voice
    return this.voices[0] || null
  }

  private preprocessIslamicText(text: string): string {
    // Add natural pauses for better narration
    let processedText = text
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/:/g, ': ')
      .replace(/;/g, '; ')
    
    // Ensure proper spacing
    processedText = processedText.replace(/\s+/g, ' ').trim()
    
    // Add emphasis markers for Islamic terms (some browsers support SSML-like markup)
    const islamicTerms = [
      'Allah', 'Muhammad', 'Quran', 'Qur\'an', 'Bismillah',
      'Alhamdulillah', 'Subhanallah', 'Mashallah', 'Inshallah',
      'Astaghfirullah', 'Prophet'
    ]
    
    islamicTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      processedText = processedText.replace(regex, ` ${term} `)
    })
    
    return processedText
  }

  async speak(text: string, language: string = 'english'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Browser Text-to-Speech not supported'))
        return
      }

      // Cancel any ongoing speech
      this.synthesis.cancel()

      // Preprocess text for Islamic content
      const processedText = this.preprocessIslamicText(text)
      const utterance = new SpeechSynthesisUtterance(processedText)
      
      // Select appropriate voice
      const voice = this.selectVoice(language)
      if (voice) {
        utterance.voice = voice
      }

      // Professional Islamic content settings
      utterance.rate = 0.75 // Slower for professional narration
      utterance.pitch = 1.0 // Natural pitch for storytelling
      utterance.volume = 1.0

      // Event handlers
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(new Error(event.error))

      // Start speaking
      this.synthesis.speak(utterance)
    })
  }

  pause() {
    if (this.isSupported && this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  resume() {
    if (this.isSupported && this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  stop() {
    if (this.isSupported) {
      this.synthesis.cancel()
    }
  }

  get isSpeaking(): boolean {
    return this.isSupported && this.synthesis.speaking
  }

  get isPaused(): boolean {
    return this.isSupported && this.synthesis.paused
  }

  get isAvailable(): boolean {
    return this.isSupported && this.voices.length > 0
  }
}

export const browserTTSService = new BrowserTTSService()
export default browserTTSService