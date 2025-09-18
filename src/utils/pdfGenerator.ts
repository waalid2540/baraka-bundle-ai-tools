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
  coverImage?: string
  sceneIllustrations?: string[]
}

export const generateBookStylePDF = async (result: StoryResult) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const innerWidth = pageWidth - 2 * margin
  const innerHeight = pageHeight - 2 * margin

  // Helper function to add image from URL
  const addImageFromUrl = async (url: string, x: number, y: number, width: number, height: number) => {
    try {
      // Convert URL to base64 if it's a data URL or fetch if it's http
      let imageData = url

      if (url.startsWith('http')) {
        // For HTTP URLs, we need to convert to base64
        const response = await fetch(url)
        const blob = await response.blob()
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }

      if (imageData.includes('base64')) {
        pdf.addImage(imageData, 'PNG', x, y, width, height)
        return true
      }
    } catch (error) {
      console.error('Error adding image to PDF:', error)
      return false
    }
    return false
  }

  // Split story into pages (matching the frontend display)
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

  // ============= PAGE 1: COVER PAGE =============
  if (result.coverImage) {
    // Full page cover image
    await addImageFromUrl(result.coverImage, 0, 0, pageWidth, pageHeight)

    // Add semi-transparent overlay for title
    pdf.setFillColor(255, 255, 255)
    pdf.setGState(pdf.GState({ opacity: 0.9 }))
    pdf.roundedRect(margin, pageHeight - 80, innerWidth, 60, 5, 5, 'F')
    pdf.setGState(pdf.GState({ opacity: 1 }))

    // Title on cover
    pdf.setTextColor(0, 102, 51)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    const titleLines = pdf.splitTextToSize(result.title, innerWidth - 20)
    let yPos = pageHeight - 50
    titleLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPos, { align: 'center' })
      yPos += 10
    })
  } else {
    // Fallback decorative cover if no image
    // Islamic Pattern Background
    pdf.setDrawColor(0, 102, 51)
    pdf.setLineWidth(3)
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'D')

    // Title
    pdf.setTextColor(0, 102, 51)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(28)
    const titleLines = pdf.splitTextToSize(result.title, innerWidth - 20)
    let yPos = 100
    titleLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPos, { align: 'center' })
      yPos += 14
    })
  }

  // ============= PAGE 2: TITLE & INFO PAGE =============
  pdf.addPage()

  // Bismillah
  pdf.setTextColor(0, 102, 51)
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(14)
  pdf.text('In the Name of Allah, the Most Gracious, the Most Merciful', pageWidth / 2, 40, { align: 'center' })

  // Title
  pdf.setTextColor(204, 153, 0) // Gold
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(26)
  const titleLines2 = pdf.splitTextToSize(result.title, innerWidth - 20)
  let titleY = 80
  titleLines2.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, titleY, { align: 'center' })
    titleY += 12
  })

  // Story info box
  titleY += 20
  pdf.setFillColor(245, 248, 250)
  pdf.setDrawColor(0, 102, 51)
  pdf.roundedRect(margin + 20, titleY, innerWidth - 40, 50, 5, 5, 'FD')

  pdf.setTextColor(0, 102, 51)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  pdf.text(`Age Group: ${result.ageGroup} years`, pageWidth / 2, titleY + 15, { align: 'center' })
  pdf.text(`Theme: ${result.theme}`, pageWidth / 2, titleY + 28, { align: 'center' })
  pdf.text(`${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth / 2, titleY + 41, { align: 'center' })

  // ============= STORY PAGES WITH ILLUSTRATIONS =============
  const storyPages = splitStoryIntoPages(result.story, 80)

  for (let i = 0; i < storyPages.length; i++) {
    pdf.addPage()

    // Check if we have an illustration for this page
    const hasIllustration = result.sceneIllustrations && result.sceneIllustrations[i]

    if (hasIllustration) {
      // Page with illustration at top
      const illustrationHeight = 100

      // Add illustration
      await addImageFromUrl(result.sceneIllustrations![i], margin, margin, innerWidth, illustrationHeight)

      // Add decorative border around image
      pdf.setDrawColor(204, 153, 0)
      pdf.setLineWidth(2)
      pdf.rect(margin, margin, innerWidth, illustrationHeight, 'D')

      // Story text below illustration
      const textStartY = margin + illustrationHeight + 15
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.setLineHeightFactor(1.6)

      const pageLines = pdf.splitTextToSize(storyPages[i], innerWidth)
      let textY = textStartY

      pageLines.forEach((line: string) => {
        if (textY < pageHeight - margin) {
          pdf.text(line, margin, textY)
          textY += 7
        }
      })

      // Page number
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(10)
      pdf.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    } else {
      // Text-only page with decorative header
      pdf.setFillColor(0, 102, 51)
      pdf.rect(0, 0, pageWidth, 20, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.text(`Chapter ${i + 1}`, pageWidth / 2, 13, { align: 'center' })

      // Story text
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(12)
      pdf.setLineHeightFactor(1.8)

      const pageLines = pdf.splitTextToSize(storyPages[i], innerWidth)
      let textY = 40

      pageLines.forEach((line: string) => {
        if (textY < pageHeight - margin) {
          pdf.text(line, margin, textY)
          textY += 8
        }
      })

      // Page number
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(10)
      pdf.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }
  }

  // ============= MORAL LESSON PAGE =============
  pdf.addPage()

  // Decorative header
  pdf.setFillColor(204, 153, 0)
  pdf.rect(0, 0, pageWidth, 30, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Moral of the Story', pageWidth / 2, 19, { align: 'center' })

  // Moral lesson with decorative box
  pdf.setFillColor(255, 248, 220)
  pdf.setDrawColor(204, 153, 0)
  pdf.roundedRect(margin, 50, innerWidth, 80, 5, 5, 'FD')

  pdf.setTextColor(0, 0, 0)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(13)
  const moralLines = pdf.splitTextToSize(result.moralLesson, innerWidth - 20)
  let moralY = 70
  moralLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, moralY, { align: 'center' })
    moralY += 8
  })

  // ============= QURANIC GUIDANCE PAGE =============
  pdf.addPage()

  // Header
  pdf.setFillColor(0, 102, 51)
  pdf.rect(0, 0, pageWidth, 30, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Quranic Guidance', pageWidth / 2, 19, { align: 'center' })

  let quranY = 50

  // Quran Reference
  if (result.quranReference) {
    pdf.setTextColor(0, 102, 51)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text(result.quranReference, pageWidth / 2, quranY, { align: 'center' })
    quranY += 20
  }

  // Arabic verse box
  if (result.arabicVerse) {
    pdf.setFillColor(245, 248, 250)
    pdf.setDrawColor(0, 102, 51)
    pdf.roundedRect(margin + 10, quranY, innerWidth - 20, 40, 5, 5, 'FD')

    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(11)
    pdf.setTextColor(100, 100, 100)
    pdf.text('[Arabic verse best viewed in digital format]', pageWidth / 2, quranY + 22, { align: 'center' })
    quranY += 55
  }

  // Translation
  if (result.verseTranslation) {
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(12)
    const transLines = pdf.splitTextToSize(`"${result.verseTranslation}"`, innerWidth - 30)
    transLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, quranY, { align: 'center' })
      quranY += 8
    })
  }

  // ============= PARENT NOTES PAGE =============
  if (result.parentNotes) {
    pdf.addPage()

    // Header
    pdf.setFillColor(139, 69, 19)
    pdf.rect(0, 0, pageWidth, 30, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(18)
    pdf.text('Guide for Parents', pageWidth / 2, 19, { align: 'center' })

    // Parent notes
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setLineHeightFactor(1.6)

    const parentLines = pdf.splitTextToSize(result.parentNotes, innerWidth)
    let parentY = 50
    parentLines.forEach((line: string) => {
      if (parentY < pageHeight - margin) {
        pdf.text(line, margin, parentY)
        parentY += 7
      }
    })
  }

  // ============= BACK COVER =============
  pdf.addPage()

  // Decorative frame
  pdf.setDrawColor(0, 102, 51)
  pdf.setLineWidth(3)
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'D')

  // Thank you message
  pdf.setTextColor(0, 102, 51)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.text('Thank You for Reading!', pageWidth / 2, 100, { align: 'center' })

  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(14)
  pdf.text('May Allah bless you with wisdom and guidance', pageWidth / 2, 120, { align: 'center' })

  // BarakahTool branding
  pdf.setTextColor(204, 153, 0)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text('Created with BarakahTool', pageWidth / 2, pageHeight - 60, { align: 'center' })

  pdf.setTextColor(100, 100, 100)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text('Premium Islamic Digital Platform', pageWidth / 2, pageHeight - 50, { align: 'center' })

  return pdf
}