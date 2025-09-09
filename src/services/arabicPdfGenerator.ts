// Arabic PDF Generator - Real Arabic Text Solution
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
}

class ArabicPdfGenerator {
  
  private createArabicHtml(duaData: DuaData): string {
    return `
      <div style="
        width: 794px; 
        height: 1123px; 
        font-family: Arial, sans-serif;
        direction: ltr;
        background: white;
        padding: 20px;
        box-sizing: border-box;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #d4af37, #f4a460);
          color: white;
          padding: 20px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        ">
          BarakahTool - Islamic Dua
        </div>

        <!-- Request -->
        <div style="
          background: #fff8dc;
          border: 2px solid #d4af37;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <h3 style="color: #b8860b; margin: 0 0 10px 0;">🤲 Your Request:</h3>
          <p style="margin: 0; font-size: 14px;">${duaData.situation}</p>
        </div>

        <!-- Arabic Text -->
        <div style="
          background: white;
          border: 3px solid #228b22;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        ">
          <h3 style="color: #228b22; margin: 0 0 15px 0;">🕌 Arabic Text:</h3>
          <div style="
            font-size: 28px;
            line-height: 1.8;
            direction: rtl;
            font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', serif;
            color: #191970;
            font-weight: bold;
          ">
            ${duaData.arabicText || 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا'}
          </div>
        </div>

        <!-- Pronunciation -->
        ${duaData.transliteration ? `
        <div style="
          background: #f0fff0;
          border: 1px solid #90ee90;
          padding: 15px;
          margin-bottom: 20px;
        ">
          <h3 style="color: #228b22; margin: 0 0 10px 0;">📢 Pronunciation:</h3>
          <p style="margin: 0; font-style: italic; font-size: 14px;">${duaData.transliteration}</p>
        </div>
        ` : ''}

        <!-- Translation -->
        <div style="
          background: #fff0f5;
          border: 2px solid #db7093;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        ">
          <h3 style="color: #db7093; margin: 0 0 15px 0;">💖 ${duaData.language} Translation:</h3>
          <p style="
            margin: 0; 
            font-size: 16px; 
            font-style: italic;
            line-height: 1.5;
          ">"${duaData.translation}"</p>
        </div>

        <!-- Footer -->
        <div style="
          background: linear-gradient(135deg, #d4af37, #f4a460);
          color: white;
          padding: 15px;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
        ">
          🌟 BarakahTool - Islamic Digital Platform 🌟
        </div>
      </div>
    `
  }

  async generatePdf(duaData: DuaData): Promise<Blob> {
    console.log('🕌 Generating Arabic PDF with real Arabic text...')
    
    try {
      // Create temporary container with Arabic text
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '-9999px'
      container.style.left = '-9999px'
      container.innerHTML = this.createArabicHtml(duaData)
      document.body.appendChild(container)

      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Convert to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
        backgroundColor: '#ffffff'
      })

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      })

      // Add the canvas as image
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123)

      // Clean up
      document.body.removeChild(container)

      console.log('✅ Arabic PDF generated successfully!')
      return pdf.output('blob')

    } catch (error) {
      console.error('❌ Arabic PDF generation failed:', error)
      
      // Simple fallback
      const pdf = new jsPDF()
      pdf.setFontSize(20)
      pdf.text('BarakahTool - Islamic Dua', 105, 30, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.text('Your Request:', 20, 60)
      const sitLines = pdf.splitTextToSize(duaData.situation, 170)
      let y = 70
      sitLines.forEach((line: string) => {
        pdf.text(line, 20, y)
        y += 8
      })
      
      pdf.text('Arabic Pronunciation:', 20, y + 20)
      const pronunciation = duaData.transliteration || 'Allahumma barik lana'
      const pronLines = pdf.splitTextToSize(pronunciation, 170)
      y += 30
      pronLines.forEach((line: string) => {
        pdf.text(line, 20, y)
        y += 8
      })
      
      pdf.text('Translation:', 20, y + 20)
      const transLines = pdf.splitTextToSize(duaData.translation, 170)
      y += 30
      transLines.forEach((line: string) => {
        pdf.text(line, 20, y)
        y += 8
      })
      
      return pdf.output('blob')
    }
  }

  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const arabicPdfGenerator = new ArabicPdfGenerator()
export default arabicPdfGenerator