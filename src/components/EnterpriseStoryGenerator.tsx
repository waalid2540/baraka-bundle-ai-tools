import React, { useState, useEffect, useRef } from 'react'
import { backendApiService } from '../services/backendApiService'
import { dalleBackendService } from '../services/dalleBackendService'
import browserTTSService from '../services/browserTTSService'
import { generateBookStylePDF } from '../utils/pdfGenerator'

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
  audioError?: string
  coverImage?: string
  useBrowserTTS?: boolean
  useEnhancedBrowserTTS?: boolean
  audioMetadata?: any
}

interface EnterpriseStoryGeneratorProps {
  hasAccess: boolean
  onPaymentClick: () => void
}

const EnterpriseStoryGenerator: React.FC<EnterpriseStoryGeneratorProps> = ({
  hasAccess,
  onPaymentClick
}) => {
  const [formData, setFormData] = useState({
    storyMode: 'preset' as 'preset' | 'custom',
    name: '',
    age: '6-9',
    theme: 'honesty',
    language: 'english',
    customPrompt: ''
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({
    story: false,
    cover: false,
    illustrations: false,
    audio: false,
    complete: false
  })
  const [result, setResult] = useState<StoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const themes = [
    { value: 'honesty', label: 'Honesty & Truthfulness', icon: '🤝' },
    { value: 'kindness', label: 'Kindness & Compassion', icon: '💝' },
    { value: 'patience', label: 'Patience & Perseverance', icon: '⏳' },
    { value: 'gratitude', label: 'Gratitude & Thankfulness', icon: '🙏' },
    { value: 'sharing', label: 'Sharing & Generosity', icon: '🎁' },
    { value: 'respect', label: 'Respect for Parents & Elders', icon: '👨‍👩‍👧' },
    { value: 'prayer', label: 'Importance of Prayer', icon: '🕌' },
    { value: 'cleanliness', label: 'Cleanliness & Purity', icon: '✨' },
    { value: 'forgiveness', label: 'Forgiveness & Mercy', icon: '🤲' },
    { value: 'courage', label: 'Courage & Bravery', icon: '🦁' }
  ]

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'العربية' },
    { value: 'somali', label: 'Somali' },
    { value: 'urdu', label: 'اردو' },
    { value: 'turkish', label: 'Türkçe' },
    { value: 'indonesian', label: 'Bahasa Indonesia' },
    { value: 'malay', label: 'Bahasa Melayu' },
    { value: 'bengali', label: 'বাংলা' },
    { value: 'spanish', label: 'Español' },
    { value: 'french', label: 'Français' }
  ]

  const generateProfessionalPDF = async () => {
    if (!result) return

    try {
      const pdf = await generateBookStylePDF(result)
      const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_islamic_story.pdf`
      pdf.save(fileName)

      console.log(`📄 Professional book-style PDF exported with images: ${fileName}`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      console.log('📸 Downloading image:', imageName)

      // Create a temporary link element
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = imageName
      link.target = '_blank'

      // For data URLs, download directly
      if (imageUrl.startsWith('data:')) {
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        console.log('✅ Image downloaded successfully')
        return
      }

      // For external URLs, fetch and convert to blob
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      link.href = blobUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
      console.log('✅ Image downloaded successfully')

    } catch (error) {
      console.error('❌ Error downloading image:', error)
      alert('Failed to download image. Please try right-clicking and saving manually.')
    }
  }

  const downloadAllImages = async () => {
    if (!result) return

    try {
      const storyTitle = result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()

      // Download cover image
      if (result.coverImage) {
        await downloadImage(result.coverImage, `${storyTitle}_cover.png`)
        await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between downloads
      }

      // Download scene illustrations
      if (result.sceneIllustrations) {
        for (let i = 0; i < result.sceneIllustrations.length; i++) {
          await downloadImage(result.sceneIllustrations[i], `${storyTitle}_scene_${i + 1}.png`)
          await new Promise(resolve => setTimeout(resolve, 500)) // Small delay between downloads
        }
      }

      console.log('✅ All images downloaded successfully')
    } catch (error) {
      console.error('❌ Error downloading all images:', error)
      alert('Some images may have failed to download. Please try downloading individual images.')
    }
  }

  const generateStory = async () => {
    if (!hasAccess) {
      onPaymentClick()
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)
    setGenerationProgress({
      story: false,
      cover: false,
      illustrations: false,
      audio: false,
      complete: false
    })

    try {
      // Step 1: Generate Story Text
      setGenerationProgress(prev => ({ ...prev, story: true }))

      let storyResponse
      if (formData.storyMode === 'preset') {
        if (!formData.name.trim()) {
          throw new Error('Please enter a character name')
        }
        storyResponse = await backendApiService.generateKidsStory(
          formData.age,
          formData.name,
          formData.theme,
          formData.language
        )
      } else {
        if (!formData.customPrompt.trim()) {
          throw new Error('Please enter your story idea')
        }
        storyResponse = await backendApiService.generateCustomStory(
          formData.customPrompt,
          formData.age,
          formData.language
        )
      }

      if (!storyResponse.success || !storyResponse.data) {
        throw new Error(storyResponse.error || 'Failed to generate story')
      }

      const storyData = storyResponse.data
      setResult(prev => ({
        ...storyData,
        ageGroup: formData.age,
        theme: storyData.theme || formData.theme
      }))

      // Step 2: Generate Cover Image
      setGenerationProgress(prev => ({ ...prev, cover: true }))
      try {
        const coverImage = await dalleBackendService.generateBookCover(
          storyData.title,
          storyData.theme || formData.theme,
          formData.age
        )
        setResult(prev => prev ? { ...prev, coverImage } : prev)
        console.log('✅ Cover image generated')
      } catch (imgError) {
        console.error('Cover image generation error:', imgError)
      }

      // Step 3: Generate Scene Illustrations
      setGenerationProgress(prev => ({ ...prev, illustrations: true }))
      try {
        const sceneIllustrations = await dalleBackendService.generateStoryScenes(
          storyData.title,
          storyData.story,
          formData.storyMode === 'preset' ? formData.name : 'protagonist',
          storyData.theme || formData.theme,
          formData.age
        )
        setResult(prev => prev ? { ...prev, sceneIllustrations } : prev)
        console.log(`✅ Generated ${sceneIllustrations.length} scene illustrations`)
      } catch (imgError) {
        console.error('Scene illustrations error:', imgError)
      }

      // Step 4: Generate Audio
      setGenerationProgress(prev => ({ ...prev, audio: true }))

      try {
        const audioData = await backendApiService.generateStoryAudio(
          storyData.story,
          formData.language
        )

        if (typeof audioData === 'string' && audioData.startsWith('data:audio')) {
          setResult(prev => prev ? { ...prev, audioUrl: audioData } : prev)
          console.log('✅ Audio generated successfully')
        } else if (typeof audioData === 'object' && audioData.useEnhancedBrowserTTS) {
          setResult(prev => prev ? {
            ...prev,
            useEnhancedBrowserTTS: true,
            audioMetadata: audioData.audioMetadata
          } : prev)
          console.log('✅ Using enhanced browser TTS')
        } else {
          throw new Error('Invalid audio response format')
        }
      } catch (audioError: any) {
        console.error('Audio generation error:', audioError)
        setResult(prev => prev ? {
          ...prev,
          audioError: audioError.message,
          useBrowserTTS: true
        } : prev)
      }

      setGenerationProgress(prev => ({ ...prev, complete: true }))
    } catch (err: any) {
      setError(err.message || 'Failed to generate story')
      console.error('Story generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const playAudio = async () => {
    if (!result) return

    if (result.audioUrl && !result.useBrowserTTS && !result.useEnhancedBrowserTTS) {
      // Use generated audio
      if (audioRef.current) {
        if (isPlayingAudio) {
          audioRef.current.pause()
          setIsPlayingAudio(false)
        } else {
          try {
            await audioRef.current.play()
            setIsPlayingAudio(true)
          } catch (err) {
            console.error('Audio playback error:', err)
          }
        }
      }
    } else if (result.useEnhancedBrowserTTS || result.useBrowserTTS) {
      // Use browser TTS
      if (isPlayingAudio) {
        browserTTSService.stop()
        setIsPlayingAudio(false)
      } else {
        setIsPlayingAudio(true)
        try {
          await browserTTSService.speak(
            result.story,
            formData.language,
            result.useEnhancedBrowserTTS,
            result.audioMetadata
          )
        } catch (err) {
          console.error('TTS error:', err)
        } finally {
          setIsPlayingAudio(false)
        }
      }
    }
  }

  useEffect(() => {
    if (audioRef.current && result?.audioUrl) {
      audioRef.current.onended = () => setIsPlayingAudio(false)
    }
  }, [result?.audioUrl])

  // Helper function to split story into pages (matching PDF)
  const splitStoryIntoPages = (storyContent: string, wordsPerPage: number = 80): string[] => {
    const words = storyContent.split(' ')
    const pages: string[] = []

    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageContent = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ')
      if (pageContent.trim()) {
        pages.push(pageContent.trim())
      }
    }

    return pages.length > 0 ? pages : [storyContent]
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-8xl mb-8">🔒</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Premium Islamic Story Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create personalized, professionally illustrated Islamic stories with AI-powered narration and beautiful PDF exports
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Illustrations</h3>
                <p className="text-gray-600 text-sm">Custom artwork for every story scene</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-3xl mb-3">🎵</div>
                <h3 className="font-semibold text-gray-900 mb-2">Audio Narration</h3>
                <p className="text-gray-600 text-sm">Professional voice reading</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="font-semibold text-gray-900 mb-2">Premium PDF</h3>
                <p className="text-gray-600 text-sm">Beautiful formatted downloads</p>
              </div>
            </div>

            <button
              onClick={onPaymentClick}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              🚀 Get Premium Access - $2.99
            </button>

            <button
              onClick={onPaymentClick}
              className="block w-full mt-4 bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
            >
              ✅ Already Purchased? Access Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2">📚 Enterprise Story Generator</h1>
          <p className="text-xl opacity-90">Create professional Islamic stories with AI-powered illustrations and narration</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Story Configuration Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-3">⚙️</span>
              Story Configuration
            </h2>

            <div className="space-y-8">
              {/* Story Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Story Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'preset', icon: '🎭', title: 'Preset Themes', desc: 'Choose from Islamic values' },
                    { value: 'custom', icon: '✨', title: 'Custom Story', desc: 'Your own creative idea' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, storyMode: mode.value as 'preset' | 'custom' }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.storyMode === mode.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-2xl mb-2">{mode.icon}</div>
                      <div className="font-semibold">{mode.title}</div>
                      <div className="text-xs opacity-70">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {formData.storyMode === 'preset' ? (
                <>
                  {/* Character Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Main Character Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Ahmed, Fatima, Ali"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Islamic Value Theme</label>
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                      {themes.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, theme: theme.value }))}
                          className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                            formData.theme === theme.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{theme.icon}</span>
                            <span className="text-sm font-medium">{theme.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Your Story Idea</label>
                  <textarea
                    value={formData.customPrompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="Describe your Islamic story idea... For example: 'A story about a young boy who learns the importance of helping his neighbors during Ramadan'"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>
              )}

              {/* Age Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Age Group</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '3-5', label: '3-5 years', icon: '🍼' },
                    { value: '6-9', label: '6-9 years', icon: '🎈' },
                    { value: '10-12', label: '10-12 years', icon: '📚' }
                  ].map((age) => (
                    <button
                      key={age.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, age: age.value }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        formData.age === age.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-xl mb-1">{age.icon}</div>
                      <div className="text-sm font-medium">{age.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Story Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-800"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateStory}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                  isGenerating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-xl hover:shadow-2xl hover:-translate-y-1'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Generating Story...
                  </div>
                ) : (
                  '✨ Generate Islamic Story'
                )}
              </button>

              {/* Progress Indicators */}
              {isGenerating && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm font-semibold text-blue-900 mb-2">Generation Progress:</div>
                  {[
                    { key: 'story', label: '📝 Creating Story', status: generationProgress.story },
                    { key: 'cover', label: '🎨 Designing Cover', status: generationProgress.cover },
                    { key: 'illustrations', label: '🖼️ Illustrating Scenes', status: generationProgress.illustrations },
                    { key: 'audio', label: '🎵 Generating Audio', status: generationProgress.audio }
                  ].map((step) => (
                    <div key={step.key} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full mr-3 ${
                        step.status ? 'bg-green-500' : 'bg-gray-300 animate-pulse'
                      }`}></div>
                      <span className={`text-sm ${
                        step.status ? 'text-green-700 font-semibold' : 'text-gray-600'
                      }`}>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">⚠️ {error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📖</span>
              Story Results
            </h2>

            {result ? (
              <div className="space-y-8">
                {/* Story Book Display */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-amber-900 mb-4">{result.title}</h3>

                  {/* Cover Image */}
                  {result.coverImage && (
                    <div className="mb-6 rounded-xl overflow-hidden shadow-lg relative group">
                      <img
                        src={result.coverImage}
                        alt="Story Cover"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => downloadImage(result.coverImage!, `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_cover.png`)}
                          className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                          title="Download Cover Image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        📖 Story Cover
                      </div>
                    </div>
                  )}

                  {/* Story Pages with Illustrations */}
                  <div className="space-y-6">
                    {splitStoryIntoPages(result.story, 80).map((pageContent, index) => (
                      <div key={index} className="story-page mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md">
                        {result.sceneIllustrations && result.sceneIllustrations[index] && (
                          <div className="mb-6 rounded-lg overflow-hidden shadow-md relative group">
                            <img
                              src={result.sceneIllustrations[index]}
                              alt={`Story illustration for page ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={() => downloadImage(result.sceneIllustrations![index], `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_scene_${index + 1}.png`)}
                                className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                                title={`Download Scene ${index + 1} Image`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm font-medium">
                              🎨 Scene {index + 1}
                            </div>
                          </div>
                        )}
                        <div className="text-base text-gray-800 leading-relaxed font-medium">
                          <p className="whitespace-pre-wrap">{pageContent}</p>
                        </div>
                        <div className="mt-4 text-right text-sm text-gray-500">
                          Page {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Moral Lesson */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-3 text-lg">🌟 Moral Lesson</h4>
                  <p className="text-green-800 leading-relaxed">{result.moralLesson}</p>
                </div>

                {/* Quranic Reference */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                  <h4 className="font-bold text-indigo-900 mb-3 text-lg">📖 Quranic Wisdom</h4>
                  <p className="text-indigo-800 mb-3 font-semibold">{result.quranReference}</p>
                  {result.arabicVerse && (
                    <p className="text-indigo-700 text-right text-xl mb-3" dir="rtl">{result.arabicVerse}</p>
                  )}
                  {result.verseTranslation && (
                    <p className="text-indigo-700 italic">"{result.verseTranslation}"</p>
                  )}
                </div>

                {/* Parent Notes */}
                {result.parentNotes && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h4 className="font-bold text-purple-900 mb-3 text-lg">👨‍👩‍👧 Parent Guide</h4>
                    <p className="text-purple-800 leading-relaxed">{result.parentNotes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={playAudio}
                    disabled={!result.audioUrl && !result.useBrowserTTS && !result.useEnhancedBrowserTTS}
                    className={`flex-1 py-4 rounded-xl font-bold transition-all duration-300 ${
                      (!result.audioUrl && !result.useBrowserTTS && !result.useEnhancedBrowserTTS)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isPlayingAudio ? '⏸️ Pause' : '🔊 Play Audio'}
                  </button>

                  <button
                    onClick={downloadAllImages}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    title="Download all story images individually"
                  >
                    🖼️ All Images
                  </button>
                  <button
                    onClick={generateProfessionalPDF}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    📥 Download PDF Book
                  </button>
                </div>

                {/* Audio Element */}
                {result.audioUrl && !result.useBrowserTTS && !result.useEnhancedBrowserTTS && (
                  <audio
                    ref={audioRef}
                    src={result.audioUrl}
                    className="hidden"
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-6">📚</div>
                <p className="text-gray-500 text-lg">Your generated story will appear here</p>
                <p className="text-gray-400 mt-2">Configure your story settings and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterpriseStoryGenerator