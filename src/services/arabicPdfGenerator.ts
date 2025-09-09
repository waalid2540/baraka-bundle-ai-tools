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
  
  private getRandomContentCreatorTheme(): any {
    // Random themes for content creators who want variety
    const creatorThemes = [
      {
        primary: '#FF6B6B', secondary: '#FF8E53', accent: '#FFE66D', bg: '#FFF3E0',
        pattern: '🌺', symbol: '🌸', name: 'Coral Blossom'
      },
      {
        primary: '#4ECDC4', secondary: '#44A08D', accent: '#C7F0DB', bg: '#E8F6F3',
        pattern: '🌊', symbol: '💎', name: 'Ocean Mint'
      },
      {
        primary: '#9B59B6', secondary: '#8E44AD', accent: '#F4D7F4', bg: '#F8F4FF',
        pattern: '🔮', symbol: '⚡', name: 'Mystic Purple'
      },
      {
        primary: '#E67E22', secondary: '#D35400', accent: '#FDEAA7', bg: '#FDF4E3',
        pattern: '🦋', symbol: '🌅', name: 'Sunset Orange'
      },
      {
        primary: '#1ABC9C', secondary: '#16A085', accent: '#A8E6CF', bg: '#E8F8F5',
        pattern: '🌿', symbol: '🍃', name: 'Emerald Garden'
      },
      {
        primary: '#3498DB', secondary: '#2980B9', accent: '#AED6F1', bg: '#EBF5FB',
        pattern: '☁️', symbol: '⭐', name: 'Sky Blue'
      },
      {
        primary: '#E91E63', secondary: '#C2185B', accent: '#F8BBD9', bg: '#FCE4EC',
        pattern: '💖', symbol: '🌹', name: 'Rose Pink'
      },
      {
        primary: '#795548', secondary: '#5D4037', accent: '#D7CCC8', bg: '#F3E5F5',
        pattern: '🏔️', symbol: '🌳', name: 'Earth Brown'
      }
    ]
    
    return creatorThemes[Math.floor(Math.random() * creatorThemes.length)]
  }

  private getIslamicTheme(duaType: string): any {
    const themes = {
      'rizq': {
        primary: '#228B22', secondary: '#32CD32', accent: '#90EE90', bg: '#F0FFF0',
        pattern: '💰', symbol: '🌾', name: 'Rizq Green'
      },
      'protection': {
        primary: '#4169E1', secondary: '#1E90FF', accent: '#87CEEB', bg: '#F0F8FF',
        pattern: '🛡️', symbol: '⚔️', name: 'Protection Blue'
      },
      'guidance': {
        primary: '#FFD700', secondary: '#FFA500', accent: '#FFFFE0', bg: '#FFFACD',
        pattern: '⭐', symbol: '🧭', name: 'Guidance Gold'
      },
      'forgiveness': {
        primary: '#8A2BE2', secondary: '#9370DB', accent: '#DDA0DD', bg: '#F8F8FF',
        pattern: '✨', symbol: '🤲', name: 'Forgiveness Purple'
      },
      'health': {
        primary: '#DC143C', secondary: '#FF6347', accent: '#FFB6C1', bg: '#FFF0F5',
        pattern: '❤️', symbol: '🏥', name: 'Health Crimson'
      },
      'knowledge': {
        primary: '#2F4F4F', secondary: '#708090', accent: '#D3D3D3', bg: '#F5F5F5',
        pattern: '📚', symbol: '🎓', name: 'Knowledge Gray'
      },
      'travel': {
        primary: '#FF8C00', secondary: '#FF4500', accent: '#FFDAB9', bg: '#FFF8DC',
        pattern: '🗺️', symbol: '✈️', name: 'Travel Orange'
      },
      'sleep': {
        primary: '#483D8B', secondary: '#6A5ACD', accent: '#E6E6FA', bg: '#F0F8FF',
        pattern: '🌙', symbol: '💤', name: 'Sleep Indigo'
      },
      'default': {
        primary: '#d4af37', secondary: '#b8860b', accent: '#fff8dc', bg: '#faf0e6',
        pattern: '🕌', symbol: '☪️', name: 'Classic Islamic'
      }
    }
    
    // Extract theme from dua situation/name - improved detection
    const duaName = duaType.toLowerCase()
    
    // Check for theme keywords in the dua name/situation
    if (duaName.includes('rizq') || duaName.includes('sustenance') || duaName.includes('provision')) {
      return themes.rizq
    }
    if (duaName.includes('protection') || duaName.includes('protect') || duaName.includes('safety')) {
      return themes.protection
    }
    if (duaName.includes('guidance') || duaName.includes('guide') || duaName.includes('right path')) {
      return themes.guidance
    }
    if (duaName.includes('forgiveness') || duaName.includes('forgive') || duaName.includes('repent')) {
      return themes.forgiveness
    }
    if (duaName.includes('health') || duaName.includes('healing') || duaName.includes('cure')) {
      return themes.health
    }
    if (duaName.includes('knowledge') || duaName.includes('learn') || duaName.includes('wisdom')) {
      return themes.knowledge
    }
    if (duaName.includes('travel') || duaName.includes('journey') || duaName.includes('trip')) {
      return themes.travel
    }
    if (duaName.includes('sleep') || duaName.includes('night') || duaName.includes('rest')) {
      return themes.sleep
    }
    
    // For content creators - 30% chance of random theme for variety
    if (Math.random() < 0.3) {
      return this.getRandomContentCreatorTheme()
    }
    
    return themes.default
  }

  private createArabicHtml(duaData: DuaData, forceRandomTheme = false): string {
    let theme
    
    if (forceRandomTheme) {
      theme = this.getRandomContentCreatorTheme()
      console.log('🎲 Using RANDOM theme for content creator:', theme.name)
    } else {
      theme = this.getIslamicTheme(duaData.situation)
      console.log('🎨 Using themed PDF:', theme.name, 'for situation:', duaData.situation)
    }
    
    return `
      <div style="
        width: 794px; 
        height: 1123px; 
        font-family: Arial, sans-serif;
        direction: ltr;
        background: linear-gradient(135deg, ${theme.bg} 0%, ${theme.accent} 50%, ${theme.bg} 100%);
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
          border: 4px solid ${theme.primary};
          border-radius: 20px;
          box-shadow: 0 0 20px ${theme.primary}33;
        "></div>
        
        <!-- Inner decorative border -->
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid ${theme.primary}80;
          border-radius: 15px;
        "></div>

        <!-- Corner Islamic decorations -->
        <div style="position: absolute; top: 15px; left: 15px; font-size: 30px; color: ${theme.primary}; opacity: 0.7;">${theme.pattern}</div>
        <div style="position: absolute; top: 15px; right: 15px; font-size: 30px; color: ${theme.primary}; opacity: 0.7;">${theme.symbol}</div>
        <div style="position: absolute; bottom: 15px; left: 15px; font-size: 30px; color: ${theme.primary}; opacity: 0.7;">${theme.symbol}</div>
        <div style="position: absolute; bottom: 15px; right: 15px; font-size: 30px; color: ${theme.primary}; opacity: 0.7;">${theme.pattern}</div>

        <!-- Islamic pattern top -->
        <div style="
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          color: ${theme.primary};
          opacity: 0.4;
          font-size: 16px;
        ">${theme.pattern} ${theme.symbol} ${theme.pattern} ${theme.symbol} ${theme.pattern}</div>

        <!-- Content Container -->
        <div style="padding: 60px 40px 40px 40px; position: relative; z-index: 10;">

          <!-- Bismillah Header -->
          <div style="
            background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.primary});
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
            background: linear-gradient(135deg, ${theme.accent}, ${theme.bg});
            border: 3px solid ${theme.primary};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          ">
            <!-- Decorative corners -->
            <div style="position: absolute; top: -2px; left: -2px; width: 20px; height: 20px; border-top: 4px solid ${theme.secondary}; border-left: 4px solid ${theme.secondary};"></div>
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 4px solid ${theme.secondary}; border-right: 4px solid ${theme.secondary};"></div>
            
            <h3 style="color: ${theme.secondary}; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
              ${theme.pattern} Your Spiritual Request ${theme.symbol}
            </h3>
            <p style="margin: 0; font-size: 15px; text-align: center; line-height: 1.6; color: #2c1810;">${duaData.situation}</p>
          </div>

          <!-- Arabic Text - Main Feature -->
          <div style="
            background: radial-gradient(circle at center, #ffffff, ${theme.accent}66);
            border: 4px solid ${theme.primary};
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
              color: ${theme.primary}20;
              font-size: 40px;
            ">${theme.symbol}</div>
            <div style="
              position: absolute;
              bottom: 10px;
              left: 10px;
              color: ${theme.primary}20;
              font-size: 40px;
            ">${theme.pattern}</div>
            
            <h3 style="
              color: ${theme.primary}; 
              margin: 0 0 20px 0; 
              font-size: 18px;
              background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.primary});
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            ">${theme.pattern} Sacred Arabic Supplication ${theme.symbol}</h3>
            
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
              border: 2px dashed ${theme.primary}50;
              border-radius: 10px;
              background-color: rgba(255,255,255,0.8);
            ">
              ${duaData.arabicText || 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رِزْقِكَ الْحَلَالِ'}
            </div>
          </div>

          <!-- Pronunciation with Islamic pattern -->
          ${duaData.transliteration ? `
          <div style="
            background: linear-gradient(135deg, ${theme.bg}CC, ${theme.accent}99);
            border: 2px solid ${theme.secondary};
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
              color: ${theme.primary}99;
              font-size: 12px;
            ">${theme.pattern} ${theme.symbol} ${theme.pattern}</div>
            
            <h3 style="color: ${theme.primary}; margin: 0 0 12px 0; font-size: 15px; text-align: center;">
              ${theme.pattern} Pronunciation Guide ${theme.symbol}
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
            background: linear-gradient(135deg, ${theme.bg}, ${theme.accent});
            border: 3px solid ${theme.secondary};
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
              background: ${theme.primary};
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            ">${theme.pattern} Translation ${theme.symbol}</div>
            
            <h3 style="
              color: ${theme.secondary}; 
              margin: 15px 0 20px 0; 
              font-size: 18px;
              font-weight: bold;
            ">${theme.pattern} ${duaData.language} Translation ${theme.symbol}</h3>
            
            <div style="
              font-size: 18px; 
              font-style: italic;
              line-height: 1.8;
              color: #2c1810;
              border-left: 4px solid ${theme.secondary};
              border-right: 4px solid ${theme.secondary};
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
          color: ${theme.primary};
          opacity: 0.4;
          font-size: 16px;
        ">${theme.symbol} ${theme.pattern} ${theme.symbol} ${theme.pattern} ${theme.symbol}</div>

        <!-- Footer with Islamic design -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 40px;
          right: 40px;
          background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.primary});
          color: white;
          padding: 18px;
          text-align: center;
          border-radius: 15px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        ">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
            ${theme.pattern} BarakahTool - Islamic Digital Platform ${theme.symbol}
          </div>
          <div style="font-size: 12px; opacity: 0.9;">
            May Allah accept your supplication and grant you success • ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    `
  }

  async generatePdf(duaData: DuaData, forceRandomTheme = false): Promise<Blob> {
    console.log('🕌 Generating Arabic PDF with real Arabic text...')
    
    try {
      // Create temporary container with Arabic text
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.top = '-9999px'
      container.style.left = '-9999px'
      container.innerHTML = this.createArabicHtml(duaData, forceRandomTheme)
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

  // Convenience method for content creators who want random themes
  async generateRandomPdf(duaData: DuaData): Promise<Blob> {
    return this.generatePdf(duaData, true)
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