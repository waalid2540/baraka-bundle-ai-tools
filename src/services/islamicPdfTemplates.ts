// Beautiful Islamic PDF Templates with Powerful Designs
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface DuaData {
  arabicText: string
  transliteration?: string
  translation: string
  situation: string
  language: string
}

interface Template {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    cardBg: string
    border: string
    text: string
  }
  fonts: {
    arabic: string
    english: string
    decorative: string
  }
  decorations: {
    pattern: string
    border: string
    ornament: string
  }
}

const templates: Record<string, Template> = {
  light: {
    name: 'Elegant Light',
    colors: {
      primary: '#2D3748',
      secondary: '#4A5568',
      accent: '#D69E2E',
      background: '#FFFFFF',
      cardBg: '#F7FAFC',
      border: '#E2E8F0',
      text: '#1A202C'
    },
    fonts: {
      arabic: '"Amiri", "Scheherazade New", "Traditional Arabic", "Arabic Typesetting", serif',
      english: '"Crimson Text", "Times New Roman", serif',
      decorative: '"Playfair Display", "Times New Roman", serif'
    },
    decorations: {
      pattern: 'geometric-light',
      border: 'ornate-gold',
      ornament: 'crescent-star'
    }
  },
  night: {
    name: 'Majestic Night',
    colors: {
      primary: '#F7FAFC',
      secondary: '#E2E8F0',
      accent: '#F6E05E',
      background: '#1A202C',
      cardBg: '#2D3748',
      border: '#4A5568',
      text: '#F7FAFC'
    },
    fonts: {
      arabic: '"Amiri", "Scheherazade New", "Traditional Arabic", "Arabic Typesetting", serif',
      english: '"Crimson Text", "Times New Roman", serif',
      decorative: '"Playfair Display", "Times New Roman", serif'
    },
    decorations: {
      pattern: 'stars-crescents',
      border: 'golden-vines',
      ornament: 'moon-stars'
    }
  },
  gold: {
    name: 'Royal Gold',
    colors: {
      primary: '#744210',
      secondary: '#975A16',
      accent: '#D69E2E',
      background: '#FFFAF0',
      cardBg: '#FFF8DC',
      border: '#D69E2E',
      text: '#744210'
    },
    fonts: {
      arabic: '"Amiri", "Scheherazade New", "Traditional Arabic", "Arabic Typesetting", serif',
      english: '"Crimson Text", "Times New Roman", serif',
      decorative: '"Playfair Display", "Times New Roman", serif'
    },
    decorations: {
      pattern: 'luxury-geometric',
      border: 'royal-ornate',
      ornament: 'crown-crescent'
    }
  }
}

class IslamicPdfTemplates {
  async generateIslamicPdf(duaData: DuaData, templateName: string = 'light'): Promise<Blob> {
    const template = templates[templateName] || templates.light
    
    // Create beautiful Islamic HTML template
    const htmlContent = this.createIslamicTemplate(duaData, template)
    
    // Convert to PDF using html2canvas
    return this.htmlToPdf(htmlContent, template)
  }

  private createIslamicTemplate(duaData: DuaData, template: Template): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${template.fonts.arabic};
            background: linear-gradient(135deg, ${template.colors.background} 0%, ${template.colors.cardBg} 100%);
            color: ${template.colors.text};
            padding: 40px;
            width: 794px;
            min-height: 1123px;
            position: relative;
            overflow: hidden;
          }

          /* Islamic Geometric Background Pattern */
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: ${this.getPatternBackground(template.decorations.pattern, template.colors.accent)};
            opacity: 0.05;
            z-index: -1;
          }

          .container {
            max-width: 100%;
            margin: 0 auto;
            background: ${template.colors.background};
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
            position: relative;
          }

          /* Ornate Header */
          .header {
            background: linear-gradient(45deg, ${template.colors.accent}, ${template.colors.primary});
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: ${this.getIslamicPattern(template.colors.background, 0.1)};
            transform: rotate(45deg);
          }

          .bismillah {
            font-family: ${template.fonts.arabic};
            font-size: 28px;
            font-weight: 700;
            color: ${template.colors.background};
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 2;
          }

          .app-title {
            font-family: ${template.fonts.decorative};
            font-size: 24px;
            color: ${template.colors.background};
            font-weight: 600;
            position: relative;
            z-index: 2;
          }

          /* Decorative Divider */
          .divider {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px 0;
          }

          .divider-line {
            height: 2px;
            width: 100px;
            background: linear-gradient(to right, transparent, ${template.colors.accent}, transparent);
          }

          .divider-ornament {
            width: 40px;
            height: 40px;
            margin: 0 20px;
            background: ${template.colors.accent};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: ${template.colors.background};
          }

          /* Main Content */
          .content {
            padding: 50px;
            text-align: center;
          }

          .dua-title {
            font-family: ${template.fonts.arabic};
            font-size: 36px;
            font-weight: 700;
            color: ${template.colors.primary};
            margin-bottom: 30px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }

          /* Arabic Text Container */
          .arabic-container {
            background: ${template.colors.cardBg};
            border: 3px solid ${template.colors.border};
            border-radius: 20px;
            padding: 40px;
            margin: 30px 0;
            position: relative;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
          }

          .arabic-container::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 2px solid ${template.colors.accent};
            border-radius: 15px;
            opacity: 0.3;
          }

          .arabic-text {
            font-family: ${template.fonts.arabic};
            font-size: 32px;
            line-height: 2.2;
            font-weight: 600;
            color: ${template.colors.primary};
            direction: rtl;
            text-align: center;
            position: relative;
            z-index: 2;
            letter-spacing: 2px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
          }

          /* Transliteration */
          .transliteration-section {
            margin: 30px 0;
          }

          .section-title {
            font-family: ${template.fonts.decorative};
            font-size: 18px;
            font-weight: 700;
            color: ${template.colors.secondary};
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .transliteration-text {
            font-family: ${template.fonts.english};
            font-size: 16px;
            font-style: italic;
            color: ${template.colors.secondary};
            line-height: 1.8;
            background: ${template.colors.cardBg};
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid ${template.colors.accent};
          }

          /* Translation */
          .translation-section {
            margin: 30px 0;
          }

          .translation-text {
            font-family: ${template.fonts.english};
            font-size: 18px;
            font-style: italic;
            color: ${template.colors.primary};
            line-height: 1.8;
            background: ${template.colors.cardBg};
            padding: 25px;
            border-radius: 15px;
            border: 2px solid ${template.colors.border};
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            position: relative;
          }

          .translation-text::before {
            content: '"';
            font-size: 60px;
            color: ${template.colors.accent};
            position: absolute;
            top: -10px;
            left: 20px;
            font-family: serif;
            opacity: 0.7;
          }

          .translation-text::after {
            content: '"';
            font-size: 60px;
            color: ${template.colors.accent};
            position: absolute;
            bottom: -40px;
            right: 20px;
            font-family: serif;
            opacity: 0.7;
          }

          /* Footer */
          .footer {
            background: linear-gradient(45deg, ${template.colors.primary}, ${template.colors.secondary});
            padding: 30px;
            text-align: center;
            color: ${template.colors.background};
          }

          .source-text {
            font-family: ${template.fonts.english};
            font-size: 14px;
            font-style: italic;
            margin-bottom: 10px;
            opacity: 0.9;
          }

          .app-branding {
            font-family: ${template.fonts.decorative};
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 5px;
            color: ${template.colors.accent};
          }

          .date-text {
            font-family: ${template.fonts.english};
            font-size: 12px;
            opacity: 0.8;
          }

          /* Decorative Elements */
          .corner-ornament {
            position: absolute;
            width: 80px;
            height: 80px;
            background: ${this.getCornerOrnament(template.colors.accent)};
            background-size: contain;
            background-repeat: no-repeat;
          }

          .corner-ornament.top-left {
            top: 20px;
            left: 20px;
          }

          .corner-ornament.top-right {
            top: 20px;
            right: 20px;
            transform: rotate(90deg);
          }

          .corner-ornament.bottom-left {
            bottom: 20px;
            left: 20px;
            transform: rotate(-90deg);
          }

          .corner-ornament.bottom-right {
            bottom: 20px;
            right: 20px;
            transform: rotate(180deg);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Corner Ornaments -->
          <div class="corner-ornament top-left"></div>
          <div class="corner-ornament top-right"></div>
          <div class="corner-ornament bottom-left"></div>
          <div class="corner-ornament bottom-right"></div>
          
          <!-- Header -->
          <div class="header">
            <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div class="app-title">BarakahTool - Islamic Digital Platform</div>
          </div>

          <!-- Main Content -->
          <div class="content">
            <div class="dua-title">الدعاء المبارك</div>
            
            <div class="divider">
              <div class="divider-line"></div>
              <div class="divider-ornament">☪</div>
              <div class="divider-line"></div>
            </div>

            <!-- Arabic Text -->
            <div class="arabic-container">
              <div class="arabic-text">${duaData.arabicText}</div>
            </div>

            ${duaData.transliteration ? `
            <!-- Transliteration -->
            <div class="transliteration-section">
              <div class="section-title">Pronunciation Guide</div>
              <div class="transliteration-text">${duaData.transliteration}</div>
            </div>
            ` : ''}

            <!-- Translation -->
            <div class="translation-section">
              <div class="section-title">Translation</div>
              <div class="translation-text">${duaData.translation}</div>
            </div>

            <div class="divider">
              <div class="divider-line"></div>
              <div class="divider-ornament">✧</div>
              <div class="divider-line"></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="source-text">Source: Inspired by authentic Islamic teachings</div>
            <div class="app-branding">BarakahTool</div>
            <div class="date-text">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private async htmlToPdf(htmlContent: string, template: Template): Promise<Blob> {
    // Create a temporary iframe to render the HTML
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.width = '794px'
    iframe.style.height = '1123px'
    iframe.style.border = 'none'
    
    document.body.appendChild(iframe)
    
    try {
      const iframeDoc = iframe.contentDocument!
      iframeDoc.write(htmlContent)
      iframeDoc.close()
      
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Convert to canvas
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: template.colors.background,
        width: 794,
        height: 1123
      })
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, '', 'FAST')
      
      document.body.removeChild(iframe)
      return pdf.output('blob')
    } catch (error) {
      document.body.removeChild(iframe)
      throw error
    }
  }

  private getPatternBackground(pattern: string, color: string): string {
    // Return CSS for Islamic geometric patterns
    const patterns = {
      'geometric-light': `radial-gradient(circle at 25% 25%, ${color}22 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${color}22 2px, transparent 2px)`,
      'stars-crescents': `radial-gradient(circle at 50% 50%, ${color}33 1px, transparent 1px)`,
      'luxury-geometric': `linear-gradient(45deg, ${color}11 25%, transparent 25%), linear-gradient(-45deg, ${color}11 25%, transparent 25%)`
    }
    return patterns[pattern] || patterns['geometric-light']
  }

  private getIslamicPattern(color: string, opacity: number): string {
    return `radial-gradient(circle at 20% 50%, ${color}${Math.round(opacity * 100).toString().padStart(2, '0')} 2px, transparent 2px),
            radial-gradient(circle at 80% 50%, ${color}${Math.round(opacity * 100).toString().padStart(2, '0')} 2px, transparent 2px)`
  }

  private getCornerOrnament(color: string): string {
    // Return CSS for decorative corner elements
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M50 10 L60 30 L80 30 L66 44 L72 66 L50 54 L28 66 L34 44 L20 30 L40 30 Z" 
              fill="${color}" opacity="0.6"/>
        <circle cx="50" cy="50" r="8" fill="${color}" opacity="0.8"/>
      </svg>
    `)}`
  }

  downloadPdf(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const islamicPdfTemplates = new IslamicPdfTemplates()
export default islamicPdfTemplates