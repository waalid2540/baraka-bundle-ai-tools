import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import openaiService from '../services/openaiService'
import stripeService from '../services/stripeService'
import pdfService from '../services/pdfService'

const NamePosterGenerator = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    language: 'English'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedPoster, setGeneratedPoster] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  const languages = openaiService.getSupportedLanguages()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Please enter a name')
      return
    }

    setShowPayment(true)
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      // Process payment
      await stripeService.processPayment('name_poster', {
        name: formData.name,
        language: formData.language
      })
    } catch (err) {
      setError('Payment processing failed. Please try again.')
      setLoading(false)
    }
  }

  const generatePoster = async () => {
    try {
      setLoading(true)
      setError('')

      // Generate name poster content
      const response = await openaiService.generateNamePoster(
        formData.name,
        formData.language
      )

      if (response.success && response.data) {
        setGeneratedPoster(response.data)
        
        // Parse the content and generate PDF
        const content = response.data.content
        const posterData = parseNamePosterContent(content)
        
        const pdfBlob = await pdfService.generateNamePosterPDF({
          name: formData.name,
          arabicName: posterData.arabicName || formData.name,
          meaning: posterData.meaning || '',
          etymology: posterData.etymology || '',
          islamicSignificance: posterData.significance || '',
          quranicReferences: posterData.references || '',
          famousBearers: posterData.famousBearers || [],
          characterTraits: posterData.traits || [],
          personalizedDua: posterData.dua || '',
          language: formData.language
        })

        // Download the PDF
        pdfService.downloadPDF(pdfBlob, `${formData.name}_Islamic_Poster`)
      } else {
        setError(response.error || 'Failed to generate name poster')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const parseNamePosterContent = (content: string) => {
    // Parse the AI response to extract structured data
    const sections: any = {}
    
    // This is a simplified parser - in production, you'd parse more carefully
    const arabicMatch = content.match(/NAME IN ARABIC[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const meaningMatch = content.match(/MEANING[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const etymologyMatch = content.match(/ETYMOLOGY[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const significanceMatch = content.match(/SIGNIFICANCE[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const referencesMatch = content.match(/REFERENCES[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const traitsMatch = content.match(/TRAITS[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    const duaMatch = content.match(/DUA[:\s]+([\s\S]*?)(?=\n[A-Z]|$)/i)
    
    sections.arabicName = arabicMatch ? arabicMatch[1].trim() : ''
    sections.meaning = meaningMatch ? meaningMatch[1].trim() : ''
    sections.etymology = etymologyMatch ? etymologyMatch[1].trim() : ''
    sections.significance = significanceMatch ? significanceMatch[1].trim() : ''
    sections.references = referencesMatch ? referencesMatch[1].trim() : ''
    sections.traits = traitsMatch ? traitsMatch[1].split('\n').filter(t => t.trim()) : []
    sections.dua = duaMatch ? duaMatch[1].trim() : ''
    sections.famousBearers = []
    
    return sections
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gold-400">Name Poster Generator</h1>
                <p className="text-gold-300/60 text-sm">Beautiful Islamic name posters</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gold-400">$3.99</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8">
          {!showPayment ? (
            <>
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-5xl">🎨</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Create Your Premium Name Poster
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Generate a beautiful Islamic name poster with Arabic calligraphy, 
                  deep meanings, and Quranic references
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gold-400 font-semibold mb-2">
                    Name to Generate Poster For
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-gold-500 focus:outline-none transition-colors"
                    placeholder="Enter name (e.g., Fatima, Muhammad, Aisha)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gold-400 font-semibold mb-2">
                    Language for Explanations
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-gold-500 focus:outline-none transition-colors"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                    {error}
                  </div>
                )}

                <div className="bg-slate-800/50 rounded-xl p-6 space-y-3">
                  <h3 className="text-gold-400 font-semibold mb-3">What You'll Get:</h3>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Beautiful Arabic calligraphy of the name</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Detailed meaning and etymology</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Islamic significance and history</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Quranic and Hadith references</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Famous Islamic personalities with this name</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Personalized dua for the name bearer</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-gold-400">✓</span>
                      <span>Premium PDF with Islamic border designs</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment - $3.99'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                <span className="text-5xl">💳</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Complete Your Purchase
              </h2>
              <p className="text-gray-400 mb-8">
                You'll be redirected to secure Stripe checkout
              </p>
              
              <div className="bg-slate-800/50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Product:</span>
                  <span className="text-white font-semibold">Name Poster for "{formData.name}"</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white">{formData.language}</span>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gold-400 font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-gold-400">$3.99</span>
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Pay with Stripe'}
                </button>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                🔒 Secure payment powered by Stripe
              </p>
            </div>
          )}

          {generatedPoster && (
            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h3 className="text-green-400 font-semibold mb-2">✅ Name Poster Generated Successfully!</h3>
              <p className="text-gray-300">Your premium Islamic name poster has been downloaded.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default NamePosterGenerator