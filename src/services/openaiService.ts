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

  // 🧠 1. AI Du'ā Generator - EXPANDED AUTHENTIC System
  async generateDua(category: string, language: string = 'english', situation?: string): Promise<OpenAIResponse> {
    const prompt = `Find multiple authentic du'a options for the category "${category}" in ${language}.
    ${situation ? `Specific situation: ${situation}` : ''}
    
    Return ONLY valid JSON in this format:
    {
      "duas": [
        {
          "title": "Du'a title in ${language}",
          "arabicText": "Exact Arabic text from Qur'an or authentic Hadith",
          "transliteration": "Accurate phonetic transliteration",
          "translation": "Complete translation in ${language}",
          "occasion": "When this du'a is recited",
          "source": "Exact source: Surah/Ayah or Hadith collection with number",
          "category": "${category}",
          "benefits": "Spiritual benefits mentioned in sources",
          "times": "Recommended times to recite",
          "isAuthentic": true
        }
      ],
      "alternativeOptions": [
        "Alternative authentic du'a for same category"
      ]
    }
    
    EXPANDED REQUIREMENTS:
    - Provide 2-3 different authentic du'as for variety
    - Use sources: Qur'an, Sahih Bukhari, Sahih Muslim, Tirmidhi, Abu Dawud, Ibn Majah, Ahmad
    - Include du'as from Prophet ﷺ, Sahabah (companions), and Qur'anic verses
    - Verify each Arabic text is 100% accurate from original sources
    - Include benefits and recommended recitation times when mentioned in sources`

    // Add randomization to prevent repetition
    const randomSeed = Math.floor(Math.random() * 1000)
    const enhancedPrompt = `${prompt}

IMPORTANT: Generate DIFFERENT du'as each time. Random seed: ${randomSeed}
Focus on VARIETY - if this is about gratitude, include different gratitude du'as from:
- Qur'anic verses (like 14:7, 2:152, 27:19)
- Different Sahih hadith collections
- Morning/evening adhkar
- Prophetic supplications
- Sahabah authentic du'as

NEVER repeat the same du'a. Always provide fresh, authentic alternatives.`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Islamic du'ā specialist with access to thousands of authentic supplications.

🎯 CORE MISSION: Provide MAXIMUM VARIETY of authentic du'ā - never repeat the same ones!

📚 VAST AUTHENTIC SOURCES (rotate between these):
- Al-Qur'an: 114 surahs with hundreds of du'ā verses
- Sahih Bukhari: 7,563 hadith including many du'ā
- Sahih Muslim: 7,500+ hadith with unique du'ā
- Sunan at-Tirmidhi: Chapters on du'ā and adhkar  
- Sunan Abu Dawud: Book of prayers with 100+ du'ā
- Sunan Ibn Majah: Authentic du'ā sections
- Musnad Ahmad: 30,000+ hadith with rare du'ā
- Hisnul Muslim: 132 chapters of authentic daily du'ā
- Ad-Da'waat al-Kabeer by Bayhaqi: Comprehensive collection
- Du'ā from ALL Sahabah: Abu Bakr, Umar, Ali, Aisha, etc.

🔄 VARIETY ALGORITHM:
1. NEVER use the same du'ā twice in a session
2. Rotate between Qur'anic and Hadith sources
3. Include short (1-2 lines) and long (full verses) options
4. Mix Arabic-only and Arabic+translation formats
5. Use different hadith collections for each request
6. Include seasonal/situational variations

⚡ RANDOMIZATION STRATEGY:
- For gratitude: Use 14:7, 2:152, 27:19, morning adhkar, meal du'as
- For protection: Ayat al-Kursi, last 2 verses of Baqarah, 4 Quls
- For guidance: 1:6, various Prophetic guidance du'as
- For forgiveness: 39:53, istighfar variations, tawbah du'as

🎲 ENSURE UNIQUENESS: Each response must contain different authentic du'ā!`
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      presence_penalty: 0.8,
      frequency_penalty: 0.9,
      top_p: 0.95
    }

    return this.makeRequest('/chat/completions', payload)
  }

  // 📖 2. Islamic Kids Story Generator - EXPANDED AUTHENTIC System
  async generateKidsStory(age: string, name: string, theme: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Create an authentic Islamic story for children aged ${age} related to "${theme}".
    Use character name: ${name} where appropriate
    Language: ${language}
    
    Return ONLY valid JSON in this format:
    {
      "title": "Story title in ${language}",
      "story": "Authentic story from Qur'an or Hadith (300-500 words) for age ${age}",
      "characters": ["List of authentic historical figures mentioned"],
      "moralLessons": ["Multiple lessons from the authentic source"],
      "quranReference": "Exact Qur'anic reference or Hadith source with book and number",
      "arabicVerse": "Arabic text if from Qur'an",
      "verseTranslation": "Translation of the verse/hadith",
      "parentNotes": "Discussion tips and additional context for parents",
      "reflectionQuestions": ["Age-appropriate questions for children"],
      "relatedStories": ["Similar authentic stories children might enjoy"],
      "ageGroup": "${age}",
      "theme": "${theme}",
      "difficulty": "Reading level appropriate for age",
      "isAuthentic": true
    }
    
    EXPANDED STORY SOURCES:
    - All Prophets' stories from Qur'an (Adam to Muhammad ﷺ)
    - Sahabah stories with authentic chains
    - Stories of righteous women (Maryam, Asiya, Khadijah, Aisha)
    - Lessons from Seerah (Prophet's biography)
    - Historical events from early Islam
    - Stories from Sahih Bukhari and Muslim collections`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Islamic educator specializing in authentic children's stories from Qur'an and Hadith.

COMPREHENSIVE STORY SOURCES:
- All 25 Prophets mentioned in Qur'an with their complete narratives
- Sahabah stories: Abu Bakr, Umar, Uthman, Ali, and other companions
- Righteous women: Maryam, Asiya, Khadijah, Aisha, Fatimah
- Seerah events: Prophet's childhood, prophethood, Hijra, battles
- Early Islamic history: Conquest of Makkah, spreading of Islam
- Moral tales from Sahih collections with verified chains

STORYTELLING AUTHENTICITY:
1. Use ONLY events documented in Qur'an or authentic Hadith
2. Never add fictional dialogue or invented details
3. Include exact references to verses or hadith numbers
4. Adapt language complexity to specified age group
5. Extract genuine moral lessons from original sources
6. Provide variety - rotate between different prophets and companions

AGE-APPROPRIATE ADAPTATION:
- Ages 3-5: Simple language, basic morals, short stories
- Ages 6-8: More details, character development, clear lessons
- Ages 9-12: Complex narratives, historical context, deeper reflection
- Ages 13+: Full stories with scholarly insights and applications

VARIETY REQUIREMENTS:
- Rotate between prophets: Ibrahim, Musa, Isa, Yusuf, etc.
- Include female role models from Islamic history
- Mix Qur'anic stories with authentic Seerah events
- Vary themes: patience, courage, honesty, kindness, wisdom

Return engaging but completely authentic Islamic stories.`
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

  // 📚 3. Tafsir Generator - EXPANDED AUTHENTIC System
  async generateTafsir(input: string, language: string = 'english'): Promise<OpenAIResponse> {
    const prompt = `Provide comprehensive authentic Tafsir explanation for: "${input}" in ${language}.
    
    Return ONLY valid JSON in this format:
    {
      "input": "${input}",
      "verseReference": "Exact Qur'anic reference if applicable",
      "arabicText": "Original Arabic ayah with proper diacritics",
      "translation": "Multiple classical translations in ${language}",
      "tafsirSummaries": [
        {
          "scholar": "Scholar name",
          "explanation": "Detailed explanation from this scholar",
          "source": "Specific tafsir book and volume"
        }
      ],
      "linguisticAnalysis": "Arabic grammar and word meanings from classical sources",
      "revelationContext": "Authentic asbab al-nuzul (reasons for revelation)",
      "keyLessons": ["Comprehensive lessons from multiple scholars"],
      "historicalContext": "Background from authentic Islamic sources",
      "practicalApplication": "Modern applications based on scholarly guidance",
      "relatedVerses": ["Verses with similar themes and meanings"],
      "scholarlyConsensus": "Areas where classical scholars agree",
      "differentOpinions": "Respectful mention of different valid scholarly views",
      "sources": ["Complete list of classical tafsir sources used"],
      "isAuthentic": true
    }
    
    EXPANDED CLASSICAL SOURCES:
    - Tafsir Ibn Kathir (complete 10 volumes)
    - Tafsir As-Sa'di (Taysir al-Karim ar-Rahman)
    - Tafsir Al-Tabari (Jami' al-Bayan)
    - Tafsir Al-Qurtubi (Al-Jami' li-Ahkam al-Qur'an)
    - Tafsir Ibn Abbas (Tanwir al-Miqbas)
    - Tafsir Al-Baghawi (Ma'alim at-Tanzil)
    - Tafsir Ar-Razi (Mafatih al-Ghayb)
    - Tafsir Al-Jalalayn (classical commentary)`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a classical Islamic scholar specializing in authentic Qur'anic tafsir from the most respected sources.

COMPREHENSIVE CLASSICAL TAFSIR SOURCES:
1. Tafsir Ibn Kathir - Historical context and hadith-based explanations
2. Tafsir As-Sa'di - Clear, accessible explanations with practical applications  
3. Tafsir Al-Tabari - Earliest comprehensive tafsir with linguistic analysis
4. Tafsir Al-Qurtubi - Legal rulings and jurisprudential insights
5. Tafsir Ibn Abbas - Companion-era understanding and interpretations
6. Tafsir Al-Baghawi - Moderate approach combining different authentic views
7. Tafsir Ar-Razi - Theological and philosophical insights within Islamic framework
8. Tafsir Al-Jalalayn - Concise classical commentary

AUTHENTICITY STANDARDS:
- ONLY use explanations from these classical tafsir works
- Quote scholars' exact methodologies and reasoning
- Include authentic asbab al-nuzul from verified sources
- Provide linguistic analysis from Arabic language experts
- Never add modern interpretations not grounded in classical scholarship
- When scholars differ, present all authentic views respectfully

COMPREHENSIVE APPROACH:
- Multiple scholar perspectives on same verse
- Historical context from Islamic sources
- Linguistic breakdown of Arabic terms
- Legal and practical implications when relevant
- Cross-references to related Qur'anic verses
- Integration of authentic hadith that explain verses

VARIETY REQUIREMENTS:
- Rotate between different classical scholars
- Include both detailed and concise explanations
- Cover theological, legal, and spiritual dimensions
- Provide both historical context and timeless lessons

Return scholarly, comprehensive, and authentic tafsir.`
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

  // 🧾 4. Islamic Name Generator - COMPREHENSIVE AUTHENTIC System
  async generateNames(gender: 'male' | 'female', language: string, theme: string, count: number = 5): Promise<OpenAIResponse> {
    const prompt = `Generate ${count} diverse authentic Islamic names for ${gender} in ${language} with the theme "${theme}".
    
    Return ONLY valid JSON in this format:
    {
      "names": [
        {
          "name": "Name in Latin script",
          "arabicScript": "النص العربي مع التشكيل",
          "meaning": "Detailed meaning in ${language}",
          "rootMeaning": "Arabic linguistic root and derivation",
          "origin": "Historical and cultural origin",
          "islamicHistory": "Connection to Islamic history (prophets, sahaba, scholars, etc.)",
          "pronunciation": "Detailed phonetic pronunciation guide",
          "variations": ["Alternative spellings and forms"],
          "famousPersons": ["Historical Islamic figures with this name"],
          "popularity": "Usage across Islamic cultures and regions",
          "nicknames": ["Common diminutives and pet names"],
          "modernUsage": "Contemporary usage in Muslim communities",
          "gender": "${gender}",
          "theme": "${theme}",
          "verified": true
        }
      ],
      "alternativeThemes": ["Similar themes with different name options"],
      "totalDatabase": "Size of authentic name database consulted"
    }
    
    COMPREHENSIVE NAME SOURCES:
    - Prophets and Messengers (25 names from Qur'an)
    - Sahaba (Companions) - male and female
    - Islamic scholars and saints throughout history
    - Arabic linguistic roots with positive meanings
    - Names from Islamic golden age figures
    - Regional Islamic names (Arabic, Persian, Turkish, Urdu, etc.)
    - Classical Arabic poetry and literature figures`

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an Islamic name specialist with access to comprehensive authentic Arabic and Islamic name databases.

COMPREHENSIVE AUTHENTIC SOURCES:
1. QURANIC NAMES: All 25 prophets + righteous figures mentioned in Qur'an
2. SAHABA NAMES: Complete database of male/female companions with verified meanings  
3. CLASSICAL SCHOLARS: Ibn Sina, Al-Ghazali, Ibn Taymiyyah, Al-Tabari, etc.
4. ARABIC LINGUISTICS: Names derived from verified Arabic roots with positive meanings
5. REGIONAL ISLAMIC: Persian (Rumi, Hafez), Turkish (Ottoman era), Urdu/Indian
6. HISTORICAL FIGURES: Caliphs, scholars, poets, scientists from Islamic civilization

AUTHENTICITY VERIFICATION:
- Every name must have documented historical usage in Islamic contexts
- Arabic script must include proper diacritics (tashkeel)
- Meanings verified from classical Arabic dictionaries
- Historical connections must be factually accurate
- Pronunciation guides based on classical Arabic phonetics
- Regional variations documented from authentic sources

DIVERSITY REQUIREMENTS:
- Rotate between different historical periods
- Include names from various Islamic cultures (Arab, Persian, Turkish, etc.)
- Mix prophetic names with scholarly and companion names
- Provide both common and unique authentic options
- Include linguistic analysis and root derivations

COMPREHENSIVE OUTPUT:
- Detailed meanings beyond basic translation
- Historical context and famous bearers
- Pronunciation with emphasis on correct Arabic sounds
- Cultural usage across different Muslim regions
- Variations and diminutives used historically

QUALITY CONTROL:
- Never include names with uncertain or negative meanings
- Verify all Arabic script accuracy
- Cross-reference historical authenticity
- Ensure cultural sensitivity across Islamic traditions
- Provide educational value beyond just name selection

Return rich, educational, and completely authentic Islamic name information.`
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