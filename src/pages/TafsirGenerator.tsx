import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'

interface TafsirResult {
  input: string
  verseReference: string
  arabicText: string
  translation: string
  tafsirSummary: string
  keyLessons: string[]
  historicalContext: string
  practicalApplication: string
  sources: string[]
  relatedVerses: string[]
}

const TafsirGenerator = () => {
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('english')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TafsirResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'العربية' },
    { value: 'somali', label: 'Soomaali' },
    { value: 'urdu', label: 'اردو' }
  ]

  const quickSearches = [
    { label: 'Bismillah (1:1)', value: 'Bismillah - In the name of Allah' },
    { label: 'Patience (2:153)', value: 'patience in Islam, verse 2:153' },
    { label: 'Gratitude (14:7)', value: 'gratitude and thankfulness, verse 14:7' },
    { label: 'Trust in Allah (2:286)', value: 'trust in Allah, verse 2:286' },
    { label: 'Forgiveness (39:53)', value: 'forgiveness and mercy, verse 39:53' },
    { label: 'Guidance (1:6)', value: 'guidance and straight path, verse 1:6' }
  ]

  const generateTafsir = async () => {
    if (!input.trim()) {
      setError('Please enter a verse reference or topic')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await openaiService.generateTafsir(input.trim(), language)
      
      if (response.success && response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content.trim()
        
        // Try to parse JSON response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const tafsirData = JSON.parse(jsonMatch[0])
            setResult(tafsirData)
          } else {
            throw new Error('Invalid response format')
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          setError('Failed to parse AI response. Please try again.')
        }
      } else {
        setError(response.error || 'Failed to generate tafsir. Please try again.')
      }
    } catch (error) {
      console.error('Tafsir generation error:', error)
      setError('An error occurred while generating tafsir. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generateTafsir()
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
              📚 Tafsir Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Authentic Qur'anic Tafsir
          </h2>
          <p className="text-lg text-gray-600">
            Understand the Qur'an using authentic classical sources
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Search for Tafsir
            </h3>
            
            <div className="space-y-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verse Reference or Topic
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Examples:&#10;• 2:255 (Ayat al-Kursi)&#10;• patience in Islam&#10;• mercy of Allah&#10;• guidance and wisdom"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can search by verse reference (e.g., 2:255) or topic (e.g., patience)
                </p>
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

              {/* Generate Button */}
              <button
                onClick={generateTafsir}
                disabled={isLoading || !input.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Tafsir...
                  </span>
                ) : (
                  '📖 Generate Tafsir'
                )}
              </button>

              {/* Quick Searches */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Searches:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(search.value)}
                      className="text-xs bg-islamic-green-100 text-islamic-green-700 px-3 py-2 rounded-lg hover:bg-islamic-green-200 transition-colors"
                    >
                      {search.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Tafsir Results
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result ? (
              <div className="space-y-6">
                {/* Verse Reference */}
                {result.verseReference && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-islamic-green-800 mb-2">
                      {result.verseReference}
                    </h4>
                  </div>
                )}

                {/* Arabic Text */}
                {result.arabicText && (
                  <div className="bg-islamic-green-50 rounded-lg p-4">
                    <p className="arabic-text text-xl leading-relaxed text-islamic-green-900 text-center">
                      {result.arabicText}
                    </p>
                  </div>
                )}

                {/* Translation */}
                {result.translation && (
                  <div className="bg-islamic-gold-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Translation:</p>
                    <p className="text-gray-900 font-medium">
                      {result.translation}
                    </p>
                  </div>
                )}

                {/* Tafsir Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tafsir Explanation:</p>
                  <p className="text-gray-900 leading-relaxed">
                    {result.tafsirSummary}
                  </p>
                </div>

                {/* Key Lessons */}
                {result.keyLessons && result.keyLessons.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Lessons:</p>
                    <ul className="text-sm text-gray-900 space-y-1">
                      {result.keyLessons.map((lesson, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">•</span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Historical Context */}
                {result.historicalContext && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Historical Context:</p>
                    <p className="text-sm text-gray-900">
                      {result.historicalContext}
                    </p>
                  </div>
                )}

                {/* Practical Application */}
                {result.practicalApplication && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Practical Application:</p>
                    <p className="text-sm text-gray-900">
                      {result.practicalApplication}
                    </p>
                  </div>
                )}

                {/* Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Classical Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.sources.map((source, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Verses */}
                {result.relatedVerses && result.relatedVerses.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Related Verses:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.relatedVerses.map((verse, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(verse)}
                          className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs hover:bg-indigo-200 transition-colors"
                        >
                          {verse}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📖</div>
                <p className="text-gray-500">
                  Enter a verse reference or topic to generate authentic tafsir
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TafsirGenerator