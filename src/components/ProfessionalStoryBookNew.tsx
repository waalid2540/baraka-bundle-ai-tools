import React, { useState, useEffect, useRef, useCallback } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

  // Create pages with SIMPLE, PREDICTABLE audio timing
  const createPages = useCallback((): PageData[] => {
    const storyPages = splitStoryIntoPages(story)
    const pages: PageData[] = []
    
    // SIMPLE APPROACH: Equal time for all pages except cover gets extra time
    const totalPages = storyPages.length + 4 // story + cover + moral + quran + parents
    const timePerPage = audioDuration / totalPages
    const coverTime = timePerPage * 1.5 // Cover gets 50% more time
    
    console.log(`🎵 Audio timing: ${audioDuration}s total, ${totalPages} pages, ${timePerPage.toFixed(1)}s per page`)

    // Cover page
    pages.push({
      type: 'cover',
      content: { title, coverImage },
      audioStartTime: 0,
      audioEndTime: coverTime
    })

    // Story pages - equal time distribution
    let currentTime = coverTime
    storyPages.forEach((pageText, index) => {
      const startTime = currentTime
      const endTime = currentTime + timePerPage
      
      pages.push({
        type: 'story',
        content: { text: pageText },
        illustration: sceneIllustrations[index % sceneIllustrations.length],
        audioStartTime: startTime,
        audioEndTime: endTime
      })
      
      currentTime = endTime
      console.log(`📖 Story page ${index + 1}: ${startTime.toFixed(1)}s - ${endTime.toFixed(1)}s`)
    })

    // Special pages
    pages.push({
      type: 'moral',
      content: { moralLesson },
      audioStartTime: currentTime,
      audioEndTime: currentTime + timePerPage
    })
    currentTime += timePerPage

    pages.push({
      type: 'quran',
      content: { quranReference, arabicVerse, verseTranslation },
      audioStartTime: currentTime,
      audioEndTime: currentTime + timePerPage
    })
    currentTime += timePerPage

    pages.push({
      type: 'parents',
      content: { parentNotes },
      audioStartTime: currentTime,
      audioEndTime: audioDuration
    })

    console.log(`🎵 Created ${pages.length} pages with simple timing`)
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

  const exportToPDF = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Cover page
    pdf.setFontSize(24)
    pdf.setTextColor(0, 120, 0)
    
    // Split long titles into multiple lines
    const titleLines = pdf.splitTextToSize(title, pageWidth - 40)
    let yPosition = 40
    
    titleLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10
    })
    
    pdf.setFontSize(16)
    pdf.setTextColor(0, 0, 0)
    pdf.text('An Islamic Story for Children', pageWidth / 2, yPosition + 20, { align: 'center' })
    
    // Story pages
    const storyPages = splitStoryIntoPages(story)
    storyPages.forEach((pageText, index) => {
      pdf.addPage()
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      
      // Page header
      pdf.setFontSize(12)
      pdf.text(`Page ${index + 1}`, pageWidth / 2, 20, { align: 'center' })
      
      // Story text
      pdf.setFontSize(14)
      const textLines = pdf.splitTextToSize(pageText, pageWidth - 40)
      let textY = 40
      
      textLines.forEach((line: string) => {
        if (textY > pageHeight - 40) {
          pdf.addPage()
          textY = 40
        }
        pdf.text(line, 20, textY)
        textY += 8
      })
    })
    
    // Moral lesson page
    pdf.addPage()
    pdf.setFontSize(20)
    pdf.setTextColor(180, 100, 0)
    pdf.text('Moral Lesson', pageWidth / 2, 40, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    const moralLines = pdf.splitTextToSize(moralLesson, pageWidth - 40)
    let moralY = 60
    moralLines.forEach((line: string) => {
      pdf.text(line, 20, moralY)
      moralY += 8
    })
    
    // Quran page
    pdf.addPage()
    pdf.setFontSize(20)
    pdf.setTextColor(0, 120, 0)
    pdf.text('From the Holy Quran', pageWidth / 2, 40, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setTextColor(80, 80, 80)
    pdf.text(quranReference, pageWidth / 2, 60, { align: 'center' })
    
    if (arabicVerse) {
      pdf.setFontSize(16)
      pdf.setTextColor(0, 0, 0)
      const arabicLines = pdf.splitTextToSize(arabicVerse, pageWidth - 40)
      let arabicY = 80
      arabicLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, arabicY, { align: 'center' })
        arabicY += 10
      })
    }
    
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    const translationLines = pdf.splitTextToSize(`"${verseTranslation}"`, pageWidth - 40)
    let translationY = arabicVerse ? 120 : 80
    translationLines.forEach((line: string) => {
      pdf.text(line, 20, translationY)
      translationY += 8
    })
    
    // Parents page
    pdf.addPage()
    pdf.setFontSize(20)
    pdf.setTextColor(120, 0, 120)
    pdf.text('For Parents', pageWidth / 2, 40, { align: 'center' })
    
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    const parentLines = pdf.splitTextToSize(parentNotes, pageWidth - 40)
    let parentY = 60
    parentLines.forEach((line: string) => {
      pdf.text(line, 20, parentY)
      parentY += 8
    })
    
    // Save the PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_story.pdf`
    pdf.save(fileName)
    
    console.log(`📄 PDF exported: ${fileName}`)
  }

  const renderPage = (page: PageData) => {
    switch (page.type) {
      case 'cover':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            {page.content.coverImage && (
              <div className="w-80 h-56 mb-8 rounded-xl overflow-hidden shadow-xl">
                <img 
                  src={page.content.coverImage} 
                  alt="Story Cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-5xl font-bold text-emerald-800 mb-6 font-serif leading-tight">
              {page.content.title}
            </h1>
            <div className="text-emerald-600 text-2xl font-medium mb-4">
              ✨ An Islamic Story for Children ✨
            </div>
            <div className="text-emerald-700 text-lg">
              📖 Tap play to begin the narrated story
            </div>
          </div>
        )

      case 'story':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 h-full">
            {page.illustration && (
              <div className="w-full max-w-2xl mx-auto h-80 mb-8 rounded-xl overflow-hidden shadow-lg">
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
            <div className="text-gray-800 text-2xl leading-relaxed text-center font-serif max-w-4xl mx-auto">
              {page.content.text}
            </div>
          </div>
        )

      case 'moral':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            <div className="text-8xl mb-8">🌟</div>
            <h2 className="text-4xl font-bold text-amber-800 mb-8 font-serif">
              Moral Lesson
            </h2>
            <div className="text-gray-800 text-2xl leading-relaxed text-center max-w-3xl font-serif">
              {page.content.moralLesson}
            </div>
          </div>
        )

      case 'quran':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            <div className="text-8xl mb-8">📖</div>
            <h2 className="text-4xl font-bold text-emerald-800 mb-8 font-serif">
              From the Holy Quran
            </h2>
            <div className="text-emerald-700 text-xl font-medium mb-8">
              {page.content.quranReference}
            </div>
            {page.content.arabicVerse && (
              <div className="text-4xl text-center mb-8 text-emerald-900 font-arabic leading-loose">
                {page.content.arabicVerse}
              </div>
            )}
            <div className="text-gray-700 text-2xl leading-relaxed text-center max-w-3xl font-serif italic">
              "{page.content.verseTranslation}"
            </div>
          </div>
        )

      case 'parents':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            <div className="text-8xl mb-8">👨‍👩‍👧‍👦</div>
            <h2 className="text-4xl font-bold text-purple-800 mb-8 font-serif">
              For Parents
            </h2>
            <div className="text-gray-800 text-xl leading-relaxed text-center max-w-3xl font-serif">
              {page.content.parentNotes}
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            <div className="text-gray-500">Page not found</div>
          </div>
        )
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-white to-gray-50 z-50">
      {/* Header with Controls */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b shadow-sm z-20 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800 font-serif">{title}</h1>
            <div className="text-sm text-gray-500">Page {currentPage + 1} of {allPages.length}</div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              ← Previous
            </button>

            {audioUrl && (
              <button
                onClick={togglePlayPause}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                {isPlaying ? '⏸️ Pause Audio' : '▶️ Play Audio'}
              </button>
            )}

            <button
              onClick={exportToPDF}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg text-sm"
            >
              📄 Export PDF
            </button>

            <button
              onClick={nextPage}
              disabled={currentPage === allPages.length - 1}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              Next →
            </button>

            <button
              onClick={onClose}
              className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 transition-all duration-300 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Audio Progress Bar */}
        {audioUrl && (
          <div className="mt-3 max-w-6xl mx-auto">
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${audioProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="pt-24 pb-8 px-8 h-full overflow-auto">
        <div className="max-w-4xl mx-auto h-full">
          {allPages[currentPage] && renderPage(allPages[currentPage])}
        </div>
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