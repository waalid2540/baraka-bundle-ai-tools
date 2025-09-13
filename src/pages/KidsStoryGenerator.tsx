import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'
import { dalleService } from '../services/dalleService'
import IslamicStoryBook from '../components/IslamicStoryBook'

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
  sceneIllustrations?: string[]
  audioUrl?: string
  coverImage?: string
}

const KidsStoryGenerator = () => {
  const [age, setAge] = useState('6-9')
  const [name, setName] = useState('')
  const [theme, setTheme] = useState('honesty')
  const [language, setLanguage] = useState('english')
  const [customPrompt, setCustomPrompt] = useState('')
  const [storyMode, setStoryMode] = useState<'preset' | 'custom'>('preset')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [result, setResult] = useState<StoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showStoryBook, setShowStoryBook] = useState(false)

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

  const languages = openaiService.getSupportedLanguages().map(lang => ({
    value: lang.toLowerCase(),
    label: lang
  }))

  const generateStory = async () => {
    // Validation based on story mode
    if (storyMode === 'preset' && !name.trim()) {
      setError('Please enter a name for the main character')
      return
    }
    if (storyMode === 'custom' && !customPrompt.trim()) {
      setError('Please enter your custom story idea')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Generate story based on mode
      const response = storyMode === 'preset' 
        ? await openaiService.generateKidsStory(age, name.trim(), theme, language)
        : await openaiService.generateCustomStory(customPrompt.trim(), age, language)
      
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
            
            // Generate book cover first
            setIsGeneratingCover(true)
            try {
              const coverImage = await dalleService.generateBookCover(
                storyData.title,
                storyData.theme || theme,
                age
              )
              setResult(prev => prev ? { ...prev, coverImage } : null)
            } catch (coverError) {
              console.error('Cover generation error:', coverError)
            } finally {
              setIsGeneratingCover(false)
            }
            
            // Generate scene illustrations in background
            setIsGeneratingImages(true)
            try {
              const sceneIllustrations = await dalleService.generateStoryScenes(
                storyData.title,
                storyData.story,
                storyMode === 'preset' ? name.trim() : 'protagonist',
                storyData.theme || theme,
                age
              )
              
              // Update result with scene illustrations
              setResult(prev => prev ? { ...prev, sceneIllustrations } : null)
            } catch (imageError) {
              console.error('Scene illustrations error:', imageError)
              // Story still works without images
            } finally {
              setIsGeneratingImages(false)
            }

            // Generate audio reading in background
            setIsGeneratingAudio(true)
            try {
              const audioUrl = await openaiService.generateStoryAudio(storyData.story, language)
              
              // Update result with audio
              setResult(prev => prev ? { ...prev, audioUrl } : null)
              
              // Auto-open storybook when everything is ready
              if (storyData && audioUrl) {
                setTimeout(() => setShowStoryBook(true), 500)
              }
            } catch (audioError) {
              console.error('Audio generation error:', audioError)
              // Story still works without audio
            } finally {
              setIsGeneratingAudio(false)
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
              {/* Story Mode Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Story Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStoryMode('preset')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      storyMode === 'preset'
                        ? 'border-islamic-green-500 bg-islamic-green-50 text-islamic-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">🎭</div>
                      <div className="font-medium">Preset Themes</div>
                      <div className="text-xs">Choose from Islamic values</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryMode('custom')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      storyMode === 'custom'
                        ? 'border-islamic-green-500 bg-islamic-green-50 text-islamic-green-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">✨</div>
                      <div className="font-medium">Custom Story</div>
                      <div className="text-xs">Your own idea</div>
                    </div>
                  </button>
                </div>
              </div>

              {storyMode === 'preset' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Custom Story Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Story Idea
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe your story idea... (e.g., 'A story about a young Muslim learning to be patient during Ramadan', 'A tale about kindness to animals in Islam')"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent resize-none"
                    />
                  </div>
                </>
              )}

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

              {/* Theme - only for preset mode */}
              {storyMode === 'preset' && (
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
              )}

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
                disabled={isLoading || (storyMode === 'preset' && !name.trim()) || (storyMode === 'custom' && !customPrompt.trim())}
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

                {/* Open Book Button */}
                <div className="text-center">
                  <button
                    onClick={() => setShowStoryBook(true)}
                    className="btn-primary px-8 py-3 text-lg flex items-center gap-3 mx-auto"
                    disabled={isGeneratingAudio || isGeneratingImages || isGeneratingCover}
                  >
                    <span className="text-2xl">📖</span>
                    <span>Open Interactive Storybook</span>
                    {result.audioUrl && <span className="text-2xl">🔊</span>}
                  </button>
                  {(isGeneratingAudio || isGeneratingImages || isGeneratingCover) && (
                    <p className="text-sm text-gray-600 mt-2">
                      {isGeneratingCover && '🎨 Creating book cover... '}
                      {isGeneratingImages && '📸 Generating illustrations... '}
                      {isGeneratingAudio && '🔊 Preparing audio narration... '}
                    </p>
                  )}
                </div>

                {/* Audio Player */}
                {(result.audioUrl || isGeneratingAudio) && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-center">
                      {isGeneratingAudio && !result.audioUrl ? (
                        <div className="flex items-center text-islamic-green-600">
                          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm">🔊 Generating audio reading...</span>
                        </div>
                      ) : result.audioUrl && (
                        <div className="w-full">
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">🔊 Listen to Story</span>
                          </div>
                          <audio controls className="w-full">
                            <source src={result.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scene Illustrations */}
                {(result.sceneIllustrations || isGeneratingImages) && (
                  <div>
                    <h5 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      📖 Story Scenes
                    </h5>
                    {isGeneratingImages && (!result.sceneIllustrations || result.sceneIllustrations.length === 0) ? (
                      <div className="bg-gray-100 rounded-lg p-8">
                        <div className="animate-pulse flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-islamic-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-600">🎨 Creating scene illustrations...</p>
                        </div>
                      </div>
                    ) : result.sceneIllustrations && result.sceneIllustrations.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.sceneIllustrations.map((illustration, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <img
                              src={illustration}
                              alt={`Scene ${index + 1} from ${result.title}`}
                              className="w-full rounded-lg shadow-md"
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">Scene {index + 1}</p>
                          </div>
                        ))}
                        {isGeneratingImages && (
                          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                            <div className="text-center">
                              <svg className="animate-spin h-6 w-6 text-islamic-green-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <p className="text-xs text-gray-600">More scenes...</p>
                            </div>
                          </div>
                        )}
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

      {/* Interactive Storybook Modal */}
      {showStoryBook && result && (
        <IslamicStoryBook
          title={result.title}
          story={result.story}
          moralLesson={result.moralLesson}
          quranReference={result.quranReference}
          arabicVerse={result.arabicVerse}
          verseTranslation={result.verseTranslation}
          parentNotes={result.parentNotes}
          sceneIllustrations={result.sceneIllustrations}
          audioUrl={result.audioUrl}
          coverImage={result.coverImage}
          onClose={() => setShowStoryBook(false)}
        />
      )}
    </div>
  )
}

export default KidsStoryGenerator