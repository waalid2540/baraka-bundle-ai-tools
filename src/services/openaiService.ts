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

  // 🧠 1. Du'ā Generator - AUTHENTIC DATABASE ONLY
  async generateDua(category: string, language: string = 'english', situation?: string): Promise<OpenAIResponse> {
    
    // EXPANDED: Many more authentic du'as - NO AI GENERATION
    const authenticDuas = {
      gratitude: [
        {
          title: "Praise to Allah",
          arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          transliteration: "Alhamdulillahi rabbil alameen",
          translation: "All praise is due to Allah, Lord of the worlds",
          occasion: "Expressing gratitude to Allah",
          source: "Quran 1:2",
          category: "gratitude",
          benefits: "Acknowledging Allah as the source of all blessings",
          times: "Any time",
          isAuthentic: true
        },
        {
          title: "Thanks After Eating",
          arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
          transliteration: "Alhamdulillahi alladhi at'amani hadha wa razaqaneehi min ghayri hawlin minni wa la quwwah",
          translation: "All praise is due to Allah who fed me this and provided it for me without any might or power from me",
          occasion: "After finishing a meal",
          source: "Sunan Abu Dawud 4023",
          category: "gratitude",
          benefits: "Recognizing Allah's provision and sustenance",
          times: "After eating",
          isAuthentic: true
        },
        {
          title: "Gratitude for Blessings",
          arabicText: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
          transliteration: "Alhamdulillahi alladhi bi ni'matihi tatimmu as-salihat",
          translation: "All praise is due to Allah by whose grace good deeds are completed",
          occasion: "When something good happens",
          source: "Ibn Majah 3803",
          category: "gratitude",
          benefits: "Acknowledging Allah's role in all good outcomes",
          times: "After achieving something good",
          isAuthentic: true
        },
        {
          title: "Morning Gratitude",
          arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
          transliteration: "Asbahna wa asbahal-mulku lillahi walhamdu lillah",
          translation: "We have reached the morning and the dominion belongs to Allah, and all praise is due to Allah",
          occasion: "Upon waking up in the morning",
          source: "Sahih Muslim 2723",
          category: "gratitude",
          benefits: "Starting the day with acknowledgment of Allah's sovereignty",
          times: "Morning",
          isAuthentic: true
        }
      ],
      protection: [
        {
          title: "Seeking Allah's Protection",
          arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
          transliteration: "A'udhu bi kalimatillahit-tammati min sharri ma khalaq",
          translation: "I seek refuge in the perfect words of Allah from the evil of what He created",
          occasion: "Seeking protection from harm",
          source: "Sahih Muslim 2708",
          category: "protection",
          benefits: "Comprehensive protection from all evils",
          times: "Morning, evening, or when feeling afraid",
          isAuthentic: true
        },
        {
          title: "Evening Protection",
          arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
          transliteration: "Amsayna wa amsal-mulku lillahi walhamdu lillah",
          translation: "We have reached the evening and the dominion belongs to Allah, and all praise is due to Allah",
          occasion: "Evening protection and acknowledgment",
          source: "Sahih Muslim 2723",
          category: "protection",
          benefits: "Evening protection and recognition of Allah's dominion",
          times: "Evening",
          isAuthentic: true
        },
        {
          title: "Protection from Evil Eye",
          arabicText: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
          transliteration: "A'udhu bi kalimatillahit-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah",
          translation: "I seek refuge in the perfect words of Allah from every devil and poisonous creature, and from every evil eye",
          occasion: "Protection from evil eye and harmful creatures",
          source: "Sahih Bukhari 3371",
          category: "protection",
          benefits: "Protection from supernatural and natural harms",
          times: "When feeling vulnerable or afraid",
          isAuthentic: true
        }
      ],
      forgiveness: [
        {
          title: "Seeking Forgiveness",
          arabicText: "رَبِّ اغْفِرْ لِي ذَنْبِي وَخَطَئِي وَجَهْلِي",
          transliteration: "Rabbi ghfir li dhanbi wa khata'i wa jahli",
          translation: "My Lord, forgive my sins, my mistakes, and my ignorance",
          occasion: "Seeking Allah's forgiveness",
          source: "Sahih Bukhari 6398",
          category: "forgiveness",
          benefits: "Comprehensive forgiveness for all types of sins",
          times: "Any time, especially after prayer",
          isAuthentic: true
        },
        {
          title: "Master of Seeking Forgiveness",
          arabicText: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ",
          transliteration: "Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana 'abduka",
          translation: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant",
          occasion: "The master supplication for seeking forgiveness",
          source: "Sahih Bukhari 6306",
          category: "forgiveness",
          benefits: "The most comprehensive du'a for forgiveness",
          times: "Morning, or anytime seeking forgiveness",
          isAuthentic: true
        }
      ],
      guidance: [
        {
          title: "Seeking Guidance",
          arabicText: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
          transliteration: "Ihdinas-siratal-mustaqeem",
          translation: "Guide us to the straight path",
          occasion: "Seeking Allah's guidance",
          source: "Quran 1:6",
          category: "guidance",
          benefits: "Asking for divine guidance in all matters",
          times: "In every prayer and when making decisions",
          isAuthentic: true
        },
        {
          title: "Guidance and Knowledge",
          arabicText: "رَبِّ زِدْنِي عِلْمًا",
          transliteration: "Rabbi zidni 'ilma",
          translation: "My Lord, increase me in knowledge",
          occasion: "Seeking increase in beneficial knowledge",
          source: "Quran 20:114",
          category: "guidance",
          benefits: "Asking for beneficial knowledge and wisdom",
          times: "Before studying or learning",
          isAuthentic: true
        }
      ],
      health: [
        {
          title: "Healing Du'a",
          arabicText: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ وَاشْفِ أَنْتَ الشَّافِي",
          transliteration: "Allahumma rabban-nasi adhhibil-ba'sa washfi anta ash-shafi",
          translation: "O Allah, Lord of the people, remove the hardship and heal, You are the Healer",
          occasion: "When seeking healing from illness",
          source: "Sahih Bukhari 5743",
          category: "health",
          benefits: "Seeking Allah's healing for any illness",
          times: "When sick or visiting the sick",
          isAuthentic: true
        }
      ],
      travel: [
        {
          title: "Travel Du'a",
          arabicText: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ",
          transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrineen",
          translation: "Glory to Him who has subjected this to us, and we could never have accomplished this by ourselves",
          occasion: "When beginning a journey",
          source: "Sunan Abu Dawud 2602",
          category: "travel",
          benefits: "Acknowledging Allah's blessing in travel",
          times: "When starting any journey",
          isAuthentic: true
        }
      ],
      success: [
        {
          title: "Success and Achievement",
          arabicText: "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ",
          transliteration: "Rabbana wa la tuhammilna ma la taqata lana bih",
          translation: "Our Lord, do not burden us with what we cannot bear",
          occasion: "When facing challenges or seeking success",
          source: "Quran 2:286",
          category: "success",
          benefits: "Asking Allah not to burden us beyond our capacity",
          times: "When facing difficulties or challenges",
          isAuthentic: true
        }
      ],
      general: [
        {
          title: "Comprehensive Du'a",
          arabicText: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
          transliteration: "Rabbana atina fi'd-dunya hasanatan wa fi'l-akhirati hasanatan wa qina 'adhab an-nar",
          translation: "Our Lord, give us good in this world and good in the hereafter, and save us from the punishment of the Fire",
          occasion: "General supplication for both worlds",
          source: "Quran 2:201",
          category: "general",
          benefits: "Asking for good in this life and the next",
          times: "Any time",
          isAuthentic: true
        },
        {
          title: "Peace and Blessings",
          arabicText: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
          transliteration: "Bismillahi tawakkaltu 'alallahi wa la hawla wa la quwwata illa billah",
          translation: "In the name of Allah, I trust in Allah, and there is no might nor power except with Allah",
          occasion: "When leaving the house or starting any task",
          source: "Sunan Abu Dawud 5095",
          category: "general",
          benefits: "Placing trust in Allah and seeking His help",
          times: "Before starting any important task",
          isAuthentic: true
        }
      ]
    }

    // Get authentic du'a from database
    const categoryDuas = authenticDuas[category as keyof typeof authenticDuas] || authenticDuas.general
    const randomIndex = Math.floor(Math.random() * categoryDuas.length)
    const selectedDua = categoryDuas[randomIndex]

    return {
      success: true,
      data: {
        choices: [{
          message: {
            content: JSON.stringify(selectedDua)
          }
        }]
      }
    }
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

  // 📚 3. Tafsir Generator - REMOVED (AI errors unacceptable for religious content)
  async generateTafsir(input: string, language: string = 'english'): Promise<OpenAIResponse> {
    return {
      success: false,
      error: 'Tafsir feature has been removed due to AI accuracy concerns. Please consult authentic Islamic scholars or verified tafsir books for Quranic explanations.'
    }
  }

  // OLD TAFSIR CODE REMOVED FOR SAFETY
  /*
  async generateTafsir_OLD(input: string, language: string = 'english'): Promise<OpenAIResponse> {
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