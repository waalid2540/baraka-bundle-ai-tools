import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'

interface DuaResult {
  title: string
  arabicText: string
  transliteration: string
  translation: string
  occasion: string
  benefits: string[]
  source: string
  category: string
}

const DuaGenerator = () => {
  const [category, setCategory] = useState('general')
  const [language, setLanguage] = useState('english')
  const [situation, setSituation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DuaResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'general', label: 'General Du\'a' },
    { value: 'sadness', label: 'Sadness & Grief' },
    { value: 'success', label: 'Success & Achievement' },
    { value: 'parenting', label: 'Parenting & Children' },
    { value: 'travel', label: 'Travel & Journey' },
    { value: 'health', label: 'Health & Healing' },
    { value: 'forgiveness', label: 'Forgiveness & Repentance' },
    { value: 'guidance', label: 'Guidance & Wisdom' },
    { value: 'gratitude', label: 'Gratitude & Thanks' },
    { value: 'protection', label: 'Protection & Safety' }
  ]

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'العربية' },
    { value: 'somali', label: 'Soomaali' },
    { value: 'urdu', label: 'اردو' }
  ]

  const generateDua = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await openaiService.generateDua(category, language, situation || undefined)
      
      if (response.success && response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content.trim()
        
        // Simplified robust JSON parsing
        try {
          console.log('Raw AI response:', content)
          
          // Clean the content first
          let cleanContent = content.trim()
          
          // Remove any text before first {
          const startIndex = cleanContent.indexOf('{')
          if (startIndex > 0) {
            cleanContent = cleanContent.substring(startIndex)
          }
          
          // Remove any text after last }
          const endIndex = cleanContent.lastIndexOf('}')
          if (endIndex !== -1) {
            cleanContent = cleanContent.substring(0, endIndex + 1)
          }
          
          // Fix common JSON issues
          cleanContent = cleanContent
            .replace(/[\u201C\u201D]/g, '"') // Smart quotes
            .replace(/[\u2018\u2019]/g, "'") // Smart apostrophes  
            .replace(/,(\s*[}\]])/g, '$1') // Trailing commas
            .replace(/\n/g, ' ') // Remove newlines
            .replace(/\s+/g, ' ') // Multiple spaces
          
          console.log('Cleaned content:', cleanContent)
          
          const duaData = JSON.parse(cleanContent)
          
          // Validate required fields
          if (duaData && (duaData.title || duaData.arabicText)) {
            setResult(duaData)
          } else {
            throw new Error('Missing required fields')
          }
          
        } catch (parseError) {
          console.error('JSON parsing failed:', parseError)
          
          // Last resort: Create minimal working result
          const basicResult = {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Du'a`,
            arabicText: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
            transliteration: 'Rabbana atina fi\'d-dunya hasanatan wa fi\'l-akhirati hasanatan wa qina adhab an-nar',
            translation: 'Our Lord, give us good in this world and good in the hereafter, and save us from the punishment of the Fire.',
            occasion: 'General supplication',
            source: 'Quran 2:201',
            category: category,
            benefits: 'Comprehensive du\'a for this world and hereafter',
            times: 'Any time',
            isAuthentic: true
          }
          setResult(basicResult)
        }
      } else {
        setError(response.error || 'Failed to generate du\'a. Please try again.')
      }
    } catch (error) {
      console.error('Du\'a generation error:', error)
      setError('An error occurred while generating du\'a. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-islamic-green-600 hover:text-islamic-green-800">
              ← Back to Baraka Bundle
            </Link>
            <h1 className="text-2xl font-bold text-islamic-green-800">
              🧠 AI Du'ā Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Authentic Du'ā
          </h2>
          <p className="text-lg text-gray-600">
            Create heartfelt du'ā based on authentic Qur'anic and Prophetic sources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Customize Your Du'ā
            </h3>
            
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific Situation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Situation (Optional)
                </label>
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Describe your specific situation or need..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateDua}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Du'ā...
                  </span>
                ) : (
                  '🤲 Generate Du\'ā'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Generated Du'ā
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-islamic-green-800 mb-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {result.occasion}
                  </p>
                </div>

                {/* Arabic Text */}
                <div className="bg-islamic-green-50 rounded-lg p-4">
                  <p className="arabic-text text-xl leading-relaxed text-islamic-green-900">
                    {result.arabicText}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Transliteration:</p>
                  <p className="text-gray-900 italic">
                    {result.transliteration}
                  </p>
                </div>

                {/* Translation */}
                <div className="bg-islamic-gold-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Translation:</p>
                  <p className="text-gray-900">
                    {result.translation}
                  </p>
                </div>

                {/* Benefits */}
                {result.benefits && result.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Benefits:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {result.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-islamic-green-600 mr-2">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Source */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Source:</p>
                  <p className="text-sm text-blue-800">
                    {result.source}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🤲</div>
                <p className="text-gray-500">
                  Choose a category and click generate to create your du'ā
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DuaGenerator