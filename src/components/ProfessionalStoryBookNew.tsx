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
  audioStartTime?: number
  audioEndTime?: number
}

const ProfessionalStoryBook: React.FC<StoryBookProps> = ({
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
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showStoryBook, setShowStoryBook] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Split story into shorter, more manageable pages
  const splitStoryIntoPages = useCallback((text: string, wordsPerPage: number = 40): string[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    const pages: string[] = []
    let currentPageText = ''
    let wordCount = 0

    for (const sentence of sentences) {
      const words = sentence.trim().split(' ')
      if (wordCount + words.length > wordsPerPage && currentPageText) {
        pages.push(currentPageText.trim() + '.')
        currentPageText = sentence.trim()
        wordCount = words.length
      } else {
        currentPageText += (currentPageText ? '. ' : '') + sentence.trim()
        wordCount += words.length
      }
    }

    if (currentPageText) {
      pages.push(currentPageText.trim() + '.')
    }

    return pages.length > 0 ? pages : [text]
  }, [])

  // Create pages with proper audio timing (slower pacing)
  const createPages = useCallback((): PageData[] => {
    const storyPages = splitStoryIntoPages(story)
    const pages: PageData[] = []
    
    // Much slower pacing - each page gets 15 seconds minimum
    const baseTimePerPage = Math.max(15, audioDuration / (storyPages.length + 4))

    // Cover page (first 20 seconds or 15% of audio)
    pages.push({
      type: 'cover',
      content: { title, coverImage },
      audioStartTime: 0,
      audioEndTime: Math.max(20, audioDuration * 0.15)
    })

    // Story pages (60% of audio, much slower)
    let currentStartTime = Math.max(20, audioDuration * 0.15)
    storyPages.forEach((pageText, index) => {
      const endTime = currentStartTime + baseTimePerPage
      
      pages.push({
        type: 'story',
        content: { text: pageText },
        illustration: sceneIllustrations[index % sceneIllustrations.length],
        audioStartTime: currentStartTime,
        audioEndTime: Math.min(endTime, audioDuration * 0.75)
      })
      
      currentStartTime = endTime
    })

    // Special pages (last 25% of audio)
    const specialStartTime = audioDuration * 0.75
    const specialTimePerPage = (audioDuration * 0.25) / 3

    pages.push({
      type: 'moral',
      content: { moralLesson },
      audioStartTime: specialStartTime,
      audioEndTime: specialStartTime + specialTimePerPage
    })

    pages.push({
      type: 'quran',
      content: { quranReference, arabicVerse, verseTranslation },
      audioStartTime: specialStartTime + specialTimePerPage,
      audioEndTime: specialStartTime + (specialTimePerPage * 2)
    })

    pages.push({
      type: 'parents',
      content: { parentNotes },
      audioStartTime: specialStartTime + (specialTimePerPage * 2),
      audioEndTime: audioDuration
    })

    return pages
  }, [story, title, coverImage, moralLesson, quranReference, arabicVerse, verseTranslation, parentNotes, sceneIllustrations, audioDuration, splitStoryIntoPages])

  const allPages = createPages()

  // Audio event handlers with much better synchronization
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
      console.log('📻 Audio loaded:', audio.duration, 'seconds')
    }

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      const progress = currentTime / audio.duration
      setCurrentTime(currentTime)
      setAudioProgress(progress)

      // Find the correct page based on audio timing with slower transitions
      if (isPlaying && allPages.length > 0) {
        const targetPage = allPages.findIndex(page => 
          currentTime >= (page.audioStartTime || 0) && 
          currentTime < (page.audioEndTime || audio.duration)
        )

        if (targetPage !== -1 && targetPage !== currentPage) {
          console.log(`📖 Page transition: ${currentTime.toFixed(1)}s -> Page ${targetPage + 1} (${allPages[targetPage]?.type})`)
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
  }, [isPlaying, currentPage, allPages])

  // Show story book with fade-in effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStoryBook(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

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
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      // Seek audio to page start time if available
      if (audioRef.current && allPages[newPage]?.audioStartTime) {
        audioRef.current.currentTime = allPages[newPage].audioStartTime || 0
      }
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      // Seek audio to page start time if available
      if (audioRef.current && allPages[newPage]?.audioStartTime) {
        audioRef.current.currentTime = allPages[newPage].audioStartTime || 0
      }
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderPage = (page: PageData) => {
    const baseClasses = "w-full h-full flex flex-col items-center justify-center p-8 text-center"
    
    switch (page.type) {
      case 'cover':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50`}>
            {page.content.coverImage && (
              <div className="w-80 h-56 mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={page.content.coverImage} 
                  alt="Book Cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold text-center text-emerald-800 mb-6 font-serif leading-tight max-w-2xl">
              {page.content.title}
            </h1>
            <div className="text-emerald-600 text-xl font-medium mb-4">
              ✨ An Islamic Story for Children ✨
            </div>
            <div className="text-emerald-700 text-sm">
              📖 Listen and follow along
            </div>
          </div>
        )

      case 'story':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50`}>
            {page.illustration && (
              <div className="w-96 h-64 mb-8 rounded-xl overflow-hidden shadow-xl border-3 border-white">
                <img 
                  src={page.illustration} 
                  alt="Story illustration" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="text-gray-800 text-xl leading-relaxed text-center max-w-2xl font-serif px-6">
              {page.content.text}
            </div>
          </div>
        )

      case 'moral':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50`}>
            <div className="text-8xl mb-8">🌟</div>
            <h2 className="text-3xl font-bold text-amber-800 mb-8 text-center font-serif">
              Moral Lesson
            </h2>
            <div className="text-gray-800 text-xl leading-relaxed text-center max-w-2xl font-serif px-6">
              {page.content.moralLesson}
            </div>
          </div>
        )

      case 'quran':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50`}>
            <div className="text-8xl mb-8">📖</div>
            <h2 className="text-3xl font-bold text-emerald-800 mb-8 text-center font-serif">
              From the Holy Quran
            </h2>
            <div className="text-emerald-700 text-lg font-medium mb-6 text-center">
              {page.content.quranReference}
            </div>
            {page.content.arabicVerse && (
              <div className="text-3xl text-center mb-6 text-emerald-900 font-arabic leading-loose px-4">
                {page.content.arabicVerse}
              </div>
            )}
            <div className="text-gray-700 text-xl leading-relaxed text-center max-w-2xl font-serif italic px-6">
              "{page.content.verseTranslation}"
            </div>
          </div>
        )

      case 'parents':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50`}>
            <div className="text-8xl mb-8">👨‍👩‍👧‍👦</div>
            <h2 className="text-3xl font-bold text-purple-800 mb-8 text-center font-serif">
              For Parents
            </h2>
            <div className="text-gray-800 text-lg leading-relaxed text-center max-w-2xl font-serif px-6">
              {page.content.parentNotes}
            </div>
          </div>
        )

      default:
        return <div className={baseClasses}>Page not found</div>
    }
  }

  if (!showStoryBook) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-white text-center animate-pulse">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-2xl font-serif">Opening your story...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-white bg-opacity-20 backdrop-blur-md text-white w-12 h-12 rounded-full hover:bg-opacity-30 transition-all duration-300 z-20 flex items-center justify-center text-xl font-bold"
      >
        ✕
      </button>

      {/* Story Book */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full aspect-[4/3] overflow-hidden">
        {/* Page Content */}
        <div className="w-full h-full transition-all duration-700 ease-in-out">
          {allPages[currentPage] && renderPage(allPages[currentPage])}
        </div>

        {/* Audio Progress Bar */}
        {audioUrl && (
          <div className="absolute bottom-20 left-8 right-8 bg-black bg-opacity-20 rounded-full p-3">
            <div className="bg-gray-300 h-3 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${audioProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-700 px-2">
              <span>{formatTime(currentTime)}</span>
              <span>Page {currentPage + 1} of {allPages.length}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="bg-white bg-opacity-20 backdrop-blur-md text-white px-6 py-3 rounded-full disabled:opacity-50 hover:bg-opacity-30 transition-all duration-300 flex items-center gap-2 font-medium"
        >
          ← Previous
        </button>

        {audioUrl && (
          <button
            onClick={togglePlayPause}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 shadow-xl font-medium"
          >
            {isPlaying ? '⏸️ Pause Story' : '▶️ Read Aloud'}
          </button>
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === allPages.length - 1}
          className="bg-white bg-opacity-20 backdrop-blur-md text-white px-6 py-3 rounded-full disabled:opacity-50 hover:bg-opacity-30 transition-all duration-300 flex items-center gap-2 font-medium"
        >
          Next →
        </button>
      </div>

      {/* Audio Element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      {/* Professional Styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Crimson+Text:wght@400;600;700&display=swap');
        
        .font-arabic {
          font-family: 'Amiri', serif;
          direction: rtl;
        }
        
        .font-serif {
          font-family: 'Crimson Text', serif;
        }
        
        /* Smooth animations */
        * {
          transition: all 0.3s ease;
        }
        
        /* Better text shadows for readability */
        h1, h2 {
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}

export default ProfessionalStoryBook