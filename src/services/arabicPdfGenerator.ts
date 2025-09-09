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
        background: linear-gradient(135deg, #faf0e6 0%, #f5f5dc 50%, #faf0e6 100%);
        padding: 0;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      ">
        <!-- Islamic Border Frame -->
        <div style="
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 4px solid #d4af37;
          border-radius: 20px;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        "></div>
        
        <!-- Inner decorative border -->
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid rgba(212, 175, 55, 0.5);
          border-radius: 15px;
        "></div>

        <!-- Corner Islamic decorations -->
        <div style="position: absolute; top: 15px; left: 15px; font-size: 30px; color: #d4af37; opacity: 0.7;">❋</div>
        <div style="position: absolute; top: 15px; right: 15px; font-size: 30px; color: #d4af37; opacity: 0.7;">❋</div>
        <div style="position: absolute; bottom: 15px; left: 15px; font-size: 30px; color: #d4af37; opacity: 0.7;">❋</div>
        <div style="position: absolute; bottom: 15px; right: 15px; font-size: 30px; color: #d4af37; opacity: 0.7;">❋</div>

        <!-- Islamic pattern top -->
        <div style="
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          color: #d4af37;
          opacity: 0.4;
          font-size: 16px;
        ">◆ ◈ ◆ ◈ ◆ ◈ ◆ ◈ ◆</div>

        <!-- Content Container -->
        <div style="padding: 60px 40px 40px 40px; position: relative; z-index: 10;">

          <!-- Bismillah Header -->
          <div style="
            background: linear-gradient(135deg, #d4af37, #b8860b, #d4af37);
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 15px;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            position: relative;
          ">
            <div style="
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 8px;
              font-family: 'Times New Roman', serif;
            ">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div style="font-size: 24px; font-weight: bold;">BarakahTool - Islamic Dua</div>
            <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">Authentic Islamic Supplications</div>
          </div>

          <!-- Request Section with Islamic design -->
          <div style="
            background: linear-gradient(135deg, #fff8dc, #fffacd);
            border: 3px solid #d4af37;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          ">
            <!-- Decorative corners -->
            <div style="position: absolute; top: -2px; left: -2px; width: 20px; height: 20px; border-top: 4px solid #b8860b; border-left: 4px solid #b8860b;"></div>
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 4px solid #b8860b; border-right: 4px solid #b8860b;"></div>
            
            <h3 style="color: #b8860b; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
              🤲 Your Spiritual Request 🤲
            </h3>
            <p style="margin: 0; font-size: 15px; text-align: center; line-height: 1.6; color: #2c1810;">${duaData.situation}</p>
          </div>

          <!-- Arabic Text - Main Feature -->
          <div style="
            background: radial-gradient(circle at center, #ffffff, #f8f8ff);
            border: 4px solid #228b22;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 25px;
            text-align: center;
            position: relative;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          ">
            <!-- Islamic geometric pattern background -->
            <div style="
              position: absolute;
              top: 10px;
              right: 10px;
              color: rgba(34, 139, 34, 0.1);
              font-size: 40px;
            ">☪</div>
            <div style="
              position: absolute;
              bottom: 10px;
              left: 10px;
              color: rgba(34, 139, 34, 0.1);
              font-size: 40px;
            ">☪</div>
            
            <h3 style="
              color: #228b22; 
              margin: 0 0 20px 0; 
              font-size: 18px;
              background: linear-gradient(90deg, #228b22, #32cd32, #228b22);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">🕌 Sacred Arabic Supplication 🕌</h3>
            
            <div style="
              font-size: 32px;
              line-height: 2;
              direction: rtl;
              font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', 'Times New Roman', serif;
              color: #191970;
              font-weight: bold;
              background: linear-gradient(135deg, #191970, #4169e1, #191970);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
              padding: 15px;
              border: 2px dashed rgba(34, 139, 34, 0.3);
              border-radius: 10px;
              background-color: rgba(255,255,255,0.8);
            ">
              ${duaData.arabicText || 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رِزْقِكَ الْحَلَالِ'}
            </div>
          </div>

          <!-- Pronunciation with Islamic pattern -->
          ${duaData.transliteration ? `
          <div style="
            background: linear-gradient(135deg, #f0fff0, #e8f5e8);
            border: 2px solid #90ee90;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 25px;
            position: relative;
          ">
            <div style="
              position: absolute;
              top: 5px;
              left: 50%;
              transform: translateX(-50%);
              color: rgba(144, 238, 144, 0.6);
              font-size: 12px;
            ">◆ ◇ ◆ ◇ ◆</div>
            
            <h3 style="color: #228b22; margin: 0 0 12px 0; font-size: 15px; text-align: center;">
              📢 Pronunciation Guide 📢
            </h3>
            <p style="
              margin: 0; 
              font-style: italic; 
              font-size: 14px; 
              text-align: center;
              line-height: 1.5;
              color: #2d5a2d;
            ">${duaData.transliteration}</p>
          </div>
          ` : ''}

          <!-- Translation with Islamic calligraphy style -->
          <div style="
            background: linear-gradient(135deg, #fff0f5, #fdeef4);
            border: 3px solid #db7093;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            text-align: center;
            position: relative;
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          ">
            <!-- Decorative Islamic elements -->
            <div style="
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: #db7093;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            ">✨ Translation ✨</div>
            
            <h3 style="
              color: #db7093; 
              margin: 15px 0 20px 0; 
              font-size: 18px;
              font-weight: bold;
            ">💖 ${duaData.language} Translation 💖</h3>
            
            <div style="
              font-size: 18px; 
              font-style: italic;
              line-height: 1.8;
              color: #2c1810;
              border-left: 4px solid #db7093;
              border-right: 4px solid #db7093;
              padding: 15px 20px;
              background: rgba(255,255,255,0.7);
              border-radius: 8px;
            ">"${duaData.translation}"</div>
          </div>

          <!-- Islamic guidance section -->
          <div style="
            background: linear-gradient(135deg, #e6f3ff, #f0f8ff);
            border: 2px solid #87ceeb;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
          ">
            <h3 style="color: #4682b4; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
              ✨ Spiritual Guidance ✨
            </h3>
            <div style="color: #2c5aa0; font-size: 12px; line-height: 1.6;">
              🌙 <strong>Best Times:</strong> Last third of night, between Maghrib & Isha<br>
              🤲 <strong>Recitation:</strong> With complete sincerity and focus<br>
              🔢 <strong>Repetition:</strong> 3, 7, or 33 times for increased blessing<br>
              🧘 <strong>Etiquette:</strong> Face Qibla and maintain wudu if possible
            </div>
          </div>

        </div>

        <!-- Islamic pattern bottom -->
        <div style="
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          color: #d4af37;
          opacity: 0.4;
          font-size: 16px;
        ">◈ ◆ ◈ ◆ ◈ ◆ ◈ ◆ ◈</div>

        <!-- Footer with Islamic design -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 40px;
          right: 40px;
          background: linear-gradient(135deg, #d4af37, #b8860b, #d4af37);
          color: white;
          padding: 18px;
          text-align: center;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        ">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
            🌟 BarakahTool - Islamic Digital Platform 🌟
          </div>
          <div style="font-size: 12px; opacity: 0.9;">
            May Allah accept your supplication and grant you success • ${new Date().toLocaleDateString()}
          </div>
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