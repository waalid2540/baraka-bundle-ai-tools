// BarakahTool Islamic PDF Generator with Arabic Support
// Beautiful Islamic Templates with Proper Arabic Rendering

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFTheme, getTheme } from './pdfTemplates'

// Islamic Template Designs
export const ISLAMIC_TEMPLATES = {
  mosque: {
    name: 'Masjid Design',
    headerPattern: '🕌',
    borderStyle: 'geometric',
    cornerDesign: 'minaret',
    backgroundColor: '#f0fdf4',
    primaryColor: '#15803d',
    accentColor: '#fbbf24'
  },
  quran: {
    name: 'Quran Page Style',
    headerPattern: '📖',
    borderStyle: 'ornate',
    cornerDesign: 'arabesque',
    backgroundColor: '#fffbeb',
    primaryColor: '#a16207',
    accentColor: '#059669'
  },
  calligraphy: {
    name: 'Arabic Calligraphy',
    headerPattern: '✍️',
    borderStyle: 'flowing',
    cornerDesign: 'tughra',
    backgroundColor: '#fdf4ff',
    primaryColor: '#9333ea',
    accentColor: '#dc2626'
  },
  mihrab: {
    name: 'Mihrab Architecture',
    headerPattern: '🏛️',
    borderStyle: 'arched',
    cornerDesign: 'geometric-star',
    backgroundColor: '#f0f9ff',
    primaryColor: '#1e40af',
    accentColor: '#f59e0b'
  }
}

class IslamicPdfGenerator {
  
  // Generate HTML content for PDF
  private generateHtmlContent(duaData: {
    name: string
    situation: string
    arabicText: string
    transliteration?: string
    translation: string
    language: string
    theme?: string
  }): string {
    const theme = getTheme(duaData.theme || 'royalGold')
    
    return `
      <!DOCTYPE html>
      <html dir="ltr">
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: linear-gradient(135deg, ${theme.background} 0%, #ffffff 100%);
            font-family: 'Arial', sans-serif;
            position: relative;
          }
          
          /* Islamic Border Design */
          .islamic-border {
            position: absolute;
            top: 5mm;
            left: 5mm;
            right: 5mm;
            bottom: 5mm;
            border: 4px solid ${theme.primary};
            border-radius: 8px;
            pointer-events: none;
          }
          
          .islamic-border::before {
            content: '';
            position: absolute;
            top: 3mm;
            left: 3mm;
            right: 3mm;
            bottom: 3mm;
            border: 2px solid ${theme.secondary};
            border-radius: 6px;
          }
          
          .islamic-border::after {
            content: '';
            position: absolute;
            top: 6mm;
            left: 6mm;
            right: 6mm;
            bottom: 6mm;
            border: 1px solid ${theme.accent};
            border-radius: 4px;
          }
          
          /* Corner Decorations */
          .corner-decoration {
            position: absolute;
            width: 20mm;
            height: 20mm;
            background: ${theme.primary};
            clip-path: polygon(0 0, 100% 0, 0 100%);
          }
          
          .corner-tl { top: 5mm; left: 5mm; }
          .corner-tr { 
            top: 5mm; 
            right: 5mm; 
            transform: rotate(90deg);
          }
          .corner-bl { 
            bottom: 5mm; 
            left: 5mm; 
            transform: rotate(-90deg);
          }
          .corner-br { 
            bottom: 5mm; 
            right: 5mm; 
            transform: rotate(180deg);
          }
          
          /* Header */
          .header {
            text-align: center;
            margin-bottom: 20mm;
            padding-top: 10mm;
          }
          
          .header h1 {
            color: ${theme.primary};
            font-size: 28pt;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            font-weight: bold;
          }
          
          .header .subtitle {
            color: ${theme.accent};
            font-size: 14pt;
            font-style: italic;
          }
          
          .header .bismillah {
            font-family: 'Amiri', 'Scheherazade New', serif;
            font-size: 20pt;
            color: ${theme.primary};
            margin: 15px 0;
            font-weight: bold;
          }
          
          /* Divider */
          .divider {
            text-align: center;
            margin: 15mm 0;
            color: ${theme.accent};
            font-size: 18pt;
            position: relative;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 35%;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${theme.accent}, transparent);
          }
          
          .divider::before { left: 0; }
          .divider::after { right: 0; }
          
          /* Content Sections */
          .section {
            margin-bottom: 15mm;
            padding: 10mm;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .section-title {
            color: ${theme.primary};
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8mm;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          /* Arabic Text */
          .arabic-text {
            font-family: 'Amiri', 'Scheherazade New', 'Arabic Typesetting', serif;
            font-size: 24pt;
            line-height: 2;
            text-align: right;
            direction: rtl;
            color: ${theme.text};
            padding: 10mm;
            background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
            border-radius: 6px;
            margin: 10mm 0;
            font-weight: 400;
          }
          
          /* Transliteration */
          .transliteration {
            font-size: 14pt;
            font-style: italic;
            color: ${theme.secondary};
            text-align: center;
            line-height: 1.8;
            padding: 8mm;
            background: rgba(255,255,255,0.5);
            border-left: 4px solid ${theme.accent};
            margin: 10mm 0;
          }
          
          /* Translation */
          .translation {
            font-size: 13pt;
            color: ${theme.text};
            text-align: center;
            line-height: 1.6;
            padding: 10mm;
            font-style: italic;
          }
          
          .translation::before,
          .translation::after {
            content: '"';
            font-size: 20pt;
            color: ${theme.accent};
          }
          
          /* Guidance Section */
          .guidance {
            background: linear-gradient(135deg, ${theme.background}, rgba(255,255,255,0.8));
            padding: 8mm;
            border-radius: 6px;
            margin-top: 10mm;
          }
          
          .guidance-title {
            color: ${theme.accent};
            font-size: 12pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5mm;
          }
          
          .guidance-list {
            list-style: none;
            padding: 0;
          }
          
          .guidance-list li {
            color: ${theme.text};
            font-size: 10pt;
            text-align: center;
            margin: 3mm 0;
            position: relative;
            padding-left: 15mm;
          }
          
          .guidance-list li::before {
            content: '◆';
            position: absolute;
            left: 5mm;
            color: ${theme.accent};
          }
          
          /* Footer */
          .footer {
            position: absolute;
            bottom: 15mm;
            left: 15mm;
            right: 15mm;
            text-align: center;
            padding-top: 5mm;
            border-top: 2px solid ${theme.primary};
          }
          
          .footer-text {
            color: ${theme.accent};
            font-size: 10pt;
            margin-bottom: 3mm;
          }
          
          .footer-brand {
            color: ${theme.primary};
            font-size: 12pt;
            font-weight: bold;
          }
          
          /* Islamic Patterns */
          .pattern-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.03;
            background-image: 
              repeating-linear-gradient(45deg, ${theme.primary} 0, ${theme.primary} 1px, transparent 1px, transparent 15px),
              repeating-linear-gradient(-45deg, ${theme.primary} 0, ${theme.primary} 1px, transparent 1px, transparent 15px);
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="islamic-border"></div>
        <div class="corner-decoration corner-tl"></div>
        <div class="corner-decoration corner-tr"></div>
        <div class="corner-decoration corner-bl"></div>
        <div class="corner-decoration corner-br"></div>
        <div class="pattern-overlay"></div>
        
        <div class="header">
          <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <h1>Sacred Islamic Du'ā</h1>
          <div class="subtitle">A blessed Islamic supplication</div>
        </div>
        
        <div class="section">
          <div class="section-title">Your Sacred Request</div>
          <div style="text-align: center; color: ${theme.text}; font-size: 11pt; line-height: 1.5;">
            ${duaData.situation}
          </div>
        </div>
        
        <div class="divider">◆ ◆ ◆</div>
        
        <div class="section">
          <div class="section-title">Arabic Supplication</div>
          <div class="arabic-text">
            ${duaData.arabicText || 'اللَّهُمَّ بَارِكْ لَنَا'}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Pronunciation Guide</div>
          <div class="transliteration">
            ${duaData.transliteration || 'Pronunciation guide will be provided based on the Arabic text above'}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">${duaData.language} Translation</div>
          <div class="translation">
            ${duaData.translation || 'Translation will be provided based on the Arabic supplication above'}
          </div>
        </div>
        
        <div class="guidance">
          <div class="guidance-title">✦ SPIRITUAL GUIDANCE ✦</div>
          <ul class="guidance-list">
            <li>Recite with complete sincerity and trust in Allah's mercy</li>
            <li>Best times: Last third of night, between Adhan & Iqamah</li>
            <li>Repeat 3, 7, or 33 times for increased blessing</li>
            <li>Make wudu before recitation for added reward</li>
          </ul>
        </div>
        
        <div class="footer">
          <div class="footer-text">May Allah accept your du'ā and grant you the best</div>
          <div class="footer-brand">✦ BarakahTool - Premium Islamic Platform ✦</div>
          <div class="footer-text" style="font-size: 9pt; margin-top: 3mm;">Theme: ${theme.name}</div>
        </div>
      </body>
      </html>
    `
  }
  
  // Generate PDF from HTML
  async generatePdfFromHtml(duaData: any): Promise<Blob> {
    // Debug: Log what data we're receiving
    console.log('PDF Generator received data:', duaData)
    // Create a temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '210mm'
    container.innerHTML = this.generateHtmlContent(duaData)
    document.body.appendChild(container)
    
    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      // Convert canvas to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      
      // Clean up
      document.body.removeChild(container)
      
      return pdf.output('blob')
    } catch (error) {
      console.error('PDF generation error:', error)
      document.body.removeChild(container)
      throw error
    }
  }
}

export const islamicPdfGenerator = new IslamicPdfGenerator()
export default islamicPdfGenerator