import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'
import { dalleService } from '../services/dalleService'

interface StoryResult {
  title: string
  story: string
  moralLesson: string
  quranReference: string
  arabicVerse: string
  verseTranslation: string
  parentNotes: string
  ageGroup: string
  theme: string
  illustration?: string
}

const KidsStoryGenerator = () => {
  const [age, setAge] = useState('6-9')
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('honesty')
  const [language, setLanguage] = useState('english')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [result, setResult] = useState<StoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ageGroups = [
    { value: '3-5', label: 'Ages 3-5 (Preschool)' },
    { value: '6-9', label: 'Ages 6-9 (Elementary)' },
    { value: '10-13', label: 'Ages 10-13 (Middle School)' }
  ]

  const themes = [
    { value: 'honesty', label: 'Honesty & Truthfulness' },
    { value: 'kindness', label: 'Kindness & Compassion' },
    { value: 'prayer', label: 'Prayer & Worship' },
    { value: 'sharing', label: 'Sharing & Generosity' },
    { value: 'patience', label: 'Patience & Perseverance' },
    { value: 'forgiveness', label: 'Forgiveness & Mercy' },
    { value: 'gratitude', label: 'Gratitude & Thankfulness' },
    { value: 'respect', label: 'Respect & Good Manners' },
    { value: 'helping', label: 'Helping Others' },
    { value: 'courage', label: 'Courage & Bravery' }
  ]

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'العربية' },
    { value: 'somali', label: 'Soomaali' },
    { value: 'urdu', label: 'اردو' }
  ]

  const generateStory = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the main character')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // First, generate the story with AI
      const response = await openaiService.generateKidsStory(age, name.trim(), theme, language)
      
      if (response.success && response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content.trim()
        
        // Try to parse JSON response
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const storyData = JSON.parse(jsonMatch[0])
            
            // Set the story first so user can see it
            setResult(storyData)
            setIsLoading(false)
            
            // Then generate illustration in background
            setIsGeneratingImage(true)
            try {
              const illustration = await dalleService.generateStoryImage(
                storyData.title,
                name.trim(),
                theme,
                age
              )
              
              // Update result with illustration
              setResult(prev => prev ? { ...prev, illustration } : null)
            } catch (imageError) {
              console.error('Image generation error:', imageError)
              // Story still works without image
            } finally {
              setIsGeneratingImage(false)
            }
          } else {
            throw new Error('Invalid response format')
          }
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          setError('Failed to parse AI response. Please try again.')
          setIsLoading(false)
        }
      } else {
        setError(response.error || 'Failed to generate story. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Story generation error:', error)
      setError('An error occurred while generating the story. Please try again.')
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
              📖 Islamic Kids Stories
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Islamic Stories for Kids
          </h2>
          <p className="text-lg text-gray-600">
            Create meaningful stories that teach Islamic morals and values
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Create Your Story
            </h3>
            
            <div className="space-y-6">
              {/* Child's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Character's Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter child's name (e.g., Amina, Omar, Fatima)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                />
              </div>

              {/* Age Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                >
                  {ageGroups.map(group => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme/Moral Lesson
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

              {/* Language */}
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
                onClick={generateStory}
                disabled={isLoading || !name.trim()}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Story...
                  </span>
                ) : (
                  '📚 Generate Story'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Generated Story
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result ? (
              <div className="space-y-6">
                {/* Story Title */}
                <div className="text-center">
                  <h4 className="text-xl font-bold text-islamic-green-800 mb-2">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    For ages {result.ageGroup} • Theme: {result.theme}
                  </p>
                </div>

                {/* Story Illustration */}
                {(result.illustration || isGeneratingImage) && (
                  <div className="text-center">
                    {isGeneratingImage && !result.illustration ? (
                      <div className="bg-gray-100 rounded-lg p-8">
                        <div className="animate-pulse flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-islamic-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-600">🎨 Generating illustration...</p>
                        </div>
                      </div>
                    ) : result.illustration && (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <img
                          src={result.illustration}
                          alt={`Illustration for ${result.title}`}
                          className="w-full max-w-md mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-xs text-gray-500 mt-2">Story Illustration</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Story Content */}
                <div className="bg-islamic-green-50 rounded-lg p-6">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {result.story}
                  </p>
                </div>

                {/* Moral Lesson */}
                <div className="bg-islamic-gold-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Moral Lesson:</p>
                  <p className="text-gray-900 font-medium">
                    {result.moralLesson}
                  </p>
                </div>

                {/* Quranic Reference */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Qur'anic Guidance:</p>
                  <p className="text-sm text-blue-800 mb-2">
                    {result.quranReference}
                  </p>
                  {result.arabicVerse && (
                    <p className="arabic-text text-lg text-blue-900 mb-2">
                      {result.arabicVerse}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 italic">
                    {result.verseTranslation}
                  </p>
                </div>

                {/* Parent Notes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">For Parents:</p>
                  <p className="text-sm text-gray-600">
                    {result.parentNotes}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => window.print()}
                    className="btn-secondary flex-1"
                  >
                    🖨️ Print Story
                  </button>
                  <button
                    onClick={() => {
                      const text = `${result.title}\n\n${result.story}\n\nMoral: ${result.moralLesson}`
                      navigator.clipboard.writeText(text)
                    }}
                    className="btn-secondary flex-1"
                  >
                    📋 Copy Text
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-500">
                  Enter a name and choose settings to generate your Islamic story
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default KidsStoryGenerator