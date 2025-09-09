import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import stripeService from '../services/stripeService'
import workingPdfGenerator from '../services/workingPdfGenerator'
import { getThemeNames, getTheme } from '../services/pdfTemplates'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    situation: '',
    language: 'English',
    theme: 'royalGold'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  const languages = openaiService.getSupportedLanguages()
  const themeNames = getThemeNames()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.situation.trim()) {
      setError('Please describe your situation')
      return
    }

    setShowPayment(true)
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      // For demo purposes, skip actual payment and generate dua
      // In production, process payment first
      await generateDua()
    } catch (err) {
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  const generateDua = async () => {
    try {
      setLoading(true)
      setError('')

      // Generate dua using OpenAI
      const response = await openaiService.generateDua(
        'User',
        formData.situation,
        formData.language
      )

      if (response.success && response.data) {
        // Parse the response to extract Arabic, transliteration, and translation
        const content = response.data.content
        const arabicMatch = content.match(/\*\*Arabic:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
        const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
        const translationMatch = content.match(/\*\*Translation[^:]*:\*\*\s*([\s\S]*?)(?=\n\n|$)/i)
        
        const duaData = {
          arabicText: arabicMatch ? arabicMatch[1].trim() : '',
          transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
          translation: translationMatch ? translationMatch[1].trim() : '',
          name: 'User',
          situation: formData.situation,
          language: formData.language,
          theme: formData.theme
        }

        // Debug: Log the parsed data
        console.log('Generated Dua Data:', duaData)
        console.log('Original content:', content)

        setGeneratedDua(duaData)
        
        // Generate working PDF with no HTML/CSS issues
        const pdfBlob = await workingPdfGenerator.generateWorkingPdf(duaData)
        workingPdfGenerator.downloadPdf(pdfBlob, `Premium_Islamic_Dua_${Date.now()}`)
      } else {
        setError(response.error || 'Failed to generate dua')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">Duʿā Generator</h1>
                <p className="text-yellow-300/60 text-sm">Authentic Islamic prayers</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">$2.99</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          {!showPayment ? (
            <>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-5xl">🤲</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Generate Your Personal Duʿā
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Create authentic Islamic supplications with perfect Arabic and heartfelt translations
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    What do you need duʿā for?
                  </label>
                  <textarea
                    value={formData.situation}
                    onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors h-32 resize-none"
                    placeholder="E.g., Protection for my family, Success in my studies, Healing from illness, Guidance in making a decision..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      Translation Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-2">
                      PDF Color Theme
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                    >
                      {themeNames.map(themeKey => {
                        const theme = getTheme(themeKey)
                        return (
                          <option key={themeKey} value={themeKey}>
                            {theme.name}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                  </div>
                )}

                <div className="bg-slate-800/50 rounded-xl p-6 space-y-3">
                  <h3 className="text-yellow-400 font-semibold mb-3">What You'll Receive:</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Beautiful Arabic duʿā with perfect diacritical marks</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Natural, heartfelt translation in your language</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Authentic content from Qur'an and Sunnah</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Short, powerful, and meaningful (2-5 lines)</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Premium PDF with Islamic borders</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Instant download after generation</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment - $2.99'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                <span className="text-5xl">💳</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Complete Your Purchase
              </h2>
              <p className="text-gray-400 mb-8">
                Get your personalized duʿā instantly
              </p>
              
              <div className="bg-slate-800/50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Product:</span>
                  <span className="text-white font-semibold">Personal Duʿā</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Situation:</span>
                  <span className="text-white text-sm">{formData.situation.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">{formData.language}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">PDF Theme:</span>
                  <span className="text-white">{getTheme(formData.theme).name}</span>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-yellow-400">$2.99</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 max-w-md mx-auto">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate Duʿā Now'}
                </button>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                🔒 Secure payment powered by Stripe
              </p>
            </div>
          )}

          {generatedDua && (
            <div className="mt-8">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <span className="text-4xl">✨</span>
                </div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-2">
                  Your Beautiful Duʿā is Ready!
                </h3>
                <p className="text-gray-400">A powerful supplication crafted just for you</p>
              </div>

              {/* Fancy Dua Display */}
              <div className="relative">
                {/* Decorative Corner Elements */}
                <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-yellow-400/50 rounded-tl-2xl"></div>
                <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-yellow-400/50 rounded-tr-2xl"></div>
                <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b-2 border-l-2 border-yellow-400/50 rounded-bl-2xl"></div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-yellow-400/50 rounded-br-2xl"></div>
                
                <div className="bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-yellow-500/20">
                  {/* Arabic Section */}
                  <div className="text-center mb-8">
                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full mb-4">
                      <span className="text-yellow-400 text-sm font-semibold">✦ ARABIC SUPPLICATION ✦</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-6 border border-yellow-500/10">
                      <p className="text-3xl md:text-4xl leading-loose text-white font-arabic text-center" dir="rtl" style={{
                        textShadow: '0 0 30px rgba(250, 204, 21, 0.3)',
                        letterSpacing: '0.05em'
                      }}>
                        {generatedDua.arabicText}
                      </p>
                    </div>
                  </div>
                  
                  {/* Pronunciation Section */}
                  {generatedDua.transliteration && (
                    <div className="text-center mb-8">
                      <div className="inline-block px-4 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mb-4">
                        <span className="text-emerald-400 text-sm font-semibold">✦ PRONUNCIATION GUIDE ✦</span>
                      </div>
                      <div className="bg-black/30 rounded-xl p-6 border border-emerald-500/10">
                        <p className="text-xl md:text-2xl text-emerald-200 leading-relaxed font-light italic text-center">
                          {generatedDua.transliteration}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Decorative Divider */}
                  <div className="flex items-center justify-center my-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent flex-1"></div>
                    <div className="mx-4">
                      <span className="text-yellow-400 text-2xl">◆</span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent flex-1"></div>
                  </div>

                  {/* Translation Section */}
                  <div className="text-center">
                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mb-4">
                      <span className="text-emerald-400 text-sm font-semibold">✦ {generatedDua.language.toUpperCase()} TRANSLATION ✦</span>
                    </div>
                    <div className="bg-black/30 rounded-xl p-6 border border-emerald-500/10">
                      <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light italic">
                        "{generatedDua.translation}"
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={async () => {
                        const pdfBlob = await workingPdfGenerator.generateWorkingPdf(generatedDua)
                        workingPdfGenerator.downloadPdf(pdfBlob, `Dua_Premium_Islamic_${Date.now()}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-xl hover:shadow-yellow-500/25 flex items-center justify-center gap-2"
                    >
                      <span>📥</span>
                      <span>Download Premium PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedDua(null)
                        setShowPayment(false)
                        setFormData({ situation: '', language: 'English', theme: 'royalGold' })
                      }}
                      className="flex-1 bg-slate-800/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700/50 transition-all duration-300 border border-slate-700 flex items-center justify-center gap-2"
                    >
                      <span>✨</span>
                      <span>Generate Another Dua</span>
                    </button>
                  </div>

                  {/* Bottom Note */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                      🌙 May Allah accept your dua and grant you the best in this world and the hereafter
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DuaGenerator