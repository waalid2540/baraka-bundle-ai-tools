import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import backendApiService from '../services/backendApiService'
import professionalIslamicPdf from '../services/professionalIslamicPdf'
import PaymentGateway from '../components/PaymentGateway'

const DuaGenerator = () => {
  const navigate = useNavigate()
  const { user, hasAccess, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    topic: '',
    customRequest: '',
    language: 'English',
    pdfTheme: 'gold'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedDua, setGeneratedDua] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  const userHasAccess = hasAccess('dua_generator')
  const languages = backendApiService.getSupportedLanguages()

  // If not logged in, redirect to login
  const handlePaymentClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/dua-generator' } } })
    } else {
      setShowPayment(true)
    }
  }

  const generateDua = async () => {
    if (!userHasAccess) {
      handlePaymentClick()
      return
    }

    if (!formData.topic && !formData.customRequest) {
      setError('Please select a topic or enter a custom request')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await backendApiService.generateDua(
        formData.topic || formData.customRequest,
        formData.language
      )

      if (response.success) {
        setGeneratedDua(response.data)
      } else {
        setError(response.error || 'Failed to generate dua')
      }
    } catch (error) {
      console.error('Dua generation error:', error)
      setError('An error occurred while generating the dua')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!generatedDua) return

    try {
      await professionalIslamicPdf.generateDuaPDF(generatedDua, formData.pdfTheme)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Failed to generate PDF')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-emerald-600 hover:text-emerald-800 flex items-center"
            >
              ← Back to Home
            </button>
            <h1 className="text-2xl font-bold text-emerald-800 flex items-center">
              🤲 Dua Generator
            </h1>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Islamic Dua Generator
          </h2>
          <p className="text-lg text-gray-600">
            Generate beautiful, authentic Islamic supplications in multiple languages
          </p>
        </div>

        {!userHasAccess ? (
          /* Access Required */
          <div className="max-w-md mx-auto text-center py-12">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Unlock Dua Generator
              </h3>
              <p className="text-gray-600 mb-8">
                Get unlimited access to generate personalized Islamic duas with authentic Arabic and translations
              </p>
              <div className="space-y-3">
                <button
                  onClick={handlePaymentClick}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🚀 {!user ? 'Login to Access' : 'Get Unlimited Access - $2.99'}
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={handlePaymentClick}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      <span>Already Purchased? Access Now</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Main Generator Interface */
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Generate Your Dua</h3>

                <div className="space-y-6">
                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select a Topic
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Choose a topic...</option>
                      <option value="guidance">Guidance & Wisdom</option>
                      <option value="protection">Protection & Safety</option>
                      <option value="health">Health & Healing</option>
                      <option value="success">Success & Prosperity</option>
                      <option value="forgiveness">Forgiveness & Mercy</option>
                      <option value="gratitude">Gratitude & Thanks</option>
                      <option value="patience">Patience & Strength</option>
                      <option value="family">Family & Relationships</option>
                    </select>
                  </div>

                  {/* Custom Request */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or Enter Custom Request
                    </label>
                    <textarea
                      value={formData.customRequest}
                      onChange={(e) => setFormData({ ...formData, customRequest: e.target.value })}
                      placeholder="Describe what you'd like to make dua for..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Translation Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Generate Button */}
                  <button
                    onClick={generateDua}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Dua...
                      </div>
                    ) : (
                      '🤲 Generate Dua'
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Dua Display */}
              <div>
                {generatedDua ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">Your Generated Dua</h3>
                      <button
                        onClick={downloadPDF}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
                      >
                        📄 Download PDF
                      </button>
                    </div>

                    {/* Arabic Text */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-emerald-800 mb-3">Arabic</h4>
                      <p className="text-2xl text-right leading-loose font-arabic" dir="rtl">
                        {generatedDua.arabic || 'Arabic text will appear here'}
                      </p>
                    </div>

                    {/* Translation */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Translation</h4>
                      <p className="text-lg leading-relaxed">
                        {generatedDua.translation || 'Translation will appear here'}
                      </p>
                    </div>

                    {/* Reference */}
                    {generatedDua.reference && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">Reference</h4>
                        <p className="text-sm text-blue-700">{generatedDua.reference}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <div className="text-6xl mb-4">🤲</div>
                      <p>Your generated dua will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Gateway Modal */}
      {showPayment && (
        <PaymentGateway
          productType="dua_generator"
          isOpen={true}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={() => {
            setShowPayment(false)
            window.location.reload() // Refresh to get updated access
          }}
        />
      )}
    </div>
  )
}

export default DuaGenerator