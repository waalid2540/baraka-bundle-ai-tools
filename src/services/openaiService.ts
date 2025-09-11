// BarakahTool Premium OpenAI Service
// High-Class Islamic AI Content Generation Platform

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || ''
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

interface OpenAIResponse {
  success: boolean
  data?: any
  error?: string
}

class OpenAIService {
  private apiKey: string
  private model: string = 'gpt-4o' // Latest GPT-5 powered model for best results

  constructor() {
    this.apiKey = OPENAI_API_KEY
  }

  private async makeRequest(endpoint: string, payload: any): Promise<OpenAIResponse> {
    try {
      if (!this.apiKey) {
        return { 
          success: false, 
          error: 'OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your environment.' 
        }
      }

      const response = await fetch(`${OPENAI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('OpenAI Service Error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  // 🤲 1. PREMIUM Dua Generator - USER CONTROLLED Languages
  async generateDua(name: string, situation: string, languages: string[] = ['English']): Promise<OpenAIResponse> {
    const languageList = languages.join(', ')
    const prompt = `Generate a powerful Islamic duʿā for ${name} regarding: ${situation}.

ONLY provide translations for these languages: ${languageList}

Do NOT include any other languages - ONLY the requested ones.`

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are an Islamic duʿā generator designed to produce authentic, powerful, and respectful supplications inspired by the Qur'an and authentic Sunnah.

CRITICAL REQUIREMENTS:
- Write Arabic text with FULL tashkeel (diacritical marks): fatha (َ), kasra (ِ), damma (ُ), sukun (ْ), shadda (ّ), tanween, etc.
- Every Arabic word MUST have proper harakat/tashkeel for correct pronunciation
- Use beautiful, classical Arabic style with complete vocalization
- Keep duʿā short (2–5 lines), but meaningful and emotionally strong
- Use respectful invocations: "اللَّهُمَّ" (Allahumma), "يَا رَحْمَٰنُ" (Ya Rahman), "يَا رَبِّ" (Ya Rabbi)
- Only authentic content from Qur'an and Sunnah - NO fabrication
- Natural, heartfelt translations - not robotic

EXAMPLES OF PROPER TASHKEEL:
• رَبِّ اشْرِحْ لِي صَدْرِي (Rabbi ishrah li sadri)
• اللَّهُمَّ بَارِكْ لَنَا (Allahumma barik lana)
• رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً (Rabbana atina fi'd-dunya hasanah)

CRITICAL: Always provide clear transliteration for PDF compatibility!

Format output as:

**Arabic:**
[Duʿā in Arabic script WITH COMPLETE TASHKEEL]

**Transliteration:**
[VERY CLEAR pronunciation guide using Latin letters - this is ESSENTIAL for PDF readability]
Examples: "Allahumma barik lana", "Rabbi ishrah li sadri", "Rabbana atina fi'd-dunya hasanah"

${languages.map(lang => `**Translation in ${lang}:**
[Duʿā meaning in ${lang}]`).join('\n\n')}

Tone: Uplifting, sincere, spiritually moving.
Never include commentary - only the duʿā and translations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    }

    const response = await this.makeRequest('/chat/completions', payload)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          type: 'dua',
          name: name,
          situation: situation,
          language: language,
          premium: true
        }
      }
    }
    
    return response
  }

  // 📚 2. PREMIUM Kids Story Generator - UNLIMITED AUTHENTIC Stories
  async generateKidsStory(age: string, theme: string, language: string = 'English'): Promise<OpenAIResponse> {
    const prompt = `Create a premium engaging Islamic story for a ${age}-year-old child about "${theme}".

    PREMIUM STORY REQUIREMENTS:
    1. 400-500 words in ${language}
    2. Age-appropriate vocabulary with educational value
    3. Include authentic Islamic morals from Quran/Hadith
    4. Feature relatable characters (Prophets, Sahabah, or modern Muslim children)
    5. Clear moral lesson with Islamic teaching
    6. Engaging plot with vivid descriptions
    7. Cultural diversity reflecting global Muslim community
    
    PREMIUM STORY STRUCTURE:
    🌟 TITLE: 
    [Captivating Islamic title]
    
    📖 STORY:
    [Full engaging story with rich details and Islamic values]
    
    💡 MORAL LESSONS:
    [Multiple clear Islamic teachings from the story]
    
    📿 ISLAMIC REFERENCES:
    [Specific Quranic verses or Hadith that support the story's message]
    
    🎨 SCENE DESCRIPTIONS:
    [Vivid descriptions for potential illustrations]
    
    🤔 REFLECTION QUESTIONS:
    [5 thoughtful age-appropriate questions]
    
    👨‍👩‍👧 PARENT GUIDE:
    [Discussion tips and additional Islamic context for parents]
    
    📚 FURTHER READING:
    [Related authentic Islamic stories and resources]`

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a master Islamic storyteller specializing in premium children's content. 
          Create captivating, age-appropriate stories that teach authentic Islamic values through engaging narratives. 
          Use vivid descriptions, relatable characters, and ensure every story has deep educational and spiritual value.
          Draw from the rich tradition of Islamic history, prophetic stories, and contemporary Muslim life.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 3000
    }

    const response = await this.makeRequest('/chat/completions', payload)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          type: 'story',
          ageGroup: age,
          theme: theme,
          language: language,
          premium: true
        }
      }
    }
    
    return response
  }

  // 🎨 3. PREMIUM Name Poster Generator - UNLIMITED AUTHENTIC Names  
  async generateNamePoster(name: string, language: string = 'English'): Promise<OpenAIResponse> {
    const prompt = `Create premium comprehensive content for an Islamic name poster for "${name}".

    PREMIUM POSTER CONTENT:
    1. Arabic calligraphy representation with full vocalization
    2. Detailed etymology and linguistic roots
    3. Deep Islamic significance and spiritual meaning
    4. Quranic references (if the name or its root appears)
    5. Hadith references and stories of bearers
    6. Character traits in Islamic tradition
    7. Famous Islamic personalities throughout history
    8. Special dua incorporating the name's meaning
    9. Numerological significance in Islamic tradition
    10. Cultural variations across Muslim world
    
    PREMIUM FORMAT IN ${language}:
    ✨ NAME IN ARABIC CALLIGRAPHY:
    [Beautiful Arabic with full tashkeel and artistic styling notes]
    
    📜 ETYMOLOGY & LINGUISTIC ROOTS:
    [Detailed Arabic root analysis and morphological breakdown]
    
    🕌 ISLAMIC SIGNIFICANCE:
    [Deep religious, spiritual, and cultural importance]
    
    📖 QURANIC CONNECTIONS:
    [Direct verses or thematic connections with references]
    
    🌟 HADITH & PROPHETIC TRADITIONS:
    [Authentic narrations and stories]
    
    💎 CHARACTER TRAITS & VIRTUES:
    [Islamic virtues and qualities associated with the name]
    
    👑 FAMOUS BEARERS IN ISLAMIC HISTORY:
    [Detailed list from classical to contemporary]
    
    🤲 PERSONALIZED DUA:
    [Special prayer incorporating the name's meaning and aspirations]
    
    🔢 ISLAMIC NUMEROLOGY:
    [Abjad value and spiritual significance]
    
    🌍 GLOBAL VARIATIONS:
    [How the name is used across different Muslim cultures]
    
    ✍️ CALLIGRAPHY STYLE SUGGESTIONS:
    [Recommendations for artistic presentation]`

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a premium expert in Islamic onomastics, Arabic linguistics, calligraphy, and Islamic history. 
          Provide deep, scholarly insights about Islamic names with perfect Arabic representation, rich historical context, 
          and comprehensive cultural understanding. Your analysis should be both academically rigorous and spiritually meaningful.
          Include rare and valuable insights that showcase premium knowledge.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    }

    const response = await this.makeRequest('/chat/completions', payload)
    
    if (response.success && response.data?.choices?.[0]?.message?.content) {
      return {
        success: true,
        data: {
          content: response.data.choices[0].message.content,
          type: 'namePoster',
          name: name,
          language: language,
          premium: true
        }
      }
    }
    
    return response
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

  // 🚀 Set Model (for future upgrades)
  setModel(model: string): void {
    this.model = model
  }

  // 📊 Get Current Model
  getCurrentModel(): string {
    return this.model
  }
}

export const openaiService = new OpenAIService()
export default openaiService