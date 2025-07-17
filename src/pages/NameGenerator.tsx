import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'

interface NameResult {
  name: string
  arabicScript: string
  meaning: string
  origin: string
  islamicHistory: string
  pronunciation: string
  gender: string
  theme: string
}

interface GeneratedNames {
  names: NameResult[]
}

const NameGenerator = () => {
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [language, setLanguage] = useState('arabic')
  const [theme, setTheme] = useState('leadership')
  const [count, setCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<GeneratedNames | null>(null)
  const [error, setError] = useState<string | null>(null)

  const languages = [
    { value: 'arabic', label: 'Arabic (العربية)' },
    { value: 'somali', label: 'Somali (Soomaali)' },
    { value: 'urdu', label: 'Urdu (اردو)' },
    { value: 'english', label: 'English' }
  ]

  const themes = [
    { value: 'leadership', label: 'Leadership & Strength' },
    { value: 'light', label: 'Light & Guidance' },
    { value: 'wisdom', label: 'Wisdom & Knowledge' },
    { value: 'beauty', label: 'Beauty & Grace' },
    { value: 'patience', label: 'Patience & Perseverance' },
    { value: 'kindness', label: 'Kindness & Compassion' },
    { value: 'courage', label: 'Courage & Bravery' },
    { value: 'peace', label: 'Peace & Serenity' },
    { value: 'devotion', label: 'Devotion & Piety' },
    { value: 'noble', label: 'Noble & Honorable' }
  ]

  const counts = [
    { value: 3, label: '3 Names' },
    { value: 5, label: '5 Names' },
    { value: 7, label: '7 Names' },
    { value: 10, label: '10 Names' }
  ]

  const generateNames = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await openaiService.generateNames(gender, language, theme, count)
      
      if (response.success && response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content.trim()
        
        // Try to parse JSON response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const nameData = JSON.parse(jsonMatch[0])
            setResult(nameData)
          } else {
            throw new Error('Invalid response format')
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          setError('Failed to parse AI response. Please try again.')
        }
      } else {
        setError(response.error || 'Failed to generate names. Please try again.')
      }
    } catch (error) {
      console.error('Name generation error:', error)
      setError('An error occurred while generating names. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadNames = () => {
    if (!result) return
    
    const nameList = result.names.map(name => 
      `${name.name} (${name.arabicScript})\nMeaning: ${name.meaning}\nOrigin: ${name.origin}\nIslamic History: ${name.islamicHistory}\nPronunciation: ${name.pronunciation}\n\n`
    ).join('')
    
    const blob = new Blob([nameList], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `islamic-${gender}-names-${theme}.txt`
    a.click()
    URL.revokeObjectURL(url)
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
              🧾 Islamic Name Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Beautiful Islamic Names
          </h2>
          <p className="text-lg text-gray-600">
            Generate meaningful names with Islamic history and significance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Customize Your Names
            </h3>
            
            <div className="space-y-6">
              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      gender === 'male' 
                        ? 'border-islamic-green-500 bg-islamic-green-50 text-islamic-green-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    👨 Male
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                      gender === 'female' 
                        ? 'border-islamic-green-500 bg-islamic-green-50 text-islamic-green-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    👩 Female
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language Origin
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

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme/Meaning
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                >
                  {themes.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Count Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Names
                </label>
                <select
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                >
                  {counts.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateNames}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Names...
                  </span>
                ) : (
                  '✨ Generate Names'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Generated Names
              </h3>
              {result && (
                <button
                  onClick={downloadNames}
                  className="btn-secondary text-sm"
                >
                  📥 Download List
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {result.names.map((name, index) => (
                  <div key={index} className="bg-gradient-to-r from-islamic-green-50 to-islamic-gold-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-islamic-green-800">
                        {name.name}
                      </h4>
                      <span className="arabic-text text-xl text-islamic-green-700">
                        {name.arabicScript}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Meaning:</span>
                        <span className="text-gray-900 ml-2">{name.meaning}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Origin:</span>
                        <span className="text-gray-900 ml-2">{name.origin}</span>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Pronunciation:</span>
                        <span className="text-gray-900 ml-2 italic">{name.pronunciation}</span>
                      </div>
                      
                      <div className="bg-white rounded p-2 mt-2">
                        <span className="font-medium text-blue-700">Islamic History:</span>
                        <p className="text-gray-700 text-xs mt-1">{name.islamicHistory}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-gray-500">
                  Select your preferences and generate meaningful Islamic names
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Why Choose Islamic Names?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🌟</div>
              <h4 className="font-semibold text-gray-900">Meaningful</h4>
              <p className="text-sm text-gray-600">Every name carries beautiful meaning and positive attributes</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-semibold text-gray-900">Historical</h4>
              <p className="text-sm text-gray-600">Connected to Islamic history, prophets, and righteous companions</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤲</div>
              <h4 className="font-semibold text-gray-900">Blessed</h4>
              <p className="text-sm text-gray-600">Names that invoke Allah's blessings and guidance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default NameGenerator