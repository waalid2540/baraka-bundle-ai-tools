import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import dalleService from '../services/dalleService'
import professionalIslamicPdf from '../services/professionalIslamicPdf'
import { stripeService } from '../services/stripeService'
import { databaseService } from '../services/databaseService'
import PaymentGateway from '../components/PaymentGateway'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    topic: '',
    customRequest: '',
    language: 'English',
    pdfTheme: 'gold'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const languages = openaiService.getSupportedLanguages()

  // Check user access on component mount
  useEffect(() => {
    checkUserAccess()
  }, [])

  const checkUserAccess = async () => {
    try {
      setCheckingAccess(true)
      
      // Check if user email is stored in localStorage
      const storedEmail = localStorage.getItem('user_email')
      
      if (!storedEmail) {
        // No stored email, user needs to enter email or pay
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      // Check access by email using the API
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'
        
      const response = await fetch(`${apiUrl}/access/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: storedEmail, 
          product_type: 'dua_generator' 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setHasAccess(data.has_access)
        if (data.has_access) {
          console.log('✅ User has access:', storedEmail)
        } else {
          console.log('❌ User needs to purchase access:', storedEmail)
        }
      } else {
        console.error('Access check failed:', response.status)
        setHasAccess(false)
      }
      
    } catch (error) {
      console.error('Failed to check user access:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
    }
  }

  const duaTopics = [
    { id: 'forgiveness', name: 'Seeking Forgiveness', icon: '🤲' },
    { id: 'guidance', name: 'Seeking Guidance', icon: '🌟' },
    { id: 'protection', name: 'Protection & Safety', icon: '🛡️' },
    { id: 'health', name: 'Health & Healing', icon: '💚' },
    { id: 'sustenance', name: 'Rizq & Sustenance', icon: '💰' },
    { id: 'knowledge', name: 'Knowledge & Wisdom', icon: '📚' },
    { id: 'travel', name: 'Travel & Journey', icon: '✈️' },
    { id: 'family', name: 'Family & Children', icon: '👨‍👩‍👧‍👦' },
    { id: 'marriage', name: 'Marriage & Relationships', icon: '💕' },
    { id: 'success', name: 'Success & Achievement', icon: '🏆' },
    { id: 'patience', name: 'Patience & Strength', icon: '💪' },
    { id: 'gratitude', name: 'Gratitude & Thanks', icon: '🙏' }
  ]


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user has access before generating
    if (!hasAccess) {
      setShowPayment(true)
      return
    }
    
    if (!formData.topic && !formData.customRequest.trim()) {
      setError('Please select a topic or describe your specific need')
      return
    }

    await generateDua()
  }

  const handlePaymentSuccess = (userEmail?: string) => {
    setShowPayment(false)
    setHasAccess(true)
    
    // Store email if provided for future access checks
    if (userEmail) {
      localStorage.setItem('user_email', userEmail)
    }
    
    // Don't call checkUserAccess() - we already know they have access
  }

  const handleEmailAccess = async (email: string) => {
    try {
      setLoading(true)
      setError('')

      // Check access by email directly
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'
        
      const response = await fetch(`${apiUrl}/access/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email, 
          product_type: 'dua_generator' 
        })
      })

      if (!response.ok) {
        setError('Failed to check access. Please try again.')
        return
      }

      const { has_access } = await response.json()
      
      if (has_access) {
        setHasAccess(true)
        setError('')
        // Store email for future access checks
        localStorage.setItem('user_email', email)
        alert('✅ Access verified! You can now generate unlimited Du\'as.')
      } else {
        setError('❌ No purchase found for this email. Please check your email or purchase access.')
      }
    } catch (error) {
      console.error('Email access check error:', error)
      setError('Failed to verify access. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateDua = async () => {
    try {
      setLoading(true)
      
      // Log dua generation
      if (currentUser) {
        await databaseService.logUsage(
          currentUser.id,
          'dua_generator',
          'generate_dua',
          {
            topic: formData.topic,
            language: formData.language,
            custom_request: formData.customRequest
          }
        )
      }
      setError('')

      const request = formData.topic 
        ? duaTopics.find(topic => topic.id === formData.topic)?.name || formData.topic
        : formData.customRequest

      const response = await openaiService.generateDua('User', request, [formData.language])

      if (response.success && response.data) {
        const content = response.data.content
        
        // Parse the response
        const arabicMatch = content.match(/\*\*Arabic:\*\*\s*(.+?)(?=\*\*|$)/s)
        const transliterationMatch = content.match(/\*\*Transliteration:\*\*\s*(.+?)(?=\*\*|$)/s)
        const translationMatch = content.match(new RegExp(`\\*\\*Translation in ${formData.language}:\\*\\*\\s*(.+?)(?=\\*\\*|$)`, 's'))
        
        // Generate AI reflections for this specific dua
        const reflectionsResponse = await openaiService.generateReflections(request, arabicMatch ? arabicMatch[1].trim() : '', formData.language)
        
        const duaData = {
          arabicText: arabicMatch ? arabicMatch[1].trim() : '',
          transliteration: transliterationMatch ? transliterationMatch[1].trim() : '',
          translation: translationMatch ? translationMatch[1].trim() : '',
          situation: request,
          language: formData.language,
          topic: formData.topic,
          reflections: reflectionsResponse,
          generatedAt: new Date().toISOString()
        }

        setGeneratedDua(duaData)
      } else {
        setError(response.error || 'Failed to generate dua. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (!generatedDua) return

    try {
      setLoading(true)
      // Use working professional PDF with Arabic text support and color theme
      const pdfBlob = await professionalIslamicPdf.generateProfessionalPdf({
        arabicText: generatedDua.arabicText,
        transliteration: generatedDua.transliteration,
        translation: generatedDua.translation,
        situation: generatedDua.situation || formData.customRequest,
        language: generatedDua.language,
        reflections: generatedDua.reflections
      }, formData.pdfTheme as 'gold' | 'blue' | 'green' | 'purple')
      professionalIslamicPdf.downloadPdf(pdfBlob, `Islamic_Dua_${formData.pdfTheme}_${Date.now()}.pdf`)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedDua) return

    try {
      setLoading(true)
      
      // Generate Islamic-themed image with DALL-E
      const imageUrl = await dalleService.generateDuaImage(generatedDua, 'gold')
      
      // Download the image using dalleService's download method
      await dalleService.downloadImage(imageUrl, `Islamic_Dua_Art_${Date.now()}.png`)
      
      alert('🎨 Beautiful Islamic art generated and downloaded!')
    } catch (error) {
      console.error('Image generation error:', error)
      alert('Failed to generate image. Please check your OpenAI API key configuration.')
    } finally {
      setLoading(false)
    }
  }

  const resetGenerator = () => {
    setGeneratedDua(null)
    setFormData({ topic: '', customRequest: '', language: 'English', pdfTheme: 'gold' })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header - EXACT SAME AS NAME POSTER */}
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
                <h1 className="text-2xl font-bold text-yellow-400">Du'a Generator</h1>
                <p className="text-yellow-300/60 text-sm">Authentic Islamic supplications</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">🤲</div>
          </div>
        </div>
      </header>

      {/* Main Content - EXACT SAME STYLING */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          {!generatedDua ? (
            <>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-5xl">🤲</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Generate Your Islamic Du'a
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Create personalized Islamic supplications with authentic Arabic text, 
                  transliteration, and translations
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic Selection - Grid Style */}
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Select a Du'a Topic
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {duaTopics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, topic: topic.id, customRequest: '' })
                        }}
                        className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                          formData.topic === topic.id
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                            : 'bg-slate-800/50 border-slate-700 text-gray-300 hover:border-yellow-500/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{topic.icon}</div>
                        <div className="text-sm font-medium">{topic.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Request - SAME STYLING */}
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Or Describe Your Specific Need
                  </label>
                  <textarea
                    value={formData.customRequest}
                    onChange={(e) => {
                      setFormData({ ...formData, customRequest: e.target.value, topic: '' })
                    }}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none transition-colors"
                    placeholder="Describe what you need du'a for... (e.g., guidance in making an important decision)"
                    rows={3}
                  />
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Language for Translation
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

                {/* Color Theme Selection */}
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Select PDF Color Theme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: 'gold', name: 'Gold Classic', color: 'from-yellow-600 to-yellow-400' },
                      { id: 'blue', name: 'Ocean Blue', color: 'from-blue-600 to-blue-400' },
                      { id: 'green', name: 'Nature Green', color: 'from-green-600 to-green-400' },
                      { id: 'purple', name: 'Royal Purple', color: 'from-purple-600 to-purple-400' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, pdfTheme: theme.id })}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          formData.pdfTheme === theme.id
                            ? 'bg-yellow-500/20 border-yellow-500'
                            : 'bg-slate-800/50 border-slate-700 hover:border-yellow-500/50'
                        }`}
                      >
                        <div className={`w-full h-16 bg-gradient-to-r ${theme.color} rounded-lg mb-2`}></div>
                        <div className="text-sm font-medium text-gray-300">{theme.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                  </div>
                )}

                {/* What You'll Get - SAME STYLE */}
                <div className="bg-slate-800/50 rounded-xl p-6 space-y-3">
                  <h3 className="text-yellow-400 font-semibold mb-3">What You'll Get:</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Authentic Arabic du'a with full tashkeel</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Clear transliteration for pronunciation</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Translation in your selected language</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Clean, professional PDF format</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Simple, readable layout</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-400">✓</span>
                      <span>Instant download</span>
                    </div>
                  </div>
                </div>

                {/* Access Control for Submit Button */}
                {checkingAccess ? (
                  /* Loading state while checking access */
                  <button
                    disabled
                    className="w-full bg-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Checking access...</span>
                    </div>
                  </button>
                ) : hasAccess ? (
                  /* User has access - show regular submit button */
                  <button
                    type="submit"
                    disabled={loading || (!formData.topic && !formData.customRequest.trim())}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating Your Du'a...</span>
                      </div>
                    ) : (
                      'Generate My Du\'a'
                    )}
                  </button>
                ) : (
                  /* User needs to purchase - show payment button */
                  <div className="space-y-4">
                    {/* Pricing Info */}
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                      <h4 className="text-green-400 font-semibold mb-2">🤲 Du'a Generator - Premium</h4>
                      <p className="text-2xl font-bold text-green-400 mb-2">$2.99</p>
                      <p className="text-green-300 text-sm">One-time payment • Lifetime access • Unlimited generations</p>
                    </div>
                    
                    {/* Purchase Button */}
                    <button
                      type="button"
                      onClick={() => setShowPayment(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/25"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>💳</span>
                        <span>Get Lifetime Access - $2.99</span>
                      </div>
                    </button>
                    
                    {/* Already Purchased Button */}
                    <button
                      type="button"
                      onClick={() => setShowPayment(true)}
                      className="w-full bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-colors border border-slate-600"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        <span>Already Purchased? Access Now</span>
                      </div>
                    </button>

                    {/* Features List */}
                    <div className="text-center text-sm text-gray-400">
                      <p>✨ Unlock unlimited du'a generation with Arabic text, transliteration, and translations</p>
                    </div>
                  </div>
                )}
              </form>
            </>
          ) : (
            /* Results Display - SAME DARK THEME */
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-5xl">✨</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Your Du'a Has Been Generated!
                </h2>
                <p className="text-gray-400">
                  May Allah accept your supplication
                </p>
              </div>

              {/* Arabic Text */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-yellow-400 font-semibold mb-4">Arabic Text</h3>
                <p className="text-2xl text-white text-center leading-relaxed font-arabic" dir="rtl">
                  {generatedDua.arabicText}
                </p>
              </div>

              {/* Transliteration */}
              {generatedDua.transliteration && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-yellow-400 font-semibold mb-4">Transliteration</h3>
                  <p className="text-lg text-gray-300 text-center italic">
                    {generatedDua.transliteration}
                  </p>
                </div>
              )}

              {/* Translation */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-yellow-400 font-semibold mb-4">
                  Translation ({generatedDua.language})
                </h3>
                <p className="text-lg text-gray-300 text-center">
                  "{generatedDua.translation}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={resetGenerator}
                  className="bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                >
                  Generate Another
                </button>
                <button
                  onClick={downloadPdf}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
{loading ? 'Generating...' : '📄 Download PDF'}
                </button>
                <button
                  onClick={downloadImage}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : '🎨 Generate Art'}
                </button>
              </div>

              {/* Success Message */}
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-center mb-2">
                  ✅ Du'a generated successfully!
                </p>
                <p className="text-green-400/80 text-center text-sm">
                  Download as PDF with Arabic text or generate beautiful Islamic art
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Gateway Modal */}
      <PaymentGateway
        productType="dua_generator"
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

export default DuaGenerator