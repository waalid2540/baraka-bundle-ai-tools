import React, { useState, useEffect, useRef, useCallback } from 'react'

interface StoryBookProps {
  title: string
  story: string
  moralLesson: string
  quranReference: string
  arabicVerse: string
  verseTranslation: string
  parentNotes: string
  sceneIllustrations?: string[]
  audioUrl?: string
  coverImage?: string
  onClose: () => void
}

interface PageData {
  type: 'cover' | 'story' | 'moral' | 'quran' | 'parents' | 'end'
  content: any
  illustration?: string
}

const EnhancedStoryBook: React.FC<StoryBookProps> = ({
  title,
  story,
  moralLesson,
  quranReference,
  arabicVerse,
  verseTranslation,
  parentNotes,
  sceneIllustrations = [],
  audioUrl,
  coverImage,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Split story into pages with consistent word count
  const splitStoryIntoPages = useCallback((text: string, wordsPerPage: number = 80): string[] => {
    const words = text.split(' ')
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageText = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ')
      if (pageText.trim()) {
        pages.push(pageText.trim())
      }
    }
    
    return pages.length > 0 ? pages : [text]
  }, [])

  const storyPages = splitStoryIntoPages(story)

  // Build all pages
  const allPages: PageData[] = [
    { type: 'cover', content: { title, coverImage } },
    ...storyPages.map((text, index) => ({
      type: 'story' as const,
      content: { 
        text, 
        pageNumber: index + 1, 
        totalPages: storyPages.length 
      },
      illustration: sceneIllustrations[index]
    })),
    { type: 'moral', content: { moralLesson } },
    { type: 'quran', content: { quranReference, arabicVerse, verseTranslation } },
    { type: 'parents', content: { parentNotes } },
    { type: 'end', content: { title } }
  ]

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      console.log(`🔊 Audio loaded: ${audio.duration}s duration`)
    }

    const handleTimeUpdate = () => {
      const current = audio.currentTime
      const duration = audio.duration
      
      setCurrentTime(current)
      setAudioProgress((current / duration) * 100)

      // Smart audio-text synchronization
      if (isPlaying && duration > 0) {
        const progress = current / duration
        let targetPage = 0

        if (progress <= 0.05) {
          // Stay on cover for first 5%
          targetPage = 0
        } else if (progress <= 0.85) {
          // Story pages during main 80% of audio (5% to 85%)
          const storyProgress = (progress - 0.05) / 0.8
          targetPage = Math.floor(storyProgress * storyPages.length) + 1
          targetPage = Math.min(targetPage, storyPages.length)
        } else {
          // Special pages for last 15% (85% to 100%)
          const specialProgress = (progress - 0.85) / 0.15
          const specialPageIndex = Math.floor(specialProgress * 3) // 3 special pages
          targetPage = storyPages.length + 1 + specialPageIndex
          targetPage = Math.min(targetPage, allPages.length - 1)
        }

        if (targetPage !== currentPage && targetPage >= 0 && targetPage < allPages.length) {
          console.log(`📖 Audio sync: ${(progress * 100).toFixed(1)}% -> Page ${targetPage + 1}`)
          setCurrentPage(targetPage)
        }
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentPage(allPages.length - 1)
      console.log('🔊 Audio ended')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isPlaying, currentPage, allPages.length, storyPages.length])

  // Auto-open book on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBookOpen(true)
      // Auto-start audio if available
      if (audioUrl && audioRef.current) {
        setTimeout(() => {
          startReading()
        }, 1000)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [audioUrl])

  const startReading = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
      console.log('🔊 Audio playback started')
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const nextPage = () => {
    if (currentPage < allPages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const renderPage = (page: PageData) => {
    switch (page.type) {
      case 'cover':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100">
            {page.content.coverImage && (
              <div className="w-full max-w-md mb-6 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={page.content.coverImage} 
                  alt="Book Cover" 
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            <h1 className="text-5xl font-bold text-emerald-800 text-center mb-4 font-serif">
              {page.content.title}
            </h1>
            <p className="text-xl text-emerald-600 mb-8 italic">An Islamic Story for Children</p>
            
            {audioUrl && (
              <button
                onClick={startReading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:from-emerald-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
              >
                <span className="text-2xl">📖</span>
                <span>Listen & Read</span>
                <span className="text-2xl">🔊</span>
              </button>
            )}
          </div>
        )

      case 'story':
        const hasIllustration = page.illustration && page.illustration.trim().length > 10
        
        return (
          <div className="h-full flex flex-col p-6 bg-gradient-to-b from-amber-50 to-orange-50">
            {/* Illustration Section */}
            <div className="mb-6 rounded-2xl overflow-hidden shadow-xl bg-white">
              {hasIllustration ? (
                <img 
                  src={page.illustration} 
                  alt={`Story illustration for page ${page.content.pageNumber}`}
                  className="w-full h-80 object-cover"
                  onLoad={() => console.log(`✅ Image loaded for page ${page.content.pageNumber}`)}
                  onError={(e) => {
                    console.error(`❌ Image failed for page ${page.content.pageNumber}`)
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-80 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                  <div className="text-6xl mb-4 animate-pulse">🎨</div>
                  <p className="text-lg text-emerald-700 font-medium">Creating beautiful illustration...</p>
                  <p className="text-sm text-emerald-600 mt-2">Page {page.content.pageNumber} of {page.content.totalPages}</p>
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="flex-1 bg-white rounded-xl p-6 shadow-lg">
              <p className="text-xl leading-relaxed text-gray-800 font-serif" style={{ lineHeight: '1.8' }}>
                {page.content.text}
              </p>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-emerald-600 font-semibold">
                Chapter {Math.ceil(page.content.pageNumber / 2)}
              </div>
              <div className="text-gray-600 font-medium">
                Page {page.content.pageNumber} of {page.content.totalPages}
              </div>
              <div className="text-emerald-600 text-sm">
                {hasIllustration ? '✨ Illustrated' : '🎨 Creating art...'}
              </div>
            </div>
          </div>
        )

      case 'moral':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-100 to-orange-100">
            <div className="text-6xl mb-6">💫</div>
            <h2 className="text-4xl font-bold text-orange-800 mb-6 text-center">
              Moral of the Story
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl">
              <p className="text-xl text-gray-800 text-center leading-relaxed">
                {page.content.moralLesson}
              </p>
            </div>
          </div>
        )

      case 'quran':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-100 to-indigo-100">
            <div className="text-6xl mb-6">📖</div>
            <h2 className="text-4xl font-bold text-blue-800 mb-6 text-center">
              Qur'anic Wisdom
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl">
              <p className="text-lg text-blue-700 mb-4 font-semibold">{page.content.quranReference}</p>
              {page.content.arabicVerse && (
                <p className="text-2xl text-blue-900 text-center mb-4 font-arabic leading-loose">
                  {page.content.arabicVerse}
                </p>
              )}
              <p className="text-lg text-gray-700 italic text-center">
                {page.content.verseTranslation}
              </p>
            </div>
          </div>
        )

      case 'parents':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-100 to-emerald-100">
            <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
            <h2 className="text-4xl font-bold text-green-800 mb-6 text-center">
              For Parents
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl">
              <p className="text-lg text-gray-800 leading-relaxed">
                {page.content.parentNotes}
              </p>
            </div>
          </div>
        )

      case 'end':
        return (
          <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-100 to-pink-100">
            <div className="text-8xl mb-6">🌟</div>
            <h2 className="text-5xl font-bold text-purple-800 mb-4 text-center">
              The End
            </h2>
            <p className="text-2xl text-purple-600 mb-8">Thank you for reading!</p>
            <p className="text-xl text-gray-700 mb-8 text-center italic">"{page.content.title}"</p>
            
            <button
              onClick={() => setCurrentPage(0)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
            >
              📖 Read Again
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white bg-opacity-20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-300 z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Audio Progress Bar */}
      {audioUrl && audioDuration > 0 && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-80 z-10">
          <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white text-sm">
            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            <span>{Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}</span>
          </div>
        </div>
      )}

      {/* Book Container */}
      <div className={`book-container ${isBookOpen ? 'open' : ''}`}>
        <div className="book">
          {/* Left Page */}
          <div className="page page-left">
            <div className="page-content">
              {currentPage > 0 && currentPage % 2 === 1 && renderPage(allPages[currentPage - 1])}
            </div>
          </div>
          
          {/* Right Page */}
          <div className="page page-right">
            <div className="page-content">
              {currentPage < allPages.length && renderPage(allPages[currentPage])}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-white bg-opacity-20 backdrop-blur-md text-white px-6 py-3 rounded-full disabled:opacity-50 hover:bg-opacity-30 transition-all duration-300"
        >
          ← Previous
        </button>

        {audioUrl && (
          <button
            onClick={togglePlayPause}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-2"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === allPages.length - 1}
          className="bg-white bg-opacity-20 backdrop-blur-md text-white px-6 py-3 rounded-full disabled:opacity-50 hover:bg-opacity-30 transition-all duration-300"
        >
          Next →
        </button>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm z-10">
        Page {currentPage + 1} of {allPages.length}
      </div>

      {/* Audio Element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      {/* Styles */}
      <style jsx>{`
        .book-container {
          perspective: 1500px;
          transition: transform 0.8s ease;
        }
        
        .book-container.open {
          transform: scale(1.02);
        }
        
        .book {
          width: 900px;
          height: 650px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s ease;
        }
        
        .page {
          position: absolute;
          width: 450px;
          height: 650px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        
        .page-left {
          left: 0;
          transform-origin: right center;
          border-radius: 8px 0 0 8px;
        }
        
        .page-right {
          right: 0;
          transform-origin: left center;
          border-radius: 0 8px 8px 0;
        }
        
        .book-container.open .page-left {
          transform: rotateY(-25deg) translateZ(10px);
        }
        
        .book-container.open .page-right {
          transform: rotateY(25deg) translateZ(10px);
        }
        
        .page-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .book {
            width: 100%;
            max-width: 700px;
            height: 500px;
          }
          
          .page {
            width: 50%;
            height: 500px;
          }
          
          .book-container.open .page-left {
            transform: rotateY(-15deg) translateZ(5px);
          }
          
          .book-container.open .page-right {
            transform: rotateY(15deg) translateZ(5px);
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedStoryBook