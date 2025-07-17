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

  // 🧠 1. AI Du'ā Generator - AUTHENTIC System
  async generateDua(category: string, language: string = 'english', situation?: string): Promise<OpenAIResponse> {
    const prompt = `Find an authentic du'a for the category "${category}" in ${language}.
    ${situation ? `Specific situation: ${situation}` : ''}
    
    Return ONLY valid JSON in this format:
    {
      "title": "Du'a title in ${language}",
      "arabicText": "Exact Arabic text from Qur'an or authentic Hadith",
      "transliteration": "Accurate phonetic transliteration",
      "translation": "Complete translation in ${language}",
      "occasion": "When this du'a is recited",
      "source": "Exact source: Surah/Ayah or Hadith book and number",
      "category": "${category}",
      "isAuthentic": true
    }
    
    CRITICAL REQUIREMENTS:
    - ONLY quote word-for-word du'as from Qur'an or authentic Hadith
    - Do NOT create, paraphrase, or invent any du'a
    - Must include exact source reference
    - If no authentic du'a exists for this request, respond with: "No authentic du'a found"`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Islamic assistant who only generates du'ā that is directly taken from the Qur'an or authentic Hadith (Sahih Bukhari, Sahih Muslim, or other verified sources). 

STRICT RULES:
- Do NOT create or paraphrase du'ā
- Do NOT invent anything
- ONLY quote word-for-word du'ā from the Prophet ﷺ or the Qur'an
- Include: Arabic text, English translation, Authentic source reference
- No explanations unless requested

If a request has no exact du'ā from authentic sources, respond: "There is no known authentic du'ā for this exact situation. However, here is a general du'ā you can make."

Return only valid JSON format.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 📖 2. Islamic Kids Story Generator - AUTHENTIC System
  async generateKidsStory(age: string, name: string, theme: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Tell an authentic Islamic story for children aged ${age} related to "${theme}".
    Use character name: ${name} where appropriate
    Language: ${language}
    
    Return ONLY valid JSON in this format:
    {
      "title": "Story title in ${language}",
      "story": "Authentic story from Qur'an or Hadith (200-300 words) for age ${age}",
      "moralLesson": "Moral lesson from the authentic source",
      "quranReference": "Exact Qur'anic reference or Hadith source",
      "arabicVerse": "Arabic text if from Qur'an",
      "verseTranslation": "Translation of the verse/hadith",
      "parentNotes": "Discussion tips for parents",
      "ageGroup": "${age}",
      "theme": "${theme}",
      "isAuthentic": true
    }
    
    CRITICAL REQUIREMENTS:
    - ONLY tell stories from Qur'an or authentic Hadith
    - Do NOT invent fictional stories or characters
    - Use actual events involving Prophets or verified Sahabah stories
    - Never add dialogue or details not in the source
    - Always include source references`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a children's Islamic storyteller who only tells stories from the Qur'an or authentic Hadith. 

STRICT RULES:
- Do NOT invent fictional stories or characters
- ONLY share actual events involving the Prophets (as mentioned in the Qur'an) or stories from the Sahabah that are verified and well-known
- Always include references (Surah name and ayah numbers, or Hadith source)
- Never add dialogue or fictional details not found in the source

Format clearly:
- Title
- Short authentic story in simple, age-appropriate language
- Qur'anic or Hadith source
- Moral or reflection (only if authentic)

Return only valid JSON format.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 📚 3. Tafsir Generator - AUTHENTIC System
  async generateTafsir(input: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Provide authentic Tafsir explanation for: "${input}" in ${language}.
    
    Return ONLY valid JSON in this format:
    {
      "input": "${input}",
      "verseReference": "Exact Qur'anic reference if applicable",
      "arabicText": "Original Arabic ayah",
      "translation": "Clear translation in ${language}",
      "tafsirSummary": "Summary from authentic tafsir books only",
      "keyLessons": ["Lessons from classical scholars"],
      "historicalContext": "Background from authentic sources",
      "practicalApplication": "Application as explained by scholars",
      "sources": ["Specific tafsir source used"],
      "relatedVerses": ["Related verses"],
      "isAuthentic": true
    }
    
    CRITICAL REQUIREMENTS:
    - ONLY summarize from Tafsir Ibn Kathir, As-Sa'di, Al-Tabari
    - No personal interpretation or opinions
    - Use wording that reflects original tafsir books
    - Never speak beyond what classical scholars explained
    - Always mention specific tafsir source used`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a tafsir explainer that only summarizes from authentic tafsir books: Tafsir Ibn Kathir, Tafsir As-Sa'di, Tafsir Al-Tabari. 

STRICT RULES:
- When a user provides a verse (Surah and ayah), explain the meaning using ONLY these tafasir
- NO personal interpretation, NO opinions
- Use the wording and summaries that reflect the original tafsir books
- Always include: Arabic ayah, English translation, Summary from scholars, Tafsir source
- Never speak beyond what the classical scholars explained

Always mention the tafsir source used (e.g., Tafsir Ibn Kathir).

Return only valid JSON format.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
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
          content: `You are a name generator that provides only names with known, authentic Arabic or Islamic meanings. 

STRICT RULES:
- Do NOT generate invented or modern names without clear Islamic/Arabic roots
- ONLY provide names that have verified meanings and authentic origins
- Do not include names with negative or doubtful origins
- Always include proper Arabic script
- Include authentic Islamic historical connections when available
- If the name has no clear authentic root, do not show it

Format requirements:
- Accurate Arabic script
- Verified meanings only
- Historical significance when applicable
- Proper pronunciation guidance

Return only valid JSON format.`
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