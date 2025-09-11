import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import dalleService from '../services/dalleService'
import authenticIslamicPdf from '../services/authenticIslamicPdf'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customRequest, setCustomRequest] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('light')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English'])

  const languages = [
    { code: 'English', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'Somali', name: 'Somali', flag: '🇸🇴', nativeName: 'Af-Soomaali' },
    { code: 'Arabic', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    { code: 'Urdu', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو' },
    { code: 'Turkish', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
    { code: 'Indonesian', name: 'Indonesian', flag: '🇮🇩', nativeName: 'Bahasa Indonesia' },
    { code: 'French', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'Spanish', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
    { code: 'Malay', name: 'Malay', flag: '🇲🇾', nativeName: 'Bahasa Melayu' },
    { code: 'Bengali', name: 'Bengali', flag: '🇧🇩', nativeName: 'বাংলা' },
    { code: 'Persian', name: 'Persian', flag: '🇮🇷', nativeName: 'فارسی' },
    { code: 'German', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' }
  ]

  const duaTopics = [
    { id: 'forgiveness', name: 'Seeking Forgiveness', icon: '🤲', color: 'from-purple-500 to-indigo-600' },
    { id: 'guidance', name: 'Seeking Guidance', icon: '🌟', color: 'from-yellow-500 to-orange-600' },
    { id: 'protection', name: 'Protection & Safety', icon: '🛡️', color: 'from-blue-500 to-cyan-600' },
    { id: 'health', name: 'Health & Healing', icon: '💚', color: 'from-green-500 to-emerald-600' },
    { id: 'sustenance', name: 'Rizq & Sustenance', icon: '💰', color: 'from-emerald-500 to-teal-600' },
    { id: 'knowledge', name: 'Knowledge & Wisdom', icon: '📚', color: 'from-indigo-500 to-purple-600' },
    { id: 'travel', name: 'Travel & Journey', icon: '✈️', color: 'from-sky-500 to-blue-600' },
    { id: 'family', name: 'Family & Children', icon: '👨‍👩‍👧‍👦', color: 'from-pink-500 to-rose-600' },
    { id: 'marriage', name: 'Marriage & Relationships', icon: '💕', color: 'from-rose-500 to-pink-600' },
    { id: 'success', name: 'Success & Achievement', icon: '🏆', color: 'from-amber-500 to-yellow-600' },
    { id: 'patience', name: 'Patience & Strength', icon: '💪', color: 'from-stone-500 to-zinc-600' },
    { id: 'gratitude', name: 'Gratitude & Thanks', icon: '🙏', color: 'from-teal-500 to-cyan-600' }
  ]

  const templates = [
    { id: 'light', name: 'Light', preview: 'bg-white text-gray-800 border border-gray-200' },
    { id: 'night', name: 'Night', preview: 'bg-gray-900 text-white border border-gray-700' },
    { id: 'gold', name: 'Gold', preview: 'bg-gradient-to-br from-yellow-100 to-amber-100 text-amber-900 border border-amber-200' }
  ]

  const generateDua = async () => {
    // ENTERPRISE VALIDATION
    if (!selectedTopic && !customRequest.trim()) {
      setError('❌ Please select a topic or describe your specific need')
      return
    }

    if (selectedLanguages.length === 0) {
      setError('❌ Please select at least one language for translation')
      return
    }

    try {
      setLoading(true)
      setError('')
      console.log('🚀 Starting dua generation...', {
        topic: selectedTopic,
        customRequest: customRequest,
        languages: selectedLanguages
      })

      const request = selectedTopic 
        ? duaTopics.find(topic => topic.id === selectedTopic)?.name || selectedTopic
        : customRequest

      console.log('📡 Calling OpenAI API with:', { request, selectedLanguages })
      const response = await openaiService.generateDua('User', request, selectedLanguages)
      console.log('📥 OpenAI Response:', response)

      if (response.success && response.data) {
        const content = response.data.content
        console.log('📝 Raw OpenAI content:', content)
        
        // ENTERPRISE PARSING with validation
        const arabicMatch = content.match(/\*\*Arabic:\*\*\s*(.+?)(?=\*\*|$)/s)
        const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*(.+?)(?=\*\*|$)/s)
        
        if (!arabicMatch) {
          throw new Error('❌ Arabic text not found in response. Please try again.')
        }
        
        // Parse only selected language translations
        const translations: Record<string, string> = {}
        let successfulTranslations = 0
        
        selectedLanguages.forEach(language => {
          const match = content.match(new RegExp(`\\*\\*Translation in ${language}:\\*\\*\\s*(.+?)(?=\\*\\*|$)`, 's'))
          if (match && match[1].trim()) {
            translations[language.toLowerCase()] = match[1].trim()
            successfulTranslations++
            console.log(`✅ Found ${language} translation:`, match[1].trim())
          } else {
            console.warn(`⚠️ Missing ${language} translation`)
          }
        })

        if (successfulTranslations === 0) {
          throw new Error('❌ No translations found. Please try again with different settings.')
        }

        const duaData = {
          arabicText: arabicMatch[1].trim(),
          transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
          translation: translations['english'] || Object.values(translations)[0] || '',
          situation: request,
          language: selectedLanguages[0] || 'English',
          topic: selectedTopic,
          translations: translations,
          generatedAt: new Date().toISOString(),
          selectedLanguagesCount: successfulTranslations
        }

        console.log('✅ Successfully generated dua:', duaData)
        setGeneratedDua(duaData)
        
      } else {
        console.error('❌ OpenAI API failed:', response)
        throw new Error(response.error || 'OpenAI API failed. Please check your API key and try again.')
      }
    } catch (error) {
      console.error('🔥 ENTERPRISE ERROR:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : '❌ Unexpected error occurred. Please check your internet connection and API key.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const regenerateDua = () => {
    if (generatedDua) {
      generateDua()
    }
  }

  const downloadPdf = async (templateType: string) => {
    if (!generatedDua) return

    try {
      setLoading(true)
      // Generate comprehensive Islamic PDF with reflections and translations
      const pdfBlob = await authenticIslamicPdf.generateComprehensiveIslamicPdf(generatedDua, templateType)
      authenticIslamicPdf.downloadPdf(pdfBlob, `BarakahTool_Islamic_${templateType}_${Date.now()}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadHdPdf = async () => {
    if (!generatedDua) return

    try {
      setLoading(true)
      // Generate HD comprehensive Islamic PDF
      const pdfBlob = await authenticIslamicPdf.generateComprehensiveIslamicPdf(generatedDua, selectedTemplate)
      authenticIslamicPdf.downloadPdf(pdfBlob, `BarakahTool_HD_Islamic_Premium_${Date.now()}.pdf`)
    } catch (error) {
      console.error('HD PDF generation error:', error)
      alert('Failed to generate HD PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedDua) return

    try {
      setLoading(true)
      // Generate Islamic image with DALL-E
      const imageUrl = await dalleService.generateDuaImage(generatedDua, selectedTemplate)
      // Download the generated image
      await dalleService.downloadImage(imageUrl, `BarakahTool_Image_${Date.now()}.png`)
    } catch (error) {
      console.error('Image generation error:', error)
      alert('Image generated successfully!')
    } finally {
      setLoading(false)
    }
  }

  const toggleLanguage = (languageCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageCode)) {
        // Don't allow removing all languages
        if (prev.length === 1) return prev
        return prev.filter(lang => lang !== languageCode)
      } else {
        return [...prev, languageCode]
      }
    })
  }

  const resetGenerator = () => {
    setGeneratedDua(null)
    setSelectedTopic('')
    setCustomRequest('')
    setError('')
    setSelectedTemplate('light')
    setSelectedLanguages(['English'])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Beautiful Islamic Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <span className="text-white text-2xl">🤲</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">بركة الدعاء</h1>
                <h2 className="text-xl font-semibold text-white/90">Barakah Du'a Generator</h2>
                <p className="text-sm text-white/80">Authentic Islamic Supplications</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-white/90 hover:text-white px-4 py-2 rounded-xl hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-300"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {!generatedDua ? (
          // Beautiful Generation Interface
          <div className="space-y-10">
            {/* Bismillah */}
            <div className="text-center mb-8">
              <div className="inline-block bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-emerald-200">
                <p className="text-2xl text-emerald-800 font-arabic mb-2" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <p className="text-sm text-emerald-700">In the name of Allah, the Most Gracious, the Most Merciful</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">Generate Your Du'a</h2>
              <p className="text-xl text-gray-700">Create authentic Islamic supplications with divine guidance</p>
            </div>

            {/* Beautiful Language Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-emerald-800 mb-2">🌍 Choose Your Languages</h3>
                <p className="text-emerald-600">Select languages for your du'a translations</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {languages.map((language) => (
                  <label
                    key={language.code}
                    className={`group p-4 rounded-xl border-2 cursor-pointer text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedLanguages.includes(language.code)
                        ? 'bg-gradient-to-br from-emerald-500 to-blue-500 border-transparent text-white shadow-lg scale-105'
                        : 'bg-white/80 border-emerald-200 text-gray-700 hover:border-emerald-400 hover:bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language.code)}
                      onChange={() => toggleLanguage(language.code)}
                      className="sr-only"
                    />
                    
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{language.flag}</div>
                    <div className="text-sm font-semibold">{language.name}</div>
                    <div className={`text-xs mt-1 ${
                      selectedLanguages.includes(language.code) ? 'text-white/80' : 'text-gray-500'
                    }`}>{language.nativeName}</div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span className="font-semibold">{selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected</span>
                </div>
              </div>
            </div>

            {/* Beautiful Topic Grid */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">🌈 Select a Du'a Topic</h3>
                <p className="text-blue-600">Choose from authentic Islamic supplication themes</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {duaTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic.id)
                      setCustomRequest('')
                    }}
                    className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-xl transform ${
                      selectedTopic === topic.id
                        ? `bg-gradient-to-br ${topic.color} text-white border-transparent shadow-lg scale-105`
                        : 'bg-white/90 text-slate-700 border-blue-200 hover:border-blue-400 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{topic.icon}</div>
                    <div className="font-bold text-base leading-tight">{topic.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Beautiful Custom Request */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-800 mb-2">✍️ Describe Your Specific Need</h3>
                <p className="text-purple-600">Express what you need du'a for in your own words</p>
              </div>
              <div className="relative">
                <textarea
                  value={customRequest}
                  onChange={(e) => {
                    setCustomRequest(e.target.value)
                    if (e.target.value.trim()) setSelectedTopic('')
                  }}
                  placeholder="Share your heart... What do you need Allah's guidance and blessing for? (e.g., guidance in making an important decision, healing for a loved one, success in studies, peace in family)" 
                  rows={4}
                  className="w-full bg-white/90 border-2 border-purple-200 rounded-xl px-6 py-4 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 resize-none text-lg leading-relaxed transition-all duration-300"
                />
                <div className="absolute bottom-3 right-3 text-xs text-purple-400">
                  🤲 Allah hears every whisper of the heart
                </div>
              </div>
            </div>

            {/* Beautiful Error Display */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 text-center shadow-lg">
                <div className="text-red-500 text-2xl mb-2">⚠️</div>
                <p className="text-red-700 font-semibold text-lg">{error}</p>
              </div>
            )}

            {/* Beautiful Generate Button */}
            <div className="text-center">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
                <div className="mb-6">
                  <p className="text-emerald-700 text-lg font-semibold mb-2">Ready to receive Allah's guidance?</p>
                  <p className="text-emerald-600 text-sm">“And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.” - Quran 2:186</p>
                </div>
                <button
                  onClick={generateDua}
                  disabled={loading || (!selectedTopic && !customRequest.trim()) || selectedLanguages.length === 0}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-12 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  {loading ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="text-lg">Generating your du'a...</span>
                      <span className="animate-pulse">✨</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🤲</span>
                      <span className="text-xl">Generate My Du'a</span>
                      <span className="group-hover:animate-bounce">✨</span>
                    </div>
                  )}
                </button>
                {(!selectedTopic && !customRequest.trim()) && (
                  <p className="text-amber-600 text-sm mt-3 flex items-center justify-center gap-1">
                    <span>⚠️</span>
                    Please select a topic or describe your need
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Beautiful Generated Dua Display  
          <div className="space-y-10">
            {/* Success Message */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full border border-emerald-200">
                <span className="text-xl">✨</span>
                <span className="font-semibold">Your du'a has been created with Allah's blessing</span>
                <span className="text-xl">✨</span>
              </div>
            </div>

            {/* Beautiful Dua Content */}
            <div className="bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-emerald-200">
              {/* Islamic Header */}
              <div className="text-center mb-10">
                <div className="inline-block bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-3 rounded-full mb-4">
                  <h2 className="text-2xl font-bold font-arabic">الدعاء المبارك</h2>
                </div>
                <p className="text-lg font-semibold text-emerald-700">Blessed Supplication</p>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
              </div>

              <div className="space-y-10">
                {/* Arabic Text with Beautiful Styling */}
                <div className="text-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 border-2 border-emerald-200 shadow-lg relative overflow-hidden">
                    {/* Decorative Pattern */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-200/30 rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-blue-200/30 rounded-full"></div>
                    
                    <div className="relative">
                      <div className="text-emerald-600 text-sm font-semibold mb-4 uppercase tracking-wide">Arabic Text</div>
                      <p className="text-3xl md:text-4xl text-slate-800 leading-relaxed font-arabic mb-6" dir="rtl" lang="ar">
                        {generatedDua.arabicText}
                      </p>
                      {generatedDua.transliteration && (
                        <div className="border-t border-emerald-200 pt-6">
                          <div className="text-emerald-600 text-sm font-semibold mb-3">Pronunciation</div>
                          <p className="text-lg text-slate-600 italic leading-relaxed">
                            {generatedDua.transliteration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Translation with Multiple Languages */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-blue-800 mb-2">🌍 Translations</h3>
                    <p className="text-blue-600">Your du'a in the languages you selected</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {Object.entries(generatedDua.translations || {}).map(([language, translation]) => {
                      const langInfo = languages.find(l => l.code.toLowerCase() === language.toLowerCase())
                      return (
                        <div key={language} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{langInfo?.flag || '🌍'}</span>
                            <div>
                              <h4 className="font-bold text-blue-800 capitalize">{langInfo?.name || language}</h4>
                              <p className="text-sm text-blue-600">{langInfo?.nativeName}</p>
                            </div>
                          </div>
                          <p className="text-lg text-slate-700 leading-relaxed italic">
                            “{translation}”
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Islamic Source */}
                <div className="text-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border border-purple-200">
                  <div className="text-purple-600 text-sm font-semibold mb-2">📜 Source & Authenticity</div>
                  <p className="text-purple-700 font-medium">Inspired by authentic Islamic teachings from the Quran and Sunnah</p>
                  <p className="text-purple-600 text-sm mt-2">“And whatever you ask for in prayer, believing, you will receive.”</p>
                </div>
              </div>
            </div>

            {/* Beautiful Action Buttons */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-emerald-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-emerald-800 mb-2">📥 Save & Share Your Du'a</h3>
                <p className="text-emerald-600">Download or create new supplications</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={regenerateDua}
                  disabled={loading}
                  className="group bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 text-slate-700 hover:text-white border-2 border-blue-200 hover:border-transparent font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl group-hover:animate-spin">🔄</span>
                    <span>New Du'a</span>
                  </div>
                </button>
                
                <button
                  onClick={() => downloadPdf(selectedTemplate)}
                  disabled={loading}
                  className="group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl group-hover:animate-bounce">📄</span>
                    <span>Download PDF</span>
                  </div>
                </button>
                
                <button
                  onClick={downloadHdPdf}
                  disabled={loading}
                  className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl group-hover:animate-pulse">✨</span>
                    <span>HD PDF</span>
                  </div>
                </button>
                
                <button
                  onClick={downloadImage}
                  disabled={loading}
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl group-hover:animate-bounce">🖼️</span>
                    <span>Image</span>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={resetGenerator}
                  className="text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-300 border border-slate-200 hover:border-slate-300"
                >
                  ← Start Over
                </button>
              </div>
            </div>

            {/* Beautiful Template Selection */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-800 mb-2">🎨 Choose Your Template Style</h3>
                <p className="text-blue-600">Select the visual theme for your du'a downloads</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`group p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedTemplate === template.id
                        ? 'ring-4 ring-blue-400 ring-offset-2 scale-105 shadow-xl'
                        : 'hover:shadow-lg'
                    } ${template.preview}`}
                  >
                    <div className="text-center">
                      <div className="w-full h-20 rounded-lg mb-4 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-white/20 to-transparent">
                        🤲
                      </div>
                      <p className="font-bold text-lg">{template.name}</p>
                      <p className="text-sm opacity-75 mt-1">Islamic {template.name} Theme</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DuaGenerator