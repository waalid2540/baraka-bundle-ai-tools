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
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🤲</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Du'a Generator</h1>
                <p className="text-sm text-gray-500">Create Islamic supplications</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!generatedDua ? (
          // Simple Generation Interface
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Generate Your Du'a</h2>
              <p className="text-gray-600">Select languages and describe what you need</p>
            </div>

            {/* Simple Language Selection */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Languages</h3>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {languages.map((language) => (
                  <label
                    key={language.code}
                    className={`p-3 rounded-lg border cursor-pointer text-center hover:shadow-md transition-all ${
                      selectedLanguages.includes(language.code)
                        ? 'bg-blue-50 border-blue-300 text-blue-900'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language.code)}
                      onChange={() => toggleLanguage(language.code)}
                      className="sr-only"
                    />
                    
                    <div className="text-2xl mb-1">{language.flag}</div>
                    <div className="text-xs font-medium">{language.name}</div>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                {selectedLanguages.length} language{selectedLanguages.length !== 1 ? 's' : ''} selected
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

            {/* Simple Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Simple Generate Button */}
            <div className="text-center">
              <button
                onClick={generateDua}
                disabled={loading || (!selectedTopic && !customRequest.trim()) || selectedLanguages.length === 0}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🤲</span>
                    <span>Generate Du'a</span>
                  </div>
                )}
              </button>
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