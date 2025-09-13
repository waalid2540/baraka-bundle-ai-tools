import React, { useState, useEffect, useRef } from 'react'
import './StoryBook.css'

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
  const [currentPage, setCurrentPage] = useState(-1) // Start with closed book
  const [isPlaying, setIsPlaying] = useState(false)
  const [bookState, setBookState] = useState<'closed' | 'opening' | 'open'>('closed')
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)

  // Split story into pages - MUST match dalleService page count exactly
  const splitIntoPages = (text: string, wordsPerPage: number = 80): string[] => {
    const words = text.split(' ')
    const pages: string[] = []
    
    for (let i = 0; i < words.length; i += wordsPerPage) {
      const pageText = words.slice(i, Math.min(i + wordsPerPage, words.length)).join(' ')
      if (pageText.trim()) {
        pages.push(pageText.trim())
      }
    }
    
    return pages.length > 0 ? pages : [text] // Ensure at least one page
  }

  const storyPages = splitIntoPages(story)
  
  // Build all pages array
  const allPages: { type: string; content: any }[] = [
    { type: 'cover', content: { title, coverImage } },
    ...storyPages.map((text, index) => ({
      type: 'story',
      content: {
        text,
        illustration: sceneIllustrations?.[index] || null,
        pageNumber: index + 1,
        totalPages: storyPages.length
      }
    })),
    { type: 'moral', content: { moralLesson } },
    { type: 'quran', content: { quranReference, arabicVerse, verseTranslation } },
    { type: 'parents', content: { parentNotes } },
    { type: 'end', content: { title } }
  ]

  // Open book animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setBookState('opening')
      setTimeout(() => {
        setBookState('open')
        setCurrentPage(0)
        // Auto-start audio if available
        if (audioUrl && audioRef.current) {
          setTimeout(() => {
            audioRef.current?.play()
            setIsPlaying(true)
          }, 1000)
        }
      }, 800)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [audioUrl])

  // Handle audio progress and page synchronization
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (audio.duration && audio.duration > 0) {
        const progressPercent = (audio.currentTime / audio.duration) * 100
        setProgress(progressPercent)
        
        // Improved audio-text synchronization
        if (isPlaying && allPages.length > 1) {
          // Calculate which page should be showing based on audio progress
          const progress = audio.currentTime / audio.duration
          let targetPage = 0
          
          if (progress <= 0.1) {
            // Stay on cover for first 10%
            targetPage = 0
          } else if (progress <= 0.8) {
            // Story pages during main 70% of audio
            const storyProgress = (progress - 0.1) / 0.7
            targetPage = Math.floor(storyProgress * storyPages.length) + 1
            targetPage = Math.min(targetPage, storyPages.length)
          } else {
            // Special pages for last 20%
            const specialProgress = (progress - 0.8) / 0.2
            const specialPageIndex = Math.floor(specialProgress * 3) // 3 special pages
            targetPage = storyPages.length + 1 + specialPageIndex
            targetPage = Math.min(targetPage, allPages.length - 1)
          }
          
          if (targetPage !== currentPage && targetPage >= 0 && targetPage < allPages.length) {
            console.log(`📖 Audio sync: ${(progress * 100).toFixed(1)}% -> Page ${targetPage + 1}/${allPages.length}`)
            setCurrentPage(targetPage)
          }
        }
      }
    }

    const handleLoadedData = () => {
      console.log(`🔊 Audio loaded, duration: ${audio.duration}s`)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentPage(allPages.length - 1)
      console.log('🔊 Audio ended, moved to final page')
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isPlaying, currentPage, allPages.length, storyPages.length])

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

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const renderPage = (page: typeof allPages[0]) => {
    switch (page.type) {
      case 'cover':
        return (
          <div className="page-cover">
            {page.content.coverImage && (
              <img src={page.content.coverImage} alt="Book Cover" className="cover-image" />
            )}
            <div className="cover-overlay">
              <h1 className="cover-title">{page.content.title}</h1>
              <p className="cover-subtitle">An Islamic Story</p>
              {audioUrl && (
                <button className="play-button" onClick={toggleAudio}>
                  {isPlaying ? '⏸️ Pause' : '▶️ Play Story'}
                </button>
              )}
            </div>
          </div>
        )
      
      case 'story':
        // Get illustration for this story page (adjust index since page 1 = index 0 in illustrations array)
        const illustrationIndex = page.content.pageNumber - 1
        const hasValidIllustration = sceneIllustrations && 
                                   illustrationIndex < sceneIllustrations.length && 
                                   sceneIllustrations[illustrationIndex] && 
                                   sceneIllustrations[illustrationIndex].trim().length > 10
        
        const illustrationUrl = hasValidIllustration ? sceneIllustrations[illustrationIndex] : null
        
        console.log(`📸 Page ${page.content.pageNumber} (index ${illustrationIndex}): Illustration ${hasValidIllustration ? 'available' : 'missing'}`)
        console.log(`🔍 Total illustrations: ${sceneIllustrations?.length || 0}, Current URL: ${illustrationUrl?.substring(0, 50) || 'none'}...`)
        
        return (
          <div className="page-story">
            <div className="story-illustration">
              {hasValidIllustration ? (
                <img 
                  src={illustrationUrl} 
                  alt={`Story illustration for page ${page.content.pageNumber}`}
                  onLoad={() => console.log(`✅ Image loaded successfully for page ${page.content.pageNumber}`)}
                  onError={(e) => {
                    console.error(`❌ Image failed to load for page ${page.content.pageNumber}:`, illustrationUrl)
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="illustration-placeholder">
                  <div className="placeholder-icon">🎨</div>
                  <p>Illustration {illustrationIndex + 1} loading...</p>
                  <p className="text-xs opacity-60">Total: {sceneIllustrations?.length || 0} images</p>
                </div>
              )}
            </div>
            <div className="story-text">
              <p>{page.content.text}</p>
            </div>
            <div className="page-footer">
              <span>Page {page.content.pageNumber} of {page.content.totalPages}</span>
              <span>•</span>
              <span>{hasValidIllustration ? `✓ Image ${illustrationIndex + 1}` : `Generating ${illustrationIndex + 1}/${sceneIllustrations?.length || '?'}...`}</span>
            </div>
          </div>
        )
      
      case 'moral':
        return (
          <div className="page-special moral-page">
            <div className="special-icon">💫</div>
            <h2>Moral of the Story</h2>
            <div className="special-content">
              <p>{page.content.moralLesson}</p>
            </div>
          </div>
        )
      
      case 'quran':
        return (
          <div className="page-special quran-page">
            <div className="special-icon">📖</div>
            <h2>Qur'anic Wisdom</h2>
            <div className="special-content">
              <p className="quran-ref">{page.content.quranReference}</p>
              {page.content.arabicVerse && (
                <p className="arabic-verse">{page.content.arabicVerse}</p>
              )}
              <p className="verse-translation">{page.content.verseTranslation}</p>
            </div>
          </div>
        )
      
      case 'parents':
        return (
          <div className="page-special parents-page">
            <div className="special-icon">👨‍👩‍👧‍👦</div>
            <h2>For Parents</h2>
            <div className="special-content">
              <p>{page.content.parentNotes}</p>
            </div>
          </div>
        )
      
      case 'end':
        return (
          <div className="page-special end-page">
            <div className="special-icon">🌟</div>
            <h2>The End</h2>
            <p className="end-message">Thank you for reading</p>
            <p className="end-title">{page.content.title}</p>
            <button className="replay-button" onClick={() => setCurrentPage(0)}>
              📖 Read Again
            </button>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="storybook-container">
      {/* Close Button */}
      <button className="close-button" onClick={onClose}>
        ✕
      </button>

      {/* Progress Bar */}
      {audioUrl && (
        <div className="audio-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Book */}
      <div className={`book ${bookState}`}>
        {bookState === 'closed' && (
          <div className="book-cover">
            <div className="book-spine"></div>
            <div className="book-front">
              <h2>{title}</h2>
            </div>
          </div>
        )}

        {bookState === 'open' && currentPage >= 0 && (
          <div className="book-pages">
            {/* Left Page */}
            <div className="page left-page">
              {currentPage > 0 && currentPage % 2 === 1 && renderPage(allPages[currentPage - 1])}
            </div>

            {/* Right Page */}
            <div className="page right-page">
              {currentPage < allPages.length && renderPage(allPages[currentPage])}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {bookState === 'open' && (
        <div className="navigation-controls">
          <button 
            className="nav-button prev" 
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            ← Previous
          </button>

          {audioUrl && (
            <button className="nav-button audio" onClick={toggleAudio}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          )}

          <button 
            className="nav-button next" 
            onClick={nextPage}
            disabled={currentPage === allPages.length - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* Hidden Audio Element */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </div>
  )
}

export default ProfessionalStoryBook