import { authenticQuranData, authenticDuaData } from '../data/authenticQuran'

class AuthenticIslamicService {
  
  // Get authentic du'a without AI generation
  getAuthenticDua(category: string, language: string = 'english'): any {
    const categoryData = authenticDuaData[category as keyof typeof authenticDuaData] || authenticDuaData.gratitude
    
    // Randomly select from authentic du'as
    const randomIndex = Math.floor(Math.random() * categoryData.length)
    const selectedDua = categoryData[randomIndex]
    
    return {
      title: `Authentic ${category.charAt(0).toUpperCase() + category.slice(1)} Du'a`,
      arabicText: selectedDua.arabic,
      transliteration: selectedDua.transliteration,
      translation: selectedDua.translation,
      occasion: selectedDua.occasion,
      source: selectedDua.source,
      category: category,
      benefits: "Authentic du'a from verified Islamic sources",
      times: "Any time",
      isAuthentic: true
    }
  }
  
  // Get authentic Quran verses and tafsir
  getAuthenticTafsir(surahNumber: string, verseNumber?: string): any {
    const surahData = authenticQuranData[surahNumber as keyof typeof authenticQuranData]
    
    if (!surahData) {
      return {
        error: "Surah not found in authentic database",
        suggestion: "Please check the surah number and try again"
      }
    }
    
    if (verseNumber) {
      const verse = surahData.verses.find(v => v.number === parseInt(verseNumber))
      if (!verse) {
        return {
          error: `Verse ${verseNumber} not found in Surah ${surahData.name}`,
          suggestion: `This surah has ${surahData.totalVerses} verses`
        }
      }
      
      return {
        input: `${surahNumber}:${verseNumber}`,
        verseReference: `Surah ${surahData.name} (${surahNumber}:${verseNumber})`,
        arabicText: verse.arabic,
        translation: verse.translation,
        transliteration: verse.transliteration,
        tafsirSummaries: [
          {
            scholar: "Ibn Kathir",
            explanation: surahData.tafsir["Ibn Kathir"],
            source: "Tafsir Ibn Kathir"
          },
          {
            scholar: "As-Sa'di", 
            explanation: surahData.tafsir["As-Sa'di"],
            source: "Taysir al-Karim ar-Rahman"
          }
        ],
        themes: surahData.themes,
        revelation: surahData.revelation,
        isAuthentic: true
      }
    }
    
    // Return full surah info
    return {
      input: surahNumber,
      verseReference: `Surah ${surahData.name} (${surahNumber})`,
      arabicText: surahData.verses.map(v => v.arabic).join(' '),
      translation: surahData.verses.map(v => v.translation).join(' '),
      surahInfo: {
        name: surahData.name,
        nameArabic: surahData.nameArabic,
        meaning: surahData.meaning,
        totalVerses: surahData.totalVerses,
        revelation: surahData.revelation
      },
      tafsirSummaries: [
        {
          scholar: "Ibn Kathir",
          explanation: surahData.tafsir["Ibn Kathir"],
          source: "Tafsir Ibn Kathir"
        }
      ],
      themes: surahData.themes,
      isAuthentic: true
    }
  }
  
  // Get authentic Islamic names
  getAuthenticNames(gender: 'male' | 'female', theme: string, count: number = 5): any {
    const maleNames = [
      {
        name: "Muhammad",
        arabicScript: "مُحَمَّد",
        meaning: "Praised, commendable",
        origin: "Arabic",
        islamicHistory: "The final Prophet and Messenger of Allah",
        pronunciation: "Mu-ham-mad",
        famousPersons: ["Prophet Muhammad ﷺ"],
        verified: true
      },
      {
        name: "Ali",
        arabicScript: "عَلِيّ",
        meaning: "Elevated, noble, sublime",
        origin: "Arabic",
        islamicHistory: "Fourth Rightly-Guided Caliph, cousin of Prophet ﷺ",
        pronunciation: "A-lee",
        famousPersons: ["Ali ibn Abi Talib (RA)"],
        verified: true
      },
      {
        name: "Omar",
        arabicScript: "عُمَر",
        meaning: "Life, long-lived",
        origin: "Arabic", 
        islamicHistory: "Second Rightly-Guided Caliph",
        pronunciation: "O-mar",
        famousPersons: ["Umar ibn al-Khattab (RA)"],
        verified: true
      }
    ]
    
    const femaleNames = [
      {
        name: "Aisha",
        arabicScript: "عَائِشَة",
        meaning: "Living, alive",
        origin: "Arabic",
        islamicHistory: "Wife of Prophet Muhammad ﷺ, Mother of Believers",
        pronunciation: "A-i-sha",
        famousPersons: ["Aisha bint Abu Bakr (RA)"],
        verified: true
      },
      {
        name: "Fatimah",
        arabicScript: "فَاطِمَة",
        meaning: "Captivating, one who abstains",
        origin: "Arabic",
        islamicHistory: "Daughter of Prophet Muhammad ﷺ",
        pronunciation: "Fa-ti-mah",
        famousPersons: ["Fatimah az-Zahra (RA)"],
        verified: true
      },
      {
        name: "Khadijah",
        arabicScript: "خَدِيجَة",
        meaning: "Premature child",
        origin: "Arabic",
        islamicHistory: "First wife of Prophet Muhammad ﷺ, first Muslim woman",
        pronunciation: "Kha-di-jah",
        famousPersons: ["Khadijah bint Khuwaylid (RA)"],
        verified: true
      }
    ]
    
    const names = gender === 'male' ? maleNames : femaleNames
    return {
      names: names.slice(0, count),
      totalDatabase: `${maleNames.length + femaleNames.length} verified authentic names`,
      isAuthentic: true
    }
  }
}

export const authenticIslamicService = new AuthenticIslamicService()
export default authenticIslamicService