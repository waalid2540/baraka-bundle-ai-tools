import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { openaiService } from '../services/openaiService'
import { dalleService } from '../services/dalleService'
import { databaseService } from '../services/databaseService'
import EnhancedStoryBook from '../components/EnhancedStoryBook'
import PaymentGateway from '../components/PaymentGateway'

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
  
  // Access control state
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true)
  const [showPayment, setShowPayment] = useState<boolean>(false)

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

  // Check access on component mount
  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      setCheckingAccess(true)
      
      // Get user email from localStorage or prompt
      const storedEmail = localStorage.getItem('user_email')
      
      if (!storedEmail) {
        // No user email, show payment
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      // Check if user exists and has access
      const user = await databaseService.getUserByEmail(storedEmail)
      if (user) {
        const access = await databaseService.checkUserAccess(user.id, 'story_generator')
        setHasAccess(access)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Access check error:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
    }
  }

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
            
            // Set the story data
            setResult(storyData)
            setIsLoading(false)
            
            // Auto-open storybook immediately
            setShowStoryBook(true)
            
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
              console.log('🎬 Starting scene illustration generation...')
              const sceneIllustrations = await dalleService.generateStoryScenes(
                storyData.title,
                storyData.story,
                storyMode === 'preset' ? name.trim() : 'protagonist',
                storyData.theme || theme,
                age
              )
              
              console.log('🖼️ Received illustrations from DALL-E service:', sceneIllustrations?.length || 0)
              console.log('🔍 Illustration preview:', sceneIllustrations?.map((url, i) => `${i+1}: ${url?.substring(0, 40)}...`))
              
              // Update result with scene illustrations
              setResult(prev => {
                const updated = prev ? { ...prev, sceneIllustrations } : null
                console.log('📊 Updated story result with illustrations:', updated?.sceneIllustrations?.length || 0)
                return updated
              })
            } catch (imageError) {
              console.error('❌ Scene illustrations error:', imageError)
              // Story still works without images
            } finally {
              setIsGeneratingImages(false)
              console.log('🎨 Image generation phase completed')
            }

            // Generate audio reading in background
            setIsGeneratingAudio(true)
            try {
              const audioUrl = await openaiService.generateStoryAudio(storyData.story, language)
              
              // Update result with audio
              setResult(prev => prev ? { ...prev, audioUrl } : null)
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
              {checkingAccess ? (
                /* Loading state while checking access */
                <button disabled className="w-full bg-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Checking access...</span>
                  </div>
                </button>
              ) : hasAccess ? (
                /* User has access - show generate button */
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
              ) : (
                /* User needs to pay */
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    🚀 Get Unlimited Access - $2.99
                  </button>
                  
                  {/* Already Purchased Button */}
                  <button
                    type="button"
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      <span>Already Purchased? Access Now</span>
                    </div>
                  </button>
                </div>
              )}
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
                {/* Generating Status - Book will auto-open */}
                <div className="text-center py-12">
                  <div className="text-5xl mb-6">📚✨</div>
                  <h3 className="text-2xl font-bold text-islamic-green-800 mb-4">
                    Creating Your Storybook
                  </h3>
                  <p className="text-lg text-gray-700 mb-6">
                    {result.title}
                  </p>
                  
                  {/* Generation Progress */}
                  <div className="bg-white rounded-lg p-6 shadow-md max-w-md mx-auto">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">📖 Story</span>
                        <span className="text-green-600">✓ Complete</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🎨 Book Cover</span>
                        <span className={isGeneratingCover ? "text-yellow-600" : "text-green-600"}>
                          {isGeneratingCover ? "Creating..." : "✓ Complete"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">📸 Page Illustrations</span>
                        <span className={isGeneratingImages ? "text-yellow-600" : "text-green-600"}>
                          {isGeneratingImages ? "Creating unique images for each page..." : "✓ Complete"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🔊 Audio Narration</span>
                        <span className={isGeneratingAudio ? "text-yellow-600" : "text-green-600"}>
                          {isGeneratingAudio ? "Recording..." : "✓ Complete"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-6 animate-pulse">
                    Your storybook will open automatically when ready...
                  </p>
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

      {/* Enhanced Storybook Modal */}
      {showStoryBook && result && (
        <EnhancedStoryBook
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

      {/* Payment Gateway Modal */}
      {showPayment && (
        <PaymentGateway
          productType="story_generator"
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false)
            checkAccess() // Recheck access after payment
          }}
        />
      )}
    </div>
  )
}

export default KidsStoryGenerator