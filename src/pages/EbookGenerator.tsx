import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PaymentGateway from '../components/PaymentGateway'

interface EbookTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: 'religious' | 'educational' | 'story' | 'guide'
  layout: 'modern' | 'classic' | 'minimalist' | 'decorative'
}

interface EbookChapter {
  id: string
  title: string
  content: string
  order: number
}

interface EbookData {
  title: string
  subtitle: string
  author: string
  description: string
  category: string
  language: string
  chapters: EbookChapter[]
  template: EbookTemplate
  coverStyle: string
  includeImages: boolean
  targetAudience: string
}

const EbookGenerator: React.FC = () => {
  const { user, hasAccess } = useAuth()
  const [showPayment, setShowPayment] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEbook, setGeneratedEbook] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const [ebookData, setEbookData] = useState<EbookData>({
    title: '',
    subtitle: '',
    author: user?.name || '',
    description: '',
    category: 'religious',
    language: 'english',
    chapters: [],
    template: null,
    coverStyle: 'islamic_calligraphy',
    includeImages: true,
    targetAudience: 'general'
  })

  const templates: EbookTemplate[] = [
    {
      id: 'islamic_classic',
      name: 'Islamic Classic',
      description: 'Traditional Islamic design with Arabic calligraphy elements',
      preview: '📜',
      category: 'religious',
      layout: 'classic'
    },
    {
      id: 'modern_islamic',
      name: 'Modern Islamic',
      description: 'Contemporary design with Islamic geometric patterns',
      preview: '🕌',
      category: 'religious',
      layout: 'modern'
    },
    {
      id: 'quran_study',
      name: 'Quran Study Guide',
      description: 'Perfect for Quranic studies and commentary',
      preview: '📖',
      category: 'educational',
      layout: 'classic'
    },
    {
      id: 'hadith_collection',
      name: 'Hadith Collection',
      description: 'Designed for hadith compilations and Islamic literature',
      preview: '📚',
      category: 'educational',
      layout: 'classic'
    },
    {
      id: 'kids_islamic',
      name: 'Kids Islamic Stories',
      description: 'Colorful and engaging design for children',
      preview: '🌟',
      category: 'story',
      layout: 'decorative'
    },
    {
      id: 'prayer_guide',
      name: 'Prayer & Worship Guide',
      description: 'Clean layout for prayer guides and worship manuals',
      preview: '🤲',
      category: 'guide',
      layout: 'minimalist'
    }
  ]

  const coverStyles = [
    { id: 'islamic_calligraphy', name: 'Islamic Calligraphy', description: 'Beautiful Arabic calligraphy design' },
    { id: 'geometric_pattern', name: 'Geometric Patterns', description: 'Islamic geometric art patterns' },
    { id: 'mosque_silhouette', name: 'Mosque Architecture', description: 'Stunning mosque silhouettes' },
    { id: 'nature_islamic', name: 'Islamic Nature', description: 'Natural scenes with Islamic elements' },
    { id: 'modern_minimal', name: 'Modern Minimal', description: 'Clean, professional design' },
    { id: 'vintage_manuscript', name: 'Vintage Manuscript', description: 'Classical manuscript style' }
  ]

  const categories = [
    { id: 'religious', name: 'Religious Studies', icon: '☪️' },
    { id: 'biography', name: 'Islamic Biography', icon: '👤' },
    { id: 'history', name: 'Islamic History', icon: '🏛️' },
    { id: 'children', name: 'Children Stories', icon: '👶' },
    { id: 'prayer', name: 'Prayer & Worship', icon: '🤲' },
    { id: 'quran', name: 'Quran Studies', icon: '📖' },
    { id: 'hadith', name: 'Hadith Collection', icon: '📜' },
    { id: 'fiqh', name: 'Islamic Law (Fiqh)', icon: '⚖️' }
  ]

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'arabic', name: 'العربية', flag: '🇸🇦' },
    { code: 'urdu', name: 'اردو', flag: '🇵🇰' },
    { code: 'turkish', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'french', name: 'Français', flag: '🇫🇷' },
    { code: 'spanish', name: 'Español', flag: '🇪🇸' },
    { code: 'indonesian', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'malay', name: 'Bahasa Melayu', flag: '🇲🇾' }
  ]

  const handlePaymentSuccess = () => {
    setShowPayment(false)
  }

  const checkAccess = () => {
    if (!hasAccess('ebook_generator')) {
      setShowPayment(true)
      return false
    }
    return true
  }

  const addChapter = () => {
    const newChapter: EbookChapter = {
      id: Date.now().toString(),
      title: '',
      content: '',
      order: ebookData.chapters.length + 1
    }
    setEbookData(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }))
  }

  const updateChapter = (id: string, field: keyof EbookChapter, value: string | number) => {
    setEbookData(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    }))
  }

  const removeChapter = (id: string) => {
    setEbookData(prev => ({
      ...prev,
      chapters: prev.chapters.filter(chapter => chapter.id !== id)
    }))
  }

  const generateEbook = async () => {
    if (!checkAccess()) return

    if (!ebookData.title || !ebookData.description || ebookData.chapters.length === 0) {
      alert('Please fill in all required fields and add at least one chapter')
      return
    }

    setIsGenerating(true)

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'

      const response = await fetch(`${apiUrl}/generate-ebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...ebookData,
          userEmail: user?.email
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate ebook')
      }

      const result = await response.json()
      setGeneratedEbook(result)
      console.log('✅ Ebook generated successfully:', result)
    } catch (error) {
      console.error('❌ Error generating ebook:', error)
      alert('Failed to generate ebook. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadEbook = (format: string) => {
    if (!generatedEbook?.downloadUrl) return

    const link = document.createElement('a')
    link.href = `${generatedEbook.downloadUrl}?format=${format}`
    link.download = `${ebookData.title}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo()
      case 2:
        return renderTemplateSelection()
      case 3:
        return renderChapterEditor()
      case 4:
        return renderPreviewAndGenerate()
      default:
        return renderBasicInfo()
    }
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Book Title *
          </label>
          <input
            type="text"
            value={ebookData.title}
            onChange={(e) => setEbookData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
            placeholder="Enter your book title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            value={ebookData.subtitle}
            onChange={(e) => setEbookData(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
            placeholder="Enter subtitle (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author Name
          </label>
          <input
            type="text"
            value={ebookData.author}
            onChange={(e) => setEbookData(prev => ({ ...prev, author: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
            placeholder="Enter author name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={ebookData.category}
            onChange={(e) => setEbookData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={ebookData.language}
            onChange={(e) => setEbookData(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience
          </label>
          <select
            value={ebookData.targetAudience}
            onChange={(e) => setEbookData(prev => ({ ...prev, targetAudience: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
          >
            <option value="general">General Audience</option>
            <option value="children">Children (5-12 years)</option>
            <option value="teens">Teenagers (13-17 years)</option>
            <option value="adults">Adults (18+ years)</option>
            <option value="scholars">Islamic Scholars</option>
            <option value="beginners">New Muslims</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Book Description *
        </label>
        <textarea
          value={ebookData.description}
          onChange={(e) => setEbookData(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
          placeholder="Describe what your book is about..."
        />
      </div>
    </div>
  )

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Template & Design</h2>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => setEbookData(prev => ({ ...prev, template }))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                ebookData.template?.id === template.id
                  ? 'border-islamic-green-500 bg-islamic-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">{template.preview}</div>
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.category}</span>
                <span className="text-xs text-gray-500">{template.layout}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cover Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coverStyles.map(style => (
            <div
              key={style.id}
              onClick={() => setEbookData(prev => ({ ...prev, coverStyle: style.id }))}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                ebookData.coverStyle === style.id
                  ? 'border-islamic-green-500 bg-islamic-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-semibold text-gray-900">{style.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{style.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="includeImages"
          checked={ebookData.includeImages}
          onChange={(e) => setEbookData(prev => ({ ...prev, includeImages: e.target.checked }))}
          className="h-5 w-5 text-islamic-green-600 focus:ring-islamic-green-500 border-gray-300 rounded"
        />
        <label htmlFor="includeImages" className="text-sm font-medium text-gray-700">
          Include AI-generated illustrations throughout the book
        </label>
      </div>
    </div>
  )

  const renderChapterEditor = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">📝 Chapters</h2>
        <button
          onClick={addChapter}
          className="px-4 py-2 bg-islamic-green-600 text-white rounded-lg hover:bg-islamic-green-700 transition-colors"
        >
          + Add Chapter
        </button>
      </div>

      {ebookData.chapters.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No chapters added yet</p>
          <button
            onClick={addChapter}
            className="px-6 py-3 bg-islamic-green-600 text-white rounded-lg hover:bg-islamic-green-700 transition-colors"
          >
            Add Your First Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ebookData.chapters.map((chapter, index) => (
            <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Chapter {index + 1}
                </h3>
                <button
                  onClick={() => removeChapter(chapter.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  🗑️ Remove
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                    placeholder="Enter chapter title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Content
                  </label>
                  <textarea
                    value={chapter.content}
                    onChange={(e) => updateChapter(chapter.id, 'content', e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                    placeholder="Write your chapter content here. You can also provide a brief outline and let AI expand it..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderPreviewAndGenerate = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📖 Preview & Generate</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Book Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Basic Information</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><strong>Title:</strong> {ebookData.title}</li>
              {ebookData.subtitle && <li><strong>Subtitle:</strong> {ebookData.subtitle}</li>}
              <li><strong>Author:</strong> {ebookData.author}</li>
              <li><strong>Category:</strong> {categories.find(c => c.id === ebookData.category)?.name}</li>
              <li><strong>Language:</strong> {languages.find(l => l.code === ebookData.language)?.name}</li>
              <li><strong>Target Audience:</strong> {ebookData.targetAudience}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Design & Content</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><strong>Template:</strong> {ebookData.template?.name}</li>
              <li><strong>Cover Style:</strong> {coverStyles.find(s => s.id === ebookData.coverStyle)?.name}</li>
              <li><strong>Chapters:</strong> {ebookData.chapters.length}</li>
              <li><strong>Include Images:</strong> {ebookData.includeImages ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
          <p className="text-sm text-gray-600">{ebookData.description}</p>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Chapters</h4>
          <div className="space-y-2">
            {ebookData.chapters.map((chapter, index) => (
              <div key={chapter.id} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                <span className="text-sm text-gray-600">{chapter.title || 'Untitled Chapter'}</span>
                <span className="text-xs text-gray-400">
                  ({chapter.content.length} characters)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!generatedEbook ? (
        <button
          onClick={generateEbook}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-islamic-green-700 hover:to-islamic-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Professional eBook...
            </div>
          ) : (
            <div className="flex items-center">
              <span className="mr-2">🚀</span>
              Generate Professional eBook
            </div>
          )}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-800 mb-4">📚 Your eBook is Ready!</h3>
          <p className="text-green-700 mb-6">
            Your professional Islamic eBook has been generated successfully! Choose your preferred format to download.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => downloadEbook('pdf')}
              className="flex flex-col items-center p-4 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm font-medium">PDF</span>
            </button>

            <button
              onClick={() => downloadEbook('epub')}
              className="flex flex-col items-center p-4 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📱</span>
              <span className="text-sm font-medium">EPUB</span>
            </button>

            <button
              onClick={() => downloadEbook('mobi')}
              className="flex flex-col items-center p-4 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📖</span>
              <span className="text-sm font-medium">MOBI</span>
            </button>

            <button
              onClick={() => downloadEbook('docx')}
              className="flex flex-col items-center p-4 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <span className="text-2xl mb-2">📝</span>
              <span className="text-sm font-medium">DOCX</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-islamic-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Islamic eBook Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional Islamic eBooks with AI-powered content generation,
            beautiful templates, and multiple export formats
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? 'bg-islamic-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      currentStep > step ? 'bg-islamic-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-8 text-center text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-islamic-green-600 font-medium' : ''}>
              Basic Info
            </span>
            <span className={currentStep >= 2 ? 'text-islamic-green-600 font-medium' : ''}>
              Template
            </span>
            <span className={currentStep >= 3 ? 'text-islamic-green-600 font-medium' : ''}>
              Chapters
            </span>
            <span className={currentStep >= 4 ? 'text-islamic-green-600 font-medium' : ''}>
              Generate
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep < 4 && (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-islamic-green-600 text-white rounded-lg hover:bg-islamic-green-700 transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Gateway */}
      {showPayment && (
        <PaymentGateway
          productType="ebook_generator"
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default EbookGenerator