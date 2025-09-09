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
    // Professional content creator themes with perfect readability
    const creatorThemes = [
      {
        primary: '#2E86AB', secondary: '#A23B72', accent: '#F18F01', bg: '#FFFFFF',
        textColor: '#1A1A1A', headerBg: 'linear-gradient(135deg, #2E86AB, #A23B72)',
        pattern: '✨', symbol: '🕌', name: 'Ocean Professional'
      },
      {
        primary: '#6A994E', secondary: '#A7C957', accent: '#F2E8CF', bg: '#FFFFFF',
        textColor: '#2D3748', headerBg: 'linear-gradient(135deg, #6A994E, #A7C957)',
        pattern: '🌿', symbol: '⭐', name: 'Nature Elite'
      },
      {
        primary: '#7209B7', secondary: '#A663CC', accent: '#F8BBD9', bg: '#FFFFFF',
        textColor: '#2D1B69', headerBg: 'linear-gradient(135deg, #7209B7, #A663CC)',
        pattern: '💜', symbol: '🌙', name: 'Royal Purple'
      },
      {
        primary: '#D4A574', secondary: '#E76F51', accent: '#F4A261', bg: '#FFFFFF',
        textColor: '#8B4513', headerBg: 'linear-gradient(135deg, #D4A574, #E76F51)',
        pattern: '🌟', symbol: '🕌', name: 'Desert Gold'
      },
      {
        primary: '#2A9D8F', secondary: '#264653', accent: '#E9C46A', bg: '#FFFFFF',
        textColor: '#1A5490', headerBg: 'linear-gradient(135deg, #2A9D8F, #264653)',
        pattern: '🌊', symbol: '💎', name: 'Teal Professional'
      },
      {
        primary: '#E63946', secondary: '#F77F00', accent: '#FCBF49', bg: '#FFFFFF',
        textColor: '#8B0000', headerBg: 'linear-gradient(135deg, #E63946, #F77F00)',
        pattern: '🔥', symbol: '⚡', name: 'Sunset Bold'
      },
      {
        primary: '#4361EE', secondary: '#7209B7', accent: '#F72585', bg: '#FFFFFF',
        textColor: '#1A202C', headerBg: 'linear-gradient(135deg, #4361EE, #7209B7)',
        pattern: '💫', symbol: '🌟', name: 'Electric Blue'
      },
      {
        primary: '#2F4858', secondary: '#33658A', accent: '#86BBD8', bg: '#FFFFFF',
        textColor: '#1A365D', headerBg: 'linear-gradient(135deg, #2F4858, #33658A)',
        pattern: '⚡', symbol: '🏛️', name: 'Corporate Steel'
      }
    ]
    
    return creatorThemes[Math.floor(Math.random() * creatorThemes.length)]
  }

  private getIslamicTheme(duaType: string): any {
    const themes = {
      'rizq': {
        primary: '#2E7D32', secondary: '#4CAF50', accent: '#C8E6C9', bg: '#FFFFFF',
        textColor: '#1B5E20', headerBg: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
        pattern: '💰', symbol: '🌾', name: 'Rizq Professional'
      },
      'protection': {
        primary: '#1565C0', secondary: '#2196F3', accent: '#BBDEFB', bg: '#FFFFFF',
        textColor: '#0D47A1', headerBg: 'linear-gradient(135deg, #1565C0, #2196F3)',
        pattern: '🛡️', symbol: '⚔️', name: 'Protection Elite'
      },
      'guidance': {
        primary: '#F57C00', secondary: '#FF9800', accent: '#FFE0B2', bg: '#FFFFFF',
        textColor: '#E65100', headerBg: 'linear-gradient(135deg, #F57C00, #FF9800)',
        pattern: '⭐', symbol: '🧭', name: 'Guidance Premium'
      },
      'forgiveness': {
        primary: '#7B1FA2', secondary: '#9C27B0', accent: '#E1BEE7', bg: '#FFFFFF',
        textColor: '#4A148C', headerBg: 'linear-gradient(135deg, #7B1FA2, #9C27B0)',
        pattern: '✨', symbol: '🤲', name: 'Forgiveness Royal'
      },
      'health': {
        primary: '#C62828', secondary: '#F44336', accent: '#FFCDD2', bg: '#FFFFFF',
        textColor: '#B71C1C', headerBg: 'linear-gradient(135deg, #C62828, #F44336)',
        pattern: '❤️', symbol: '🏥', name: 'Health Professional'
      },
      'knowledge': {
        primary: '#455A64', secondary: '#607D8B', accent: '#CFD8DC', bg: '#FFFFFF',
        textColor: '#263238', headerBg: 'linear-gradient(135deg, #455A64, #607D8B)',
        pattern: '📚', symbol: '🎓', name: 'Knowledge Executive'
      },
      'travel': {
        primary: '#FF6F00', secondary: '#FF8F00', accent: '#FFE0B2', bg: '#FFFFFF',
        textColor: '#E65100', headerBg: 'linear-gradient(135deg, #FF6F00, #FF8F00)',
        pattern: '🗺️', symbol: '✈️', name: 'Travel Premium'
      },
      'sleep': {
        primary: '#3F51B5', secondary: '#5C6BC0', accent: '#C5CAE9', bg: '#FFFFFF',
        textColor: '#283593', headerBg: 'linear-gradient(135deg, #3F51B5, #5C6BC0)',
        pattern: '🌙', symbol: '💤', name: 'Sleep Professional'
      },
      'default': {
        primary: '#8D6E63', secondary: '#A1887F', accent: '#D7CCC8', bg: '#FFFFFF',
        textColor: '#5D4037', headerBg: 'linear-gradient(135deg, #8D6E63, #A1887F)',
        pattern: '🕌', symbol: '☪️', name: 'Classic Professional'
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
            background: ${theme.headerBg || `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`};
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
            
            <h3 style="color: ${theme.textColor || '#2c1810'}; margin: 0 0 15px 0; font-size: 16px; text-align: center; font-weight: 700;">
              ${theme.pattern} Your Spiritual Request ${theme.symbol}
            </h3>
            <p style="margin: 0; font-size: 15px; text-align: center; line-height: 1.6; color: ${theme.textColor || '#2c1810'}; font-weight: 600;">${duaData.situation}</p>
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
              color: #ffffff; 
              margin: 0 0 20px 0; 
              font-size: 18px;
              font-weight: 700;
              text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
            ">${theme.pattern} Sacred Arabic Supplication ${theme.symbol}</h3>
            
            <div style="
              font-size: 32px;
              line-height: 2;
              direction: rtl;
              font-family: 'Amiri', 'Traditional Arabic', 'Arabic Typesetting', 'Times New Roman', serif;
              color: ${theme.textColor || '#1a1a1a'};
              font-weight: 800;
              text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
              padding: 20px;
              border: 3px solid ${theme.primary};
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
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
            
            <h3 style="color: ${theme.textColor || '#2c1810'}; margin: 0 0 12px 0; font-size: 15px; text-align: center; font-weight: 700;">
              ${theme.pattern} Pronunciation Guide ${theme.symbol}
            </h3>
            <p style="
              margin: 0; 
              font-style: italic; 
              font-size: 14px; 
              text-align: center;
              line-height: 1.5;
              color: ${theme.textColor || '#1a5490'};
              font-weight: 600;
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
              color: ${theme.textColor || '#2c1810'}; 
              margin: 15px 0 20px 0; 
              font-size: 18px;
              font-weight: 700;
            ">${theme.pattern} ${duaData.language} Translation ${theme.symbol}</h3>
            
            <div style="
              font-size: 18px; 
              font-style: italic;
              line-height: 1.8;
              color: ${theme.textColor || '#1a4d72'};
              font-weight: 600;
              border-left: 4px solid ${theme.primary};
              border-right: 4px solid ${theme.primary};
              padding: 20px;
              background: rgba(255,255,255,0.95);
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
            <h3 style="color: ${theme.textColor || '#2c1810'}; margin: 0 0 15px 0; font-size: 16px; text-align: center; font-weight: 700;">
              ${theme.pattern} Spiritual Guidance ${theme.symbol}
            </h3>
            <div style="color: ${theme.textColor || '#1a4d72'}; font-size: 12px; line-height: 1.6; font-weight: 600;">
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
          background: ${theme.headerBg || `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`};
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