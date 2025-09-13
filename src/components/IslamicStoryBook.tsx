import React, { useState, useEffect, useRef } from 'react'

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

const IslamicStoryBook: React.FC<StoryBookProps> = ({
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBookOpen, setIsBookOpen] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Split story into pages (chunks)
  const splitStoryIntoPages = (text: string, wordsPerPage: number = 80) => {
    const words = text.split(' ')
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      pages.push(words.slice(i, i + wordsPerPage).join(' '))
    }
    
    return pages
  }

  const storyPages = splitStoryIntoPages(story)
  
  // Calculate total pages including special pages
  const totalPages = storyPages.length + 4 // Cover + story pages + moral + quran + end

  // Open book animation and auto-start reading
  useEffect(() => {
    setTimeout(() => {
      setIsBookOpen(true)
      // Auto-start reading if audio is available
      if (audioUrl && audioRef.current) {
        setTimeout(() => {
          startReading()
        }, 1500) // Wait for book opening animation
      }
    }, 500)
  }, [audioUrl])

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      audioRef.current.addEventListener('ended', handleAudioEnded)
      
      return () => {
        audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate)
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audioRef.current?.removeEventListener('ended', handleAudioEnded)
      }
    }
  }, [audioUrl])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      
      // Auto-turn pages based on audio progress
      if (autoPlay && duration > 0) {
        const progress = audioRef.current.currentTime / duration
        const targetPage = Math.floor(progress * (totalPages - 1))
        if (targetPage !== currentPage && targetPage < totalPages) {
          setCurrentPage(targetPage)
        }
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setAutoPlay(false)
  }

  const startReading = () => {
    if (audioRef.current) {
      setAutoPlay(true)
      setIsPlaying(true)
      setCurrentPage(1) // Start from first story page
      audioRef.current.play()
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
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Get current illustration based on page
  const getCurrentIllustration = () => {
    if (currentPage === 0) return coverImage // Cover page
    const storyPageIndex = currentPage - 1
    if (storyPageIndex < storyPages.length && sceneIllustrations && sceneIllustrations.length > 0) {
      // Each page gets its own illustration if available
      if (storyPageIndex < sceneIllustrations.length) {
        return sceneIllustrations[storyPageIndex]
      }
      // If not enough illustrations, use the last one for remaining pages
      return sceneIllustrations[sceneIllustrations.length - 1]
    }
    return null
  }

  const renderPage = () => {
    if (currentPage === 0) {
      // Cover Page
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-islamic-green-100 to-islamic-gold-50">
          {coverImage && (
            <img 
              src={coverImage} 
              alt="Book Cover" 
              className="w-full max-w-md rounded-lg shadow-lg mb-6"
            />
          )}
          <h1 className="text-4xl font-bold text-islamic-green-800 text-center mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">An Islamic Story</p>
          
          {audioUrl && (
            <button
              onClick={startReading}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <span>📖</span>
              <span>Start Reading with Audio</span>
              <span>🔊</span>
            </button>
          )}
        </div>
      )
    } else if (currentPage <= storyPages.length) {
      // Story Pages
      const pageContent = storyPages[currentPage - 1]
      const illustration = getCurrentIllustration()
      
      return (
        <div className="h-full flex flex-col p-8 bg-gradient-to-b from-white to-islamic-green-50">
          {illustration && (
            <div className="mb-6 rounded-xl overflow-hidden shadow-xl">
              <img 
                src={illustration} 
                alt={`Story scene ${currentPage}`}
                className="w-full h-72 object-cover"
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-2">
            <p className="text-xl leading-relaxed text-gray-800 font-serif" style={{ lineHeight: '1.8' }}>
              {pageContent}
            </p>
          </div>
          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <div className="text-islamic-green-600 font-medium">
              Chapter {Math.ceil(currentPage / 2)}
            </div>
            <div className="font-medium">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      )
    } else if (currentPage === storyPages.length + 1) {
      // Moral Lesson Page
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-islamic-gold-50">
          <div className="text-3xl mb-4">💫</div>
          <h2 className="text-2xl font-bold text-islamic-green-800 mb-4">
            Moral of the Story
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-md max-w-lg">
            <p className="text-lg text-gray-800 text-center">
              {moralLesson}
            </p>
          </div>
        </div>
      )
    } else if (currentPage === storyPages.length + 2) {
      // Quranic Reference Page
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-blue-50">
          <div className="text-3xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-islamic-green-800 mb-4">
            Qur'anic Guidance
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-md max-w-lg">
            <p className="text-sm text-blue-800 mb-3">{quranReference}</p>
            {arabicVerse && (
              <p className="arabic-text text-xl text-blue-900 text-center mb-3">
                {arabicVerse}
              </p>
            )}
            <p className="text-gray-700 italic text-center">
              {verseTranslation}
            </p>
          </div>
        </div>
      )
    } else {
      // End Page
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-islamic-green-100 to-islamic-gold-50">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-3xl font-bold text-islamic-green-800 mb-4">
            The End
          </h2>
          <p className="text-lg text-gray-600 mb-8">Thank you for reading!</p>
          
          <div className="bg-white rounded-lg p-6 shadow-md max-w-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">For Parents:</h3>
            <p className="text-sm text-gray-600">{parentNotes}</p>
          </div>
          
          <button
            onClick={() => setCurrentPage(0)}
            className="btn-secondary"
          >
            Read Again
          </button>
        </div>
      )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Book Container */}
      <div className={`book-container ${isBookOpen ? 'book-open' : ''}`}>
        <div className="book">
          {/* Left Page */}
          <div className="page page-left">
            <div className="page-content">
              {currentPage % 2 === 0 && renderPage()}
            </div>
          </div>
          
          {/* Right Page */}
          <div className="page page-right">
            <div className="page-content">
              {currentPage % 2 === 1 && renderPage()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="btn-secondary disabled:opacity-50"
        >
          ← Previous
        </button>

        {audioUrl && (
          <button
            onClick={togglePlayPause}
            className="btn-primary px-6"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="btn-secondary disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* Audio Element */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}

      {/* Progress Bar */}
      {audioUrl && duration > 0 && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-64">
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-islamic-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .book-container {
          perspective: 1200px;
          transition: transform 0.6s;
        }
        
        .book {
          width: 800px;
          height: 600px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }
        
        .page {
          position: absolute;
          width: 400px;
          height: 600px;
          background: white;
          border-radius: 0 10px 10px 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .page-left {
          left: 0;
          border-radius: 10px 0 0 10px;
          transform-origin: right center;
        }
        
        .page-right {
          right: 0;
          transform-origin: left center;
        }
        
        .page-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .book-open .page-left {
          transform: rotateY(-20deg);
        }
        
        .book-open .page-right {
          transform: rotateY(20deg);
        }
        
        @media (max-width: 768px) {
          .book {
            width: 100%;
            max-width: 600px;
            height: 500px;
          }
          
          .page {
            width: 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default IslamicStoryBook