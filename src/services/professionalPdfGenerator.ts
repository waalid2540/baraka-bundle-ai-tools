// BarakahTool Professional PDF Generator
// High-Quality Islamic Dua PDFs with Professional Typography

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ProfessionalDuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
  theme?: string
}

class ProfessionalPdfGenerator {
  
  // Generate professional HTML template
  private generateProfessionalHtml(duaData: ProfessionalDuaData): string {
    // Professional color scheme
    const primaryColor = '#b38d00' // Gold
    const accentColor = '#0a5c49' // Deep green
    const borderColor = '#d4af37' // Metallic gold
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Sans:wght@400;600&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 210mm;
            height: 297mm;
            padding: 25mm 20mm;
            background: linear-gradient(to bottom, #ffffff, #fdfbf7);
            font-family: 'Noto Sans', Arial, sans-serif;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          /* Professional Gold Frame */
          .gold-frame {
            position: absolute;
            top: 15mm;
            left: 15mm;
            right: 15mm;
            bottom: 15mm;
            border: 2px solid ${borderColor};
            border-radius: 2mm;
            box-shadow: 
              inset 0 0 0 1px ${borderColor}40,
              0 0 20px ${borderColor}20;
          }
          
          .gold-frame::before {
            content: '';
            position: absolute;
            top: 5mm;
            left: 5mm;
            right: 5mm;
            bottom: 5mm;
            border: 1px solid ${borderColor}60;
            border-radius: 1mm;
          }
          
          /* Corner Ornaments */
          .corner-ornament {
            position: absolute;
            width: 15mm;
            height: 15mm;
            border: 2px solid ${borderColor};
          }
          
          .corner-ornament.top-left {
            top: -2px;
            left: -2px;
            border-right: none;
            border-bottom: none;
            border-top-left-radius: 8px;
          }
          
          .corner-ornament.top-right {
            top: -2px;
            right: -2px;
            border-left: none;
            border-bottom: none;
            border-top-right-radius: 8px;
          }
          
          .corner-ornament.bottom-left {
            bottom: -2px;
            left: -2px;
            border-right: none;
            border-top: none;
            border-bottom-left-radius: 8px;
          }
          
          .corner-ornament.bottom-right {
            bottom: -2px;
            right: -2px;
            border-left: none;
            border-top: none;
            border-bottom-right-radius: 8px;
          }
          
          /* Header Section */
          .header {
            text-align: center;
            margin-bottom: 20mm;
            z-index: 10;
            width: 100%;
          }
          
          .bismillah {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 22pt;
            color: ${primaryColor};
            margin-bottom: 10mm;
            font-weight: 700;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          .title {
            font-family: 'Noto Sans', sans-serif;
            font-size: 18pt;
            color: ${accentColor};
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 5mm;
          }
          
          .subtitle {
            font-family: 'Noto Sans', sans-serif;
            font-size: 11pt;
            color: #666;
            font-style: italic;
          }
          
          /* Divider */
          .divider {
            width: 100%;
            text-align: center;
            margin: 15mm 0;
            position: relative;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 30%;
            height: 1px;
            background: linear-gradient(90deg, transparent, ${borderColor}, transparent);
          }
          
          .divider::before { left: 0; }
          .divider::after { right: 0; }
          
          .divider-symbol {
            display: inline-block;
            color: ${borderColor};
            font-size: 16pt;
            padding: 0 10mm;
            background: linear-gradient(to bottom, #ffffff, #fdfbf7);
          }
          
          /* Main Content */
          .content {
            width: 100%;
            max-width: 160mm;
            z-index: 10;
          }
          
          /* Arabic Section */
          .arabic-section {
            text-align: center;
            margin-bottom: 15mm;
            padding: 10mm;
            background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,251,247,0.7));
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .arabic-text {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 28pt;
            line-height: 2.2;
            color: #1a1a1a;
            direction: rtl;
            text-align: center;
            font-weight: 400;
            margin: 10mm 0;
          }
          
          /* Transliteration */
          .transliteration-section {
            text-align: center;
            margin-bottom: 10mm;
            padding: 8mm;
            border-left: 3px solid ${accentColor};
            background: rgba(10, 92, 73, 0.03);
          }
          
          .transliteration-text {
            font-family: 'Noto Sans', sans-serif;
            font-size: 13pt;
            color: ${accentColor};
            font-style: italic;
            line-height: 1.8;
          }
          
          /* Translation Section */
          .translation-section {
            text-align: center;
            margin-bottom: 15mm;
            padding: 10mm;
          }
          
          .translation-label {
            font-family: 'Noto Sans', sans-serif;
            font-size: 10pt;
            color: ${accentColor};
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 5mm;
            font-weight: 600;
          }
          
          .translation-text {
            font-family: 'Noto Sans', sans-serif;
            font-size: 14pt;
            color: #333;
            line-height: 1.8;
            font-style: italic;
          }
          
          .translation-text::before,
          .translation-text::after {
            content: '"';
            color: ${borderColor};
            font-size: 20pt;
            font-weight: bold;
          }
          
          /* Notes Section */
          .notes-section {
            margin-top: 10mm;
            padding: 8mm;
            background: linear-gradient(135deg, #fdfbf7, #ffffff);
            border-radius: 6px;
            border: 1px solid ${borderColor}30;
          }
          
          .notes-title {
            font-family: 'Noto Sans', sans-serif;
            font-size: 11pt;
            color: ${accentColor};
            text-align: center;
            margin-bottom: 5mm;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .notes-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .notes-list li {
            font-family: 'Noto Sans', sans-serif;
            font-size: 10pt;
            color: #555;
            margin: 3mm 0;
            padding-left: 20mm;
            position: relative;
            line-height: 1.6;
          }
          
          .notes-list li::before {
            content: '◆';
            position: absolute;
            left: 10mm;
            color: ${borderColor};
            font-size: 8pt;
          }
          
          /* Footer */
          .footer {
            position: absolute;
            bottom: 20mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            padding-top: 5mm;
            border-top: 1px solid ${borderColor}40;
            z-index: 10;
          }
          
          .footer-text {
            font-family: 'Noto Sans', sans-serif;
            font-size: 9pt;
            color: #999;
            margin-bottom: 2mm;
          }
          
          .footer-brand {
            font-family: 'Noto Sans', sans-serif;
            font-size: 11pt;
            color: ${primaryColor};
            font-weight: 600;
            letter-spacing: 1px;
          }
          
          /* Watermark */
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120pt;
            color: ${borderColor}08;
            font-weight: bold;
            letter-spacing: 20px;
            z-index: 1;
            user-select: none;
          }
        </style>
      </head>
      <body>
        <!-- Gold Frame -->
        <div class="gold-frame">
          <div class="corner-ornament top-left"></div>
          <div class="corner-ornament top-right"></div>
          <div class="corner-ornament bottom-left"></div>
          <div class="corner-ornament bottom-right"></div>
        </div>
        
        <!-- Watermark -->
        <div class="watermark">BARAKAH</div>
        
        <!-- Header -->
        <div class="header">
          <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <div class="title">Blessed Supplication</div>
          <div class="subtitle">An Authentic Islamic Du'ā</div>
        </div>
        
        <!-- Content -->
        <div class="content">
          <!-- Arabic Section -->
          <div class="arabic-section">
            <div class="arabic-text">
              ${duaData.arabicText || 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ النَّجَاحِ'}
            </div>
          </div>
          
          <!-- Transliteration if available -->
          ${duaData.transliteration ? `
          <div class="transliteration-section">
            <div class="transliteration-text">
              ${duaData.transliteration}
            </div>
          </div>
          ` : ''}
          
          <!-- Divider -->
          <div class="divider">
            <span class="divider-symbol">◈ ◈ ◈</span>
          </div>
          
          <!-- Translation Section -->
          <div class="translation-section">
            <div class="translation-label">${duaData.language} Translation</div>
            <div class="translation-text">
              ${duaData.translation || 'O Allah, open for me the doors of success in every matter'}
            </div>
          </div>
          
          <!-- Notes Section -->
          <div class="notes-section">
            <div class="notes-title">Spiritual Guidance</div>
            <ul class="notes-list">
              <li>Best times: Last third of the night, between Adhan & Iqamah, while fasting</li>
              <li>Recite with complete sincerity and trust in Allah's mercy</li>
              <li>Repeat 3, 7, or 33 times for increased blessing</li>
              <li>Make wudu before recitation for added spiritual benefit</li>
              <li>Follow with personal supplications in your own language</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">May Allah accept your supplication and grant you success</div>
          <div class="footer-brand">BARAKAHTOOL • PREMIUM ISLAMIC PLATFORM</div>
        </div>
      </body>
      </html>
    `
  }
  
  // Generate professional PDF
  async generateProfessionalPdf(duaData: ProfessionalDuaData): Promise<Blob> {
    console.log('Generating professional PDF with data:', duaData)
    
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.width = '210mm'
    container.style.height = '297mm'
    container.innerHTML = this.generateProfessionalHtml(duaData)
    document.body.appendChild(container)
    
    try {
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Convert to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
        windowWidth: 794,
        windowHeight: 1123
      })
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
      
      // Clean up
      document.body.removeChild(container)
      
      return pdf.output('blob')
    } catch (error) {
      console.error('Professional PDF generation error:', error)
      document.body.removeChild(container)
      throw error
    }
  }
}

export const professionalPdfGenerator = new ProfessionalPdfGenerator()
export default professionalPdfGenerator