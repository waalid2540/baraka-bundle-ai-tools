// OpenAI Service for Baraka Bundle AI Tools
// Professional Islamic AI content generation

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || ''
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

console.log('OpenAI API Key loaded:', OPENAI_API_KEY ? 'YES' : 'NO')

interface OpenAIResponse {
  success: boolean
  data?: any
  error?: string
}

class OpenAIService {
  private async makeRequest(endpoint: string, payload: any): Promise<OpenAIResponse> {
    try {
      if (!OPENAI_API_KEY) {
        return { 
          success: false, 
          error: 'OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your environment variables.' 
        }
      }

      const response = await fetch(`${OPENAI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
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

  // 🧠 1. AI Du'ā Generator
  async generateDua(category: string, language: string = 'english', situation?: string): Promise<OpenAIResponse> {
    const prompt = `Generate an authentic Islamic du'a for the category "${category}" in ${language}.
    ${situation ? `Specific situation: ${situation}` : ''}
    
    Return ONLY valid JSON in this format:
    {
      "title": "Du'a title in ${language}",
      "arabicText": "Complete Arabic text of the du'a",
      "transliteration": "Accurate phonetic transliteration",
      "translation": "Complete translation in ${language}",
      "occasion": "When this du'a is recited",
      "benefits": ["List of spiritual benefits"],
      "source": "Qur'anic or Hadith reference",
      "category": "${category}"
    }
    
    Requirements:
    - Only authentic du'as from Qur'an or Sahih Hadith
    - Accurate Arabic text and transliteration
    - Proper source citation
    - Appropriate for the category and situation`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Islamic scholar expert in authentic du\'as from Qur\'an and Sahih Hadith. Only provide du\'as that are authentically sourced and properly referenced. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 📖 2. Islamic Kids Story Generator
  async generateKidsStory(age: string, name: string, theme: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Create a beautiful Islamic story for children aged ${age} with the theme "${theme}".
    Main character name: ${name}
    Language: ${language}
    
    Return ONLY valid JSON in this format:
    {
      "title": "Story title in ${language}",
      "story": "Complete story (200-300 words) appropriate for age ${age}",
      "moralLesson": "Clear moral lesson from the story",
      "quranReference": "Related Qur'anic verse with reference",
      "arabicVerse": "Arabic text of the verse",
      "verseTranslation": "Translation of the verse",
      "parentNotes": "Tips for parents discussing this story",
      "ageGroup": "${age}",
      "theme": "${theme}"
    }
    
    Requirements:
    - Age-appropriate for ${age} year olds
    - Authentic Islamic values and teachings
    - Engaging story with clear moral lesson
    - Include relevant Qur'anic guidance
    - Educational and entertaining`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Islamic education specialist creating engaging stories for Muslim children. Focus on authentic Islamic teachings, age-appropriate content, and clear moral lessons. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 📚 3. Tafsir Generator (Authentic)
  async generateTafsir(input: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Provide authentic Tafsir for: "${input}" in ${language}.
    
    Return ONLY valid JSON in this format:
    {
      "input": "${input}",
      "verseReference": "Qur'anic reference if applicable",
      "arabicText": "Original Arabic text",
      "translation": "Clear translation in ${language}",
      "tafsirSummary": "Concise explanation based on classical sources",
      "keyLessons": ["Main lessons from this verse/topic"],
      "historicalContext": "Historical background and circumstances of revelation",
      "practicalApplication": "How to apply this guidance in daily life",
      "sources": ["Ibn Kathir", "As-Sa'di", "Tabari", "etc."],
      "relatedVerses": ["Other relevant Qur'anic verses"]
    }
    
    Requirements:
    - Based on authentic classical Tafsir sources
    - Clear and accessible explanation
    - Practical application for modern Muslims
    - Proper source attribution`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Islamic scholar specializing in Qur\'anic Tafsir. Provide authentic explanations based on classical Islamic scholarship (Ibn Kathir, As-Sa\'di, Tabari, etc.). Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 🧾 4. Islamic Name Generator
  async generateNames(gender: 'male' | 'female', language: string, theme: string, count: number = 5): Promise<OpenAIResponse> {
    const prompt = `Generate ${count} authentic Islamic names for ${gender} in ${language} with the theme "${theme}".
    
    Return ONLY valid JSON in this format:
    {
      "names": [
        {
          "name": "Name in Latin script",
          "arabicScript": "النص العربي",
          "meaning": "Meaning in ${language}",
          "origin": "Origin and background",
          "islamicHistory": "Connection to Islamic history (prophets, sahaba, etc.)",
          "pronunciation": "Phonetic pronunciation guide",
          "gender": "${gender}",
          "theme": "${theme}"
        }
      ]
    }
    
    Requirements:
    - Authentic Islamic names only
    - Correct Arabic script
    - Meaningful and appropriate for ${gender}
    - Include Islamic historical significance
    - Proper pronunciation guide`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an Islamic scholar and expert in Arabic names and their meanings. Provide authentic Islamic names with proper Arabic script and historical significance. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }

    return this.makeRequest('/chat/completions', payload)
  }
}

export const openaiService = new OpenAIService()
export default openaiService