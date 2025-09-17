import React, { useState, useEffect, useRef } from 'react'
import { backendApiService } from '../services/backendApiService'
import { dalleService } from '../services/dalleService'
import browserTTSService from '../services/browserTTSService'
import jsPDF from 'jspdf'

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

  const ageGroups = [
    { value: '3-5', label: '3-5 Years (Preschool)' },
    { value: '6-9', label: '6-9 Years (Elementary)' },
    { value: '10-13', label: '10-13 Years (Middle School)' }
  ]

  const themes = [
    { value: 'honesty', label: '🤝 Honesty & Truthfulness' },
    { value: 'kindness', label: '💕 Kindness & Compassion' },
    { value: 'prayer', label: '🤲 Prayer & Worship' },
    { value: 'sharing', label: '🤗 Sharing & Generosity' },
    { value: 'patience', label: '⏳ Patience & Perseverance' },
    { value: 'forgiveness', label: '💚 Forgiveness & Mercy' },
    { value: 'gratitude', label: '🙏 Gratitude & Thankfulness' },
    { value: 'respect', label: '👥 Respect & Good Manners' },
    { value: 'helping', label: '🤝 Helping Others' },
    { value: 'courage', label: '🦁 Courage & Bravery' }
  ]

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'arabic', label: 'العربية (Arabic)' },
    { value: 'urdu', label: 'اردو (Urdu)' },
    { value: 'spanish', label: 'Español' },
    { value: 'french', label: 'Français' }
  ]

  const generateProfessionalPDF = () => {
    if (!result) return

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 25
    const innerWidth = pageWidth - 2 * margin

    try {
      // === PAGE 1: Beautiful Title Page ===
      // Islamic Pattern Background (Decorative frame)
      pdf.setDrawColor(0, 102, 51) // Islamic green
      pdf.setLineWidth(3)
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'D')
      pdf.setLineWidth(1)
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 30, 'D')
      
      // Add decorative Islamic star pattern corners
      const drawStar = (x: number, y: number, size: number) => {
        pdf.setFillColor(204, 153, 0) // Gold
        pdf.circle(x, y, size, 'F')
        pdf.setFillColor(0, 102, 51)
        pdf.circle(x, y, size * 0.6, 'F')
      }
      drawStar(30, 30, 8)
      drawStar(pageWidth - 30, 30, 8)
      drawStar(30, pageHeight - 30, 8)
      drawStar(pageWidth - 30, pageHeight - 30, 8)
      
      // Bismillah at top
      pdf.setTextColor(0, 102, 51)
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(14)
      pdf.text('In the Name of Allah, the Most Gracious, the Most Merciful', pageWidth / 2, 50, { align: 'center' })
      
      // Main Title with Golden accent
      pdf.setTextColor(204, 153, 0) // Gold
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(28)
      const titleLines = pdf.splitTextToSize(result.title, innerWidth - 20)
      let yPos = 100
      titleLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPos, { align: 'center' })
        yPos += 14
      })
      
      // Decorative divider
      pdf.setDrawColor(204, 153, 0)
      pdf.setLineWidth(2)
      pdf.line(pageWidth/2 - 40, yPos + 10, pageWidth/2 + 40, yPos + 10)
      
      // Story info in elegant box
      yPos += 30
      pdf.setFillColor(245, 248, 250)
      pdf.setDrawColor(0, 102, 51)
      pdf.setLineWidth(0.5)
      pdf.roundedRect(margin, yPos, innerWidth, 45, 5, 5, 'FD')
      
      pdf.setTextColor(0, 102, 51)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`✦ Age Group: ${result.ageGroup} years`, margin + 10, yPos + 15)
      pdf.text(`✦ Theme: ${result.theme}`, margin + 10, yPos + 25)
      pdf.text(`✦ Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin + 10, yPos + 35)
      
      // === PAGE 2: Story Content (Compact) ===
      pdf.addPage()
      
      // Header with Islamic pattern
      pdf.setFillColor(0, 102, 51)
      pdf.rect(0, 0, pageWidth, 25, 'F')
      
      // Add gold accent stripe
      pdf.setFillColor(204, 153, 0)
      pdf.rect(0, 25, pageWidth, 3, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('The Story', pageWidth / 2, 16, { align: 'center' })
      
      // Story text with better formatting
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.setLineHeightFactor(1.5)
      
      const storyLines = pdf.splitTextToSize(result.story, innerWidth)
      yPos = 45
      
      storyLines.forEach((line: string) => {
        if (yPos > pageHeight - 35) {
          // Add new page with consistent header
          pdf.addPage()
          pdf.setFillColor(0, 102, 51)
          pdf.rect(0, 0, pageWidth, 15, 'F')
          pdf.setTextColor(255, 255, 255)
          pdf.setFontSize(12)
          pdf.text('Story (continued)', pageWidth / 2, 10, { align: 'center' })
          pdf.setTextColor(0, 0, 0)
          pdf.setFontSize(11)
          yPos = 30
        }
        pdf.text(line, margin, yPos)
        yPos += 6
      })
      
      // === COMBINED PAGE: Moral Lesson & Quranic Guidance ===
      // Add spacing if we're near bottom
      if (yPos > pageHeight - 80) {
        pdf.addPage()
        yPos = 30
      } else {
        yPos += 20
      }
      
      // Moral Lesson Section
      pdf.setFillColor(204, 153, 0)
      pdf.setDrawColor(204, 153, 0)
      pdf.rect(margin, yPos, innerWidth, 8, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('Moral Lesson', margin + 5, yPos + 6)
      
      yPos += 18
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      const moralLines = pdf.splitTextToSize(result.moralLesson, innerWidth)
      moralLines.forEach((line: string) => {
        pdf.text(line, margin, yPos)
        yPos += 7
      })
      
      // Quranic Reference Section (on same page)
      yPos += 15
      if (yPos > pageHeight - 60) {
        pdf.addPage()
        yPos = 30
      }
      
      pdf.setFillColor(0, 102, 51)
      pdf.rect(margin, yPos, innerWidth, 8, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text('Quranic Guidance', margin + 5, yPos + 6)
      
      yPos += 18
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(11)
      
      // Quran Reference
      if (result.quranReference) {
        pdf.text(result.quranReference, pageWidth / 2, yPos, { align: 'center' })
        yPos += 10
      }
      
      // Arabic verse placeholder
      if (result.arabicVerse) {
        pdf.setFillColor(245, 248, 250)
        pdf.rect(margin + 10, yPos, innerWidth - 20, 25, 'D')
        pdf.setFont('helvetica', 'italic')
        pdf.setFontSize(10)
        pdf.text('[Arabic Verse - Best viewed in digital format]', pageWidth / 2, yPos + 15, { align: 'center' })
        yPos += 35
      }
      
      // Verse Translation
      if (result.verseTranslation) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        const verseLines = pdf.splitTextToSize(`"${result.verseTranslation}"`, innerWidth - 20)
        verseLines.forEach((line: string) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage()
            yPos = 30
          }
          pdf.text(line, pageWidth / 2, yPos, { align: 'center' })
          yPos += 6
        })
      }
      
      // Parent Notes Section (on same or next page)
      yPos += 20
      if (yPos > pageHeight - 80 || !result.parentNotes) {
        if (result.parentNotes) {
          pdf.addPage()
          yPos = 30
        }
      }
      
      if (result.parentNotes) {
        pdf.setFillColor(102, 51, 153) // Purple for parents
        pdf.rect(margin, yPos, innerWidth, 8, 'F')
        
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(14)
        pdf.text('For Parents & Educators', margin + 5, yPos + 6)
        
        yPos += 18
        pdf.setTextColor(0, 0, 0)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        const parentLines = pdf.splitTextToSize(result.parentNotes, innerWidth)
        
        parentLines.forEach((line: string) => {
          if (yPos > pageHeight - 30) {
            pdf.addPage()
            yPos = 30
          }
          pdf.text(line, margin, yPos)
          yPos += 6
        })
      }

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text('Generated by BarakahBundle - Islamic AI Tools', pageWidth / 2, pageHeight - 10, { align: 'center' })
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' })
      }

      const fileName = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_islamic_story.pdf`
      pdf.save(fileName)
      
      console.log(`📄 Professional PDF exported: ${fileName}`)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('Failed to export PDF. Please try again.')
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
      // Step 1: Generate Story
      setGenerationProgress(prev => ({ ...prev, story: true }))
      
      const response = formData.storyMode === 'preset' 
        ? await backendApiService.generateKidsStory(formData.age, formData.name, formData.theme, formData.language)
        : await backendApiService.generateCustomStory(formData.customPrompt, formData.age, formData.language)
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate story')
      }

      // Backend already returns parsed data
      const storyData = response.data
      setResult(storyData)

      // Step 2: Generate Cover Image
      setGenerationProgress(prev => ({ ...prev, cover: true }))
      try {
        const coverImage = await dalleService.generateBookCover(
          storyData.title,
          storyData.theme || formData.theme,
          formData.age
        )
        setResult(prev => prev ? { ...prev, coverImage } : null)
      } catch (coverError) {
        console.error('Cover generation error:', coverError)
      }

      // Step 3: Generate Scene Illustrations
      setGenerationProgress(prev => ({ ...prev, illustrations: true }))
      try {
        const sceneIllustrations = await dalleService.generateStoryScenes(
          storyData.title,
          storyData.story,
          formData.storyMode === 'preset' ? formData.name : 'protagonist',
          storyData.theme || formData.theme,
          formData.age
        )
        setResult(prev => prev ? { ...prev, sceneIllustrations } : null)
      } catch (imageError) {
        console.error('Scene illustrations error:', imageError)
      }

      // Step 4: Generate Audio
      setGenerationProgress(prev => ({ ...prev, audio: true }))
      try {
        console.log('🎵 Starting professional audio generation...')
        const audioResult = await backendApiService.generateStoryAudio(storyData.story, formData.language)
        
        // Check if we got enhanced browser TTS metadata or legacy audio URL
        if (typeof audioResult === 'object' && audioResult.useEnhancedBrowserTTS) {
          console.log('✅ Using enhanced browser TTS with Islamic optimization')
          setResult(prev => prev ? { 
            ...prev, 
            useEnhancedBrowserTTS: true,
            audioMetadata: audioResult.audioMetadata,
            audioError: null
          } : null)
        } else if (typeof audioResult === 'string') {
          console.log('✅ Audio generated successfully with legacy format')
          setResult(prev => prev ? { ...prev, audioUrl: audioResult } : null)
        } else {
          throw new Error('Invalid audio response format')
        }
      } catch (audioError) {
        console.error('❌ Audio generation error:', audioError)
        // NO BROWSER TTS FALLBACK - Real audio only
        setResult(prev => prev ? { 
          ...prev, 
          audioError: 'Audio generation temporarily unavailable. Please try again.' 
        } : null)
      }

      // Complete
      setGenerationProgress(prev => ({ ...prev, complete: true }))

    } catch (error) {
      console.error('Story generation error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while generating the story')
    } finally {
      setIsGenerating(false)
    }
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
                      placeholder="Enter character name (e.g., Amina, Omar, Fatima)"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Islamic Theme</label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      {themes.map(theme => (
                        <option key={theme.value} value={theme.value}>{theme.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Custom Story Idea</label>
                  <textarea
                    value={formData.customPrompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPrompt: e.target.value }))}
                    placeholder="Describe your story idea in detail... (e.g., 'A story about a young Muslim learning patience during Ramadan fasting')"
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
              )}

              {/* Age Group */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Target Age Group</label>
                <select
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  {ageGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateStory}
                disabled={isGenerating || (formData.storyMode === 'preset' && !formData.name.trim()) || (formData.storyMode === 'custom' && !formData.customPrompt.trim())}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Enterprise Story...
                  </span>
                ) : (
                  '🚀 Generate Professional Story'
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">📖</span>
              Story Results
            </h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-500 text-xl mr-3">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🎨✨</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Professional Story</h3>
                  <p className="text-gray-600">Please wait while we generate your enterprise-quality content</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'story', label: '📝 Generating Story Content', desc: 'Creating narrative with Islamic values' },
                    { key: 'cover', label: '🎨 Creating Cover Art', desc: 'AI-generated professional cover' },
                    { key: 'illustrations', label: '🖼️ Drawing Scene Illustrations', desc: 'Custom artwork for each scene' },
                    { key: 'audio', label: '🎵 Recording Audio Narration', desc: 'Professional voice synthesis' }
                  ].map((step) => (
                    <div key={step.key} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{step.label}</span>
                        <span className="text-sm text-gray-500">{step.desc}</span>
                      </div>
                      <div className="flex items-center">
                        {generationProgress[step.key as keyof typeof generationProgress] ? (
                          <span className="text-green-600 font-semibold">✓ Complete</span>
                        ) : (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && !isGenerating && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">✅ Story Generated Successfully</h3>
                    <button
                      onClick={generateProfessionalPDF}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      📄 Export Professional PDF
                    </button>
                  </div>
                  
                  {/* Audio Player - Prominent Position */}
                  {result.audioUrl ? (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🎧</span>
                        <h4 className="font-bold text-blue-800">Listen to Your Story</h4>
                      </div>
                      <audio 
                        controls 
                        className="w-full h-10 rounded-lg" 
                        preload="metadata"
                        style={{ background: '#f8fafc' }}
                      >
                        <source src={result.audioUrl} type="audio/mpeg" />
                        <source src={result.audioUrl} type="audio/wav" />
                        <source src={result.audioUrl} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                      <p className="text-sm text-blue-600 mt-2">
                        🎵 Professional AI narration of your Islamic story
                      </p>
                    </div>
                  ) : result.audioError ? (
                    <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">❌</span>
                        <h4 className="font-bold text-red-800">Audio Generation Failed</h4>
                      </div>
                      <p className="text-red-700">{result.audioError}</p>
                      <p className="text-sm text-red-600 mt-2">
                        Please check that OpenAI API key is configured in the backend.
                      </p>
                    </div>
                  ) : null}
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{result.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {result.ageGroup} years • {result.theme} • Generated {new Date().toLocaleDateString()}
                    </p>
                    <div className="max-h-40 overflow-y-auto text-sm text-gray-700 leading-relaxed">
                      {result.story.substring(0, 300)}...
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-gray-700 mb-1">📸 Illustrations</div>
                      <div className="text-gray-600">
                        {result.sceneIllustrations?.length || 0} custom images
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="font-semibold text-gray-700 mb-1">🎵 Audio</div>
                      {result.audioUrl ? (
                        <div className="space-y-2">
                          <div className="text-green-600 text-sm">✓ Professional narration ready</div>
                          <audio 
                            controls 
                            className="w-full h-8" 
                            style={{ maxWidth: '100%' }}
                            preload="metadata"
                          >
                            <source src={result.audioUrl} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      ) : result.audioError ? (
                        <div className="text-red-600 text-sm">
                          ❌ Audio failed: {result.audioError}
                        </div>
                      ) : (
                        <div className="text-gray-600">Processing audio...</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-amber-800 mb-3">💡 Moral Lesson</h4>
                  <p className="text-amber-700">{result.moralLesson}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-green-800 mb-3">📖 Quranic Reference</h4>
                  <p className="text-green-700 font-medium mb-2">{result.quranReference}</p>
                  <p className="text-green-600 italic">"{result.verseTranslation}"</p>
                </div>
              </div>
            )}

            {!result && !isGenerating && !error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Create</h3>
                <p className="text-gray-500">Configure your story settings and click generate to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnterpriseStoryGenerator