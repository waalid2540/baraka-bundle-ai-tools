import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import stripeService from '../services/stripeService'
import arabicPdfGenerator from '../services/arabicPdfGenerator'
import { getThemeNames, getTheme } from '../services/pdfTemplates'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    situation: '',
    language: 'English',
    theme: 'royalGold',
    duaCategory: 'general', // 'prophet' or 'general'
    selectedDua: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  const languages = openaiService.getSupportedLanguages()
  const themeNames = getThemeNames()

  // Prophet's Dua Categories for AI to generate
  const prophetDuaCategories = [
    {
      id: 'rizq',
      name: 'Dua for Rizq (Sustenance)',
      description: 'Authentic prophetic dua for lawful sustenance and provision'
    },
    {
      id: 'protection',
      name: 'Dua for Protection',
      description: 'Authentic prophetic dua for protection from evil and harm'
    },
    {
      id: 'guidance',
      name: 'Dua for Guidance',
      description: 'Authentic prophetic dua for guidance and right path'
    },
    {
      id: 'forgiveness',
      name: 'Dua for Forgiveness',
      description: 'Authentic prophetic dua for forgiveness of sins'
    },
    {
      id: 'health',
      name: 'Dua for Health',
      description: 'Authentic prophetic dua for physical and spiritual health'
    },
    {
      id: 'knowledge',
      name: 'Dua for Knowledge',
      description: 'Authentic prophetic dua for increase in beneficial knowledge'
    },
    {
      id: 'travel',
      name: 'Dua for Travel',
      description: 'Authentic prophetic dua for safe and blessed travel'
    },
    {
      id: 'sleep',
      name: 'Dua before Sleep',
      description: 'Authentic prophetic dua to recite before sleeping'
    }
  ]

  const generalDuas = [
    {
      id: 'success_work',
      name: 'Success in Work/Business',
      situation: 'Success in my work and business ventures'
    },
    {
      id: 'family_protection',
      name: 'Family Protection',
      situation: 'Protection and blessings for my family'
    },
    {
      id: 'marriage',
      name: 'Finding a Spouse',
      situation: 'Finding a righteous spouse and blessed marriage'
    },
    {
      id: 'children',
      name: 'Righteous Children',
      situation: 'Righteous and healthy children'
    },
    {
      id: 'debt_relief',
      name: 'Relief from Debt',
      situation: 'Relief from financial difficulties and debt'
    },
    {
      id: 'travel_safety',
      name: 'Safe Travel',
      situation: 'Safety and blessings during travel'
    },
    {
      id: 'exam_success',
      name: 'Success in Exams/Studies',
      situation: 'Success in my studies and examinations'
    },
    {
      id: 'illness_recovery',
      name: 'Recovery from Illness',
      situation: 'Healing and recovery from illness'
    },
    {
      id: 'anxiety_peace',
      name: 'Peace from Anxiety',
      situation: 'Peace of mind and relief from anxiety'
    },
    {
      id: 'custom',
      name: 'Custom Request',
      situation: 'custom' // Will show text input
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.duaCategory === 'general' && formData.selectedDua === 'custom' && !formData.situation.trim()) {
      setError('Please describe your custom situation')
      return
    }
    
    if (formData.duaCategory === 'general' && !formData.selectedDua) {
      setError('Please select a dua category')
      return
    }
    
    if (formData.duaCategory === 'prophet' && !formData.selectedDua) {
      setError('Please select a Prophet\'s dua')
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

      let duaData: any

      if (formData.duaCategory === 'prophet') {
        // Generate authentic Prophet's dua using OpenAI
        const selectedCategory = prophetDuaCategories.find(dua => dua.id === formData.selectedDua)
        if (selectedCategory) {
          const prophetDuaPrompt = `Generate an authentic prophetic dua from Quran and Sunnah for: ${selectedCategory.description}. 
          IMPORTANT: Only provide AUTHENTIC duas that are found in Quran, authentic Hadith, or established Islamic sources. 
          Do not create new duas. Provide the exact Arabic text with proper diacritical marks, accurate transliteration, and ${formData.language} translation.
          
          Format:
          **Arabic:** [Authentic Arabic text with diacritics]
          **Transliteration:** [Accurate pronunciation]
          **Translation:** [Meaning in ${formData.language}]`

          const response = await openaiService.generateDua(
            'User',
            prophetDuaPrompt,
            formData.language
          )

          if (response.success && response.data) {
            const content = response.data.content
            const arabicMatch = content.match(/\*\*Arabic:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
            const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
            const translationMatch = content.match(/\*\*Translation[^:]*:\*\*\s*([\s\S]*?)(?=\n\n|$)/i)
            
            duaData = {
              arabicText: arabicMatch ? arabicMatch[1].trim() : '',
              transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
              translation: translationMatch ? translationMatch[1].trim() : '',
              name: 'User',
              situation: selectedCategory.name,
              language: formData.language,
              theme: formData.theme
            }
          } else {
            setError(response.error || 'Failed to generate Prophet\'s dua')
            return
          }
        }
      } else {
        // Generate dua using OpenAI for general requests
        const situation = formData.selectedDua === 'custom' 
          ? formData.situation 
          : generalDuas.find(dua => dua.id === formData.selectedDua)?.situation || formData.situation

        const response = await openaiService.generateDua(
          'User',
          situation,
          formData.language
        )

        if (response.success && response.data) {
          // Parse the response to extract Arabic, transliteration, and translation
          const content = response.data.content
          const arabicMatch = content.match(/\*\*Arabic:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
          const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i)
          const translationMatch = content.match(/\*\*Translation[^:]*:\*\*\s*([\s\S]*?)(?=\n\n|$)/i)
          
          duaData = {
            arabicText: arabicMatch ? arabicMatch[1].trim() : '',
            transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
            translation: translationMatch ? translationMatch[1].trim() : '',
            name: 'User',
            situation: situation,
            language: formData.language,
            theme: formData.theme
          }
        } else {
          setError(response.error || 'Failed to generate dua')
          return
        }
      }

      // Debug: Log the parsed data
      console.log('Generated Dua Data:', duaData)

      setGeneratedDua(duaData)
      
      // Generate PDF with REAL Arabic text
      const pdfBlob = await arabicPdfGenerator.generatePdf(duaData)
      arabicPdfGenerator.downloadPdf(pdfBlob, `BarakahTool_Arabic_Dua_${Date.now()}`)
      
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
                <h1 className="text-2xl font-bold text-yellow-400">BARAKAH ENTERPRISE • Duʿā Generator</h1>
                <p className="text-yellow-300/60 text-sm">Professional Islamic Digital Solutions</p>
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
                  BARAKAH ENTERPRISE • Premium Duʿā Generation
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Professional Islamic Digital Solutions • Enterprise-grade Arabic text rendering • Guaranteed perfect PDFs
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dua Category Selection */}
                <div>
                  <label className="block text-yellow-400 font-semibold mb-3">
                    Choose Dua Category
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, duaCategory: 'prophet', selectedDua: '' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.duaCategory === 'prophet'
                          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-slate-600 bg-slate-800/30 text-gray-300 hover:border-yellow-500/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">📿</div>
                      <div className="font-semibold">Prophet's Du'a</div>
                      <div className="text-sm opacity-80">Authentic duas from Quran & Sunnah</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, duaCategory: 'general', selectedDua: '' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.duaCategory === 'general'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-600 bg-slate-800/30 text-gray-300 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">🤲</div>
                      <div className="font-semibold">General Du'a</div>
                      <div className="text-sm opacity-80">AI-generated for specific needs</div>
                    </button>
                  </div>
                </div>

                {/* Prophet's Dua Selection */}
                {formData.duaCategory === 'prophet' && (
                  <div>
                    <label className="block text-yellow-400 font-semibold mb-3">
                      Select Prophet's Du'a
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {prophetDuaCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, selectedDua: category.id })}
                          className={`p-4 text-left rounded-xl border-2 transition-all ${
                            formData.selectedDua === category.id
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-slate-700 bg-slate-800/50 hover:border-yellow-500/50'
                          }`}
                        >
                          <div className="font-semibold text-white mb-2">{category.name}</div>
                          <div className="text-sm text-gray-400">{category.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* General Dua Selection */}
                {formData.duaCategory === 'general' && (
                  <div>
                    <label className="block text-emerald-400 font-semibold mb-3">
                      Select Your Need
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {generalDuas.map((dua) => (
                        <button
                          key={dua.id}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            selectedDua: dua.id,
                            situation: dua.id === 'custom' ? formData.situation : dua.situation
                          })}
                          className={`p-3 text-left rounded-xl border-2 transition-all ${
                            formData.selectedDua === dua.id
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-700 bg-slate-800/50 hover:border-emerald-500/50'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{dua.name}</div>
                        </button>
                      ))}
                    </div>

                    {/* Custom input for general dua */}
                    {formData.selectedDua === 'custom' && (
                      <div className="mt-4">
                        <label className="block text-emerald-400 font-semibold mb-2">
                          Describe your specific need
                        </label>
                        <textarea
                          value={formData.situation}
                          onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-colors h-24 resize-none"
                          placeholder="E.g., Protection for my family, Success in my studies, Healing from illness..."
                          required
                        />
                      </div>
                    )}
                  </div>
                )}

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
                      <span>ENTERPRISE PDF with luxury Islamic design</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>GUARANTEED perfect Arabic text rendering</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Professional-grade PDF generation (NO HTML/CSS issues)</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing Enterprise Request...' : 'ENTERPRISE ACCESS - $2.99'}
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
                  <span className="text-white font-semibold">ENTERPRISE Duʿā</span>
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
                  {loading ? 'Generating Enterprise PDF...' : 'Generate ENTERPRISE Duʿā'}
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
                  ENTERPRISE Duʿā Generated Successfully!
                </h3>
                <p className="text-gray-400">Professional Islamic supplication with guaranteed perfect Arabic text</p>
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
                        const pdfBlob = await arabicPdfGenerator.generatePdf(generatedDua)
                        arabicPdfGenerator.downloadPdf(pdfBlob, `BarakahTool_Arabic_Dua_${Date.now()}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-xl hover:shadow-yellow-500/25 flex items-center justify-center gap-2"
                    >
                      <span>🕌</span>
                      <span>Download Arabic PDF</span>
                    </button>
                    <button
                      onClick={async () => {
                        const pdfBlob = await arabicPdfGenerator.generateRandomPdf(generatedDua)
                        arabicPdfGenerator.downloadPdf(pdfBlob, `BarakahTool_Creator_${Date.now()}`)
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                    >
                      <span>🎨</span>
                      <span>Creator Random Theme</span>
                    </button>
                    <button
                      onClick={() => {
                        setGeneratedDua(null)
                        setShowPayment(false)
                        setFormData({ 
                          situation: '', 
                          language: 'English', 
                          theme: 'royalGold',
                          duaCategory: 'general',
                          selectedDua: ''
                        })
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