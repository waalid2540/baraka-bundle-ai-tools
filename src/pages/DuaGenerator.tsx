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
    if (!selectedTopic && !customRequest.trim()) {
      setError('Please select a topic or describe your request')
      return
    }

    try {
      setLoading(true)
      setError('')

      const request = selectedTopic 
        ? duaTopics.find(topic => topic.id === selectedTopic)?.name || selectedTopic
        : customRequest

      const response = await openaiService.generateDua('User', request, selectedLanguages)

      if (response.success && response.data) {
        const content = response.data.content
        const arabicMatch = content.match(/\*\*Arabic:\*\*\s*(.+?)(?=\*\*|$)/s)
        const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*(.+?)(?=\*\*|$)/s)
        
        // Parse only selected language translations
        const translations: Record<string, string> = {}
        
        selectedLanguages.forEach(language => {
          const match = content.match(new RegExp(`\\*\\*Translation in ${language}:\\*\\*\\s*(.+?)(?=\\*\\*|$)`, 's'))
          if (match) {
            translations[language.toLowerCase()] = match[1].trim()
          }
        })

        const duaData = {
          arabicText: arabicMatch ? arabicMatch[1].trim() : 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي',
          transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
          translation: translations['english'] || Object.values(translations)[0] || '',
          situation: request,
          language: selectedLanguages[0] || 'English',
          topic: selectedTopic,
          // Only selected translations
          translations: translations
        }

        setGeneratedDua(duaData)
      } else {
        setError(response.error || 'Failed to generate dua. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-xl text-white">🤲</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Du'a Generator</h1>
                <p className="text-sm text-slate-500">Powered by AI & Islamic teachings</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-slate-500 hover:text-slate-700 transition-colors font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!generatedDua ? (
          // Topic Selection Interface
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">What do you need a du'a for?</h2>
              <p className="text-slate-600 text-lg">Select your language, topic, or describe your specific need</p>
            </div>

            {/* Language Selection - USER CHOOSES */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">🌍</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">Select Languages You Want</h3>
                  <p className="text-sm text-slate-500">Choose which languages to include in your du'a</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {languages.map((language) => (
                  <label
                    key={language.code}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-102 hover:shadow-md ${
                      selectedLanguages.includes(language.code)
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                        : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language.code)}
                      onChange={() => toggleLanguage(language.code)}
                      className="sr-only"
                    />
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{language.flag}</span>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedLanguages.includes(language.code)
                          ? 'bg-white border-white'
                          : 'border-slate-300 group-hover:border-blue-400'
                      }`}>
                        {selectedLanguages.includes(language.code) && (
                          <span className="text-blue-600 text-sm font-bold">✓</span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`font-semibold text-sm mb-1 ${
                      selectedLanguages.includes(language.code) ? 'text-white' : 'text-slate-700'
                    }`}>
                      {language.name}
                    </div>
                    <div className={`text-xs ${
                      selectedLanguages.includes(language.code) ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {language.nativeName}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 mb-2">
                  Selected ({selectedLanguages.length}):
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedLanguages.map(langCode => {
                    const lang = languages.find(l => l.code === langCode)
                    return (
                      <span key={langCode} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {lang?.flag} {lang?.name}
                      </span>
                    )
                  })}
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generateDua}
                disabled={loading || (!selectedTopic && !customRequest.trim())}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto min-w-[200px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🤲</span>
                    <span>Generate Du'a</span>
                  </>
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