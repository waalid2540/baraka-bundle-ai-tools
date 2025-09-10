// Working PDF Generator with Arabic Support
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

class PdfGenerator {
  // Generate PDF using HTML to Canvas approach (works with Arabic!)
  async generatePdfFromHtml(duaData: DuaData, theme: string = 'light'): Promise<Blob> {
    // Create a hidden div with the dua content
    const div = document.createElement('div')
    div.style.position = 'fixed'
    div.style.top = '-9999px'
    div.style.width = '794px' // A4 width in pixels at 96 DPI
    div.style.padding = '40px'
    div.style.fontFamily = 'Arial, sans-serif'
    div.style.backgroundColor = this.getThemeColors(theme).background
    div.style.color = this.getThemeColors(theme).text
    
    // Build the HTML content
    div.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: ${this.getThemeColors(theme).accent}; font-size: 32px; margin-bottom: 10px;">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </h1>
        <div style="width: 100px; height: 2px; background: ${this.getThemeColors(theme).accent}; margin: 20px auto;"></div>
        
        <h2 style="font-size: 28px; margin: 20px 0;">الدعاء</h2>
        
        <div style="background: ${this.getThemeColors(theme).cardBg}; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <p style="font-size: 24px; line-height: 1.8; direction: rtl; font-family: 'Traditional Arabic', 'Arial Unicode MS', Arial;">
            ${duaData.arabicText}
          </p>
        </div>
        
        ${duaData.transliteration ? `
          <div style="margin: 20px 0;">
            <h3 style="color: ${this.getThemeColors(theme).secondary}; font-size: 18px;">Pronunciation</h3>
            <p style="font-style: italic; font-size: 16px; line-height: 1.6; color: ${this.getThemeColors(theme).secondary};">
              ${duaData.transliteration}
            </p>
          </div>
        ` : ''}
        
        <div style="margin: 20px 0;">
          <h3 style="color: ${this.getThemeColors(theme).secondary}; font-size: 18px;">Translation</h3>
          <p style="font-size: 16px; line-height: 1.6; font-style: italic;">
            "${duaData.translation}"
          </p>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid ${this.getThemeColors(theme).border};">
          <p style="font-size: 12px; color: ${this.getThemeColors(theme).secondary};">
            Source: Inspired by Islamic teachings
          </p>
          <p style="font-size: 14px; color: ${this.getThemeColors(theme).accent}; margin-top: 10px;">
            BarakahTool - Islamic Digital Platform
          </p>
          <p style="font-size: 12px; color: ${this.getThemeColors(theme).secondary};">
            ${new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    `
    
    document.body.appendChild(div)
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(div, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: this.getThemeColors(theme).background
      })
      
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      
      // Clean up
      document.body.removeChild(div)
      
      return pdf.output('blob')
    } catch (error) {
      document.body.removeChild(div)
      throw error
    }
  }

  // Simple text-based PDF (fallback)
  generateSimplePdf(duaData: DuaData, theme: string = 'light'): Blob {
    const pdf = new jsPDF()
    const colors = this.getThemeColors(theme)
    
    // Add content
    pdf.setFontSize(20)
    pdf.text('Bismillah', 105, 20, { align: 'center' })
    
    pdf.setFontSize(24)
    pdf.text('Dua / Prayer', 105, 40, { align: 'center' })
    
    // Add situation
    pdf.setFontSize(12)
    pdf.text(`Request: ${duaData.situation}`, 105, 55, { align: 'center' })
    
    // Arabic text (will show as boxes but at least it works)
    pdf.setFontSize(14)
    pdf.text('Arabic Text:', 20, 75)
    const arabicLines = pdf.splitTextToSize(duaData.arabicText, 170)
    pdf.text(arabicLines, 20, 85)
    
    // Transliteration
    let yPos = 85 + (arabicLines.length * 7) + 10
    if (duaData.transliteration) {
      pdf.setFontSize(14)
      pdf.text('Pronunciation:', 20, yPos)
      yPos += 10
      pdf.setFontSize(12)
      const translitLines = pdf.splitTextToSize(duaData.transliteration, 170)
      pdf.text(translitLines, 20, yPos)
      yPos += translitLines.length * 7 + 10
    }
    
    // Translation
    pdf.setFontSize(14)
    pdf.text('Translation:', 20, yPos)
    yPos += 10
    pdf.setFontSize(12)
    const transLines = pdf.splitTextToSize(duaData.translation, 170)
    pdf.text(transLines, 20, yPos)
    
    // Footer
    pdf.setFontSize(10)
    pdf.text('BarakahTool - Islamic Digital Platform', 105, 280, { align: 'center' })
    pdf.text(new Date().toLocaleDateString(), 105, 285, { align: 'center' })
    
    return pdf.output('blob')
  }

  // Download the PDF
  downloadPdf(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Get theme colors
  private getThemeColors(theme: string) {
    const themes: any = {
      light: {
        background: '#FFFFFF',
        text: '#1F2937',
        secondary: '#6B7280',
        accent: '#8B5CF6',
        cardBg: '#F9FAFB',
        border: '#E5E7EB'
      },
      night: {
        background: '#111827',
        text: '#F9FAFB',
        secondary: '#D1D5DB',
        accent: '#A78BFA',
        cardBg: '#1F2937',
        border: '#374151'
      },
      gold: {
        background: '#FFFBEB',
        text: '#78350F',
        secondary: '#92400E',
        accent: '#F59E0B',
        cardBg: '#FEF3C7',
        border: '#FDE68A'
      }
    }
    return themes[theme] || themes.light
  }
}

export const pdfGenerator = new PdfGenerator()
export default pdfGenerator