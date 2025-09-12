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

    // Build language instructions safely
    let languageInstructions = ''
    for (const lang of languages) {
      languageInstructions += `**Translation in ${lang}:**\n[Duʿā meaning in ${lang}]\n\n`
    }

    const systemMessage = `You are an Islamic duʿā generator designed to produce authentic, powerful, and respectful supplications inspired by the Qur'an and authentic Sunnah.

CRITICAL REQUIREMENTS:
- Write Arabic text with FULL tashkeel (diacritical marks): fatha (َ), kasra (ِ), damma (ُ), sukun (ْ), shadda (ّ), tanween, etc.
- Every Arabic word MUST have proper harakat/tashkeel for correct pronunciation
- Use beautiful, classical Arabic style with complete vocalization
- Keep duʿā short (2–5 lines), but meaningful and emotionally strong
- Use respectful invocations: "اللَّهُمَّ" (Allahumma), "يَا رَحْمَٰنُ" (Ya Rahman), "يَا رَبِّ" (Ya Rabbi)
- Only authentic content from Qur'an and Sunnah - NO fabrication
- Natural, heartfelt translations - not robotic

EXAMPLES OF PROPER TASHKEEL:
• رَبِّ اشْرِحْ لِي صَدْرِي (Rabbi ishrah li sadri)
• اللَّهُمَّ بَارِكْ لَنَا (Allahumma barik lana)
• رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً (Rabbana atina fi'd-dunya hasanah)

CRITICAL: Always provide clear transliteration for PDF compatibility!

Format output as:

**Arabic:**
[Duʿā in Arabic script WITH COMPLETE TASHKEEL]

**Transliteration:**
[VERY CLEAR pronunciation guide using Latin letters - this is ESSENTIAL for PDF readability]
Examples: "Allahumma barik lana", "Rabbi ishrah li sadri", "Rabbana atina fi'd-dunya hasanah"

${languageInstructions}

Tone: Uplifting, sincere, spiritually moving.
Never include commentary - only the duʿā and translations.`

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: systemMessage
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
          languages: languages,
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

  // Generate AI-powered reflections for the dua
  async generateReflections(situation: string, arabicText: string): Promise<string[]> {
    try {
      const prompt = `Generate 2 unique, meaningful Islamic reflections for this du'a situation: "${situation}". 
                     Make them specific and profound, not generic. Each should be 1 inspiring sentence.`

      const response = await this.makeRequest('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an Islamic scholar providing deep spiritual reflections.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 200
      })

      if (response.success && response.data) {
        const content = response.data.choices[0].message.content
        const lines = content.split('\n').filter((line: string) => line.trim())
        return lines.slice(0, 2).map((line: string) => 
          line.replace(/^[-•*\d.]\s*/, '').trim()
        )
      }
    } catch (error) {
      console.error('Error generating reflections:', error)
    }

    // Fallback reflections
    return [
      'Du\'a is the essence of worship and our direct connection to Allah',
      'Through sincere supplication, hearts find peace and souls find guidance'
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