import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import canvaService from '../services/canvaService'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    situation: '',
    language: 'English'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)

  const languages = [
    'English', 'Arabic', 'Somali', 'Urdu', 'Turkish', 'Indonesian',
    'French', 'Spanish', 'Malay', 'Bengali', 'Swahili', 'German'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateDua = async () => {
    if (!formData.situation.trim()) {
      setError('Please describe your situation')
      return
    }

    try {
      setLoading(true)
      setError('')

      const prompt = `Generate a beautiful, authentic Islamic dua for: "${formData.situation}"

      Please provide:
      1. Authentic Arabic text with proper diacritics
      2. Clear transliteration for pronunciation
      3. Meaningful translation in ${formData.language}
      
      Format exactly as:
      **Arabic:** [Arabic text]
      **Transliteration:** [Pronunciation guide]
      **Translation:** [Meaning in ${formData.language}]`

      const response = await openaiService.generateDua('User', formData.situation, formData.language)

      if (response.success && response.data) {
        // The OpenAI service returns the content in response.data.content
        const content = response.data.content
        const arabicMatch = content.match(/\*\*Arabic:\*\*\s*(.+?)(?=\*\*|$)/s)
        const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*(.+?)(?=\*\*|$)/s)
        const translationMatch = content.match(/\*\*Translation:\*\*\s*(.+?)(?=\*\*|$)/s)

        const duaData = {
          arabicText: arabicMatch ? arabicMatch[1].trim() : 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا أَعْطَيْتَنَا',
          transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
          translation: translationMatch ? translationMatch[1].trim() : '',
          situation: formData.situation,
          language: formData.language
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

  const downloadCanvaPdf = async (theme: string) => {
    if (!generatedDua) return

    try {
      setLoading(true)
      const pdfBlob = await canvaService.generateBeautifulPdf(generatedDua, theme)
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `BarakahTool_${theme}_${Date.now()}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please check your Canva credentials.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ situation: '', language: 'English' })
    setGeneratedDua(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🤲</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Dua Generator</h1>
                <p className="text-sm text-slate-400">Powered by GPT-5 & Canva</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!generatedDua ? (
          // Input Form
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">Request Your Personal Dua</h2>
              <p className="text-slate-300 text-lg">Describe your situation and get an authentic Islamic dua</p>
            </div>

            <div className="space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-white font-semibold mb-3">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Situation Input */}
              <div>
                <label className="block text-white font-semibold mb-3">Your Situation</label>
                <textarea
                  name="situation"
                  value={formData.situation}
                  onChange={handleInputChange}
                  placeholder="Describe what you need dua for... (e.g., success in work, protection from harm, guidance in decisions)"
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateDua}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Your Dua...</span>
                  </>
                ) : (
                  <>
                    <span>🤲</span>
                    <span>Generate My Dua</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Generated Dua Display
          <div className="space-y-8">
            {/* Dua Content */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your Personal Dua</h2>
                <p className="text-slate-400">For: {generatedDua.situation}</p>
              </div>

              <div className="space-y-6">
                {/* Arabic Text */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-3">Arabic</h3>
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <p className="text-2xl text-white leading-relaxed" dir="rtl" lang="ar">
                      {generatedDua.arabicText}
                    </p>
                  </div>
                </div>

                {/* Transliteration */}
                {generatedDua.transliteration && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-3">Pronunciation</h3>
                    <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                      <p className="text-lg text-slate-300 italic leading-relaxed">
                        {generatedDua.transliteration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Translation */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-3">Meaning</h3>
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <p className="text-lg text-slate-300 leading-relaxed">
                      "{generatedDua.translation}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Download Options */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-2xl">
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Download Beautiful PDF</h3>
                  <p className="text-slate-300">Choose your favorite design theme</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => downloadCanvaPdf('rizq')}
                    disabled={loading}
                    className="bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">💰</span>
                    <span className="text-sm">Sustenance</span>
                  </button>
                  
                  <button
                    onClick={() => downloadCanvaPdf('protection')}
                    disabled={loading}
                    className="bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🛡️</span>
                    <span className="text-sm">Protection</span>
                  </button>
                  
                  <button
                    onClick={() => downloadCanvaPdf('guidance')}
                    disabled={loading}
                    className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">⭐</span>
                    <span className="text-sm">Guidance</span>
                  </button>
                  
                  <button
                    onClick={() => downloadCanvaPdf('forgiveness')}
                    disabled={loading}
                    className="bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">✨</span>
                    <span className="text-sm">Forgiveness</span>
                  </button>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        const success = await canvaService.testConnection()
                        if (success) {
                          alert('✅ Canva is connected and ready!')
                        }
                      } catch (error) {
                        console.error('Canva test error:', error)
                      }
                    }}
                    className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    🧪 Test Canva Connection
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <span>✨</span>
                <span>Generate Another Dua</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DuaGenerator