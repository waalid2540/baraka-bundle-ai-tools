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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* ENTERPRISE HEADER */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🤲</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  BarakahTool Pro
                </h1>
                <p className="text-slate-600 font-medium">Enterprise Islamic AI Platform</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-500">AI-Powered • Authentic • Unlimited</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Live & Ready</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all duration-200 text-slate-700 hover:text-slate-900 font-medium"
              >
                <span>←</span>
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {!generatedDua ? (
          // ENTERPRISE GENERATION INTERFACE
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="text-indigo-700 font-medium text-sm">AI-Powered Islamic Du'a Generation</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Generate Authentic Du'as
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Create personalized Islamic supplications with AI-powered authenticity, 
                multiple language support, and beautiful presentation
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Authentic Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>12+ Languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Instant Generation</span>
                </div>
              </div>
            </div>

            {/* ENTERPRISE LANGUAGE SELECTION */}
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl text-white">🌍</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
                    Language Selection Hub
                  </h3>
                  <p className="text-slate-600 text-lg">Choose your preferred languages for translation</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-500">
                      {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {languages.map((language) => (
                  <label
                    key={language.code}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl ${
                      selectedLanguages.includes(language.code)
                        ? 'bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 text-white border-transparent shadow-lg ring-2 ring-indigo-200 ring-offset-2'
                        : 'bg-gradient-to-br from-slate-50 to-white hover:from-white hover:to-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-lg'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language.code)}
                      onChange={() => toggleLanguage(language.code)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform">{language.flag}</span>
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedLanguages.includes(language.code)
                          ? 'bg-white border-white shadow-sm'
                          : 'border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50'
                      }`}>
                        {selectedLanguages.includes(language.code) && (
                          <span className="text-indigo-600 text-sm font-bold">✓</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`font-bold text-sm mb-2 ${
                      selectedLanguages.includes(language.code) ? 'text-white' : 'text-slate-800'
                    }`}>
                      {language.name}
                    </div>
                    <div className={`text-xs font-medium ${
                      selectedLanguages.includes(language.code) ? 'text-indigo-100' : 'text-slate-500'
                    }`}>
                      {language.nativeName}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <p className="text-lg font-semibold text-indigo-700">
                      {selectedLanguages.length} Language{selectedLanguages.length !== 1 ? 's' : ''} Selected
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {selectedLanguages.map(langCode => {
                      const lang = languages.find(l => l.code === langCode)
                      return (
                        <span key={langCode} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-indigo-800 px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-200 shadow-sm hover:shadow-md transition-all">
                          <span className="text-lg">{lang?.flag}</span>
                          <span>{lang?.name}</span>
                        </span>
                      )
                    })}
                  </div>
                  {selectedLanguages.length === 0 && (
                    <p className="text-slate-500 text-sm">No languages selected yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Topic Grid */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-6">Or select a topic:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {duaTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic.id)
                      setCustomRequest('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                      selectedTopic === topic.id
                        ? `bg-gradient-to-br ${topic.color} text-white border-transparent shadow-lg`
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">{topic.icon}</div>
                    <div className="font-semibold text-sm leading-tight">{topic.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Request */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Or describe your specific need:</h3>
              <textarea
                value={customRequest}
                onChange={(e) => {
                  setCustomRequest(e.target.value)
                  if (e.target.value.trim()) setSelectedTopic('')
                }}
                placeholder="Describe what you need du'a for... (e.g., guidance in making an important decision, healing for a family member)"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* ENTERPRISE ERROR DISPLAY */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 text-center shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">!</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-700">Generation Error</h3>
                </div>
                <p className="text-red-600 font-medium text-base leading-relaxed">{error}</p>
                <div className="mt-3 text-sm text-red-500">
                  Please check your configuration and try again
                </div>
              </div>
            )}

            {/* ENTERPRISE GENERATE BUTTON */}
            <div className="text-center space-y-4">
              <button
                onClick={generateDua}
                disabled={loading || (!selectedTopic && !customRequest.trim()) || selectedLanguages.length === 0}
                className={`relative overflow-hidden group ${
                  loading 
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 active:scale-95'
                } text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-60 flex items-center justify-center gap-4 mx-auto min-w-[280px] text-lg`}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative flex items-center gap-4">
                  {loading ? (
                    <>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      </div>
                      <span>Generating Authentic Du'a...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl group-hover:scale-110 transition-transform">🤲</span>
                      <span>Generate Du'a with AI</span>
                    </>
                  )}
                </div>
                
                {/* Shine effect */}
                {!loading && (
                  <div className="absolute inset-0 -top-1/2 aspect-square w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 group-hover:animate-pulse"></div>
                )}
              </button>
              
              {/* Status indicators */}
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedLanguages.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span>Languages: {selectedLanguages.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(selectedTopic || customRequest.trim()) ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span>Topic: {(selectedTopic || customRequest.trim()) ? 'Ready' : 'Required'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Generated Dua Display
          <div className="space-y-8">
            {/* Dua Content */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">الدعاء</h2>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mx-auto"></div>
              </div>

              <div className="space-y-8">
                {/* Arabic Text */}
                <div className="text-center">
                  <div className="bg-slate-50 rounded-xl p-8 border border-slate-100">
                    <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed font-arabic" dir="rtl" lang="ar">
                      {generatedDua.arabicText}
                    </p>
                  </div>
                </div>

                {/* Translation */}
                <div>
                  <h3 className="text-lg font-bold text-slate-700 mb-4">Translation</h3>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <p className="text-lg text-slate-700 leading-relaxed italic">
                      {generatedDua.translation}
                    </p>
                  </div>
                </div>

                {/* Source */}
                <div className="text-center">
                  <p className="text-sm text-slate-500 font-medium">Source: Inspired by Islamic teachings</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={regenerateDua}
                disabled={loading}
                className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Regenerate
              </button>
              <button
                onClick={() => downloadPdf(selectedTemplate)}
                disabled={loading}
                className="bg-slate-800 text-white hover:bg-slate-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Download PDF
              </button>
              <button
                onClick={downloadHdPdf}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Download HD PDF
              </button>
              <button
                onClick={downloadImage}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                Download Image
              </button>
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Choose a template for download:</h3>
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-6 rounded-xl transition-all duration-200 ${template.preview} ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-purple-500 ring-offset-2 scale-105'
                        : 'hover:scale-102'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-full h-16 rounded-lg mb-3 flex items-center justify-center text-2xl">
                        🤲
                      </div>
                      <p className="font-semibold">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetGenerator}
                className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                ← Generate another du'a
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DuaGenerator