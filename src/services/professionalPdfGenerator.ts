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
            width: 595px;
            height: 842px;
            padding: 60px 50px;
            background: linear-gradient(135deg, #fefefe 0%, #f9f7f0 50%, #fdfbf7 100%);
            font-family: 'Noto Sans', Arial, sans-serif;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
            margin: 0;
          }
          
          /* Islamic Geometric Pattern Background */
          .islamic-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.04;
            background-image: 
              repeating-linear-gradient(45deg, ${primaryColor} 0, ${primaryColor} 1px, transparent 1px, transparent 15px),
              repeating-linear-gradient(-45deg, ${primaryColor} 0, ${primaryColor} 1px, transparent 1px, transparent 15px),
              repeating-linear-gradient(90deg, ${primaryColor} 0, ${primaryColor} 1px, transparent 1px, transparent 15px),
              repeating-linear-gradient(180deg, ${primaryColor} 0, ${primaryColor} 1px, transparent 1px, transparent 15px);
            z-index: 0;
          }
          
          /* Islamic Star Pattern */
          .star-pattern {
            position: absolute;
            width: 80px;
            height: 80px;
            opacity: 0.08;
          }
          
          .star-pattern.top-left { top: 30px; left: 30px; }
          .star-pattern.top-right { top: 30px; right: 30px; }
          .star-pattern.bottom-left { bottom: 30px; left: 30px; }
          .star-pattern.bottom-right { bottom: 30px; right: 30px; }
          
          .star-pattern::before {
            content: '✦';
            position: absolute;
            font-size: 60px;
            color: ${borderColor};
            transform: rotate(0deg);
          }
          
          .star-pattern::after {
            content: '✦';
            position: absolute;
            font-size: 60px;
            color: ${borderColor};
            transform: rotate(45deg);
          }
          
          /* Professional Gold Frame */
          .gold-frame {
            position: absolute;
            top: 40px;
            left: 40px;
            right: 40px;
            bottom: 40px;
            border: 3px solid ${borderColor};
            border-radius: 12px;
            box-shadow: 
              inset 0 0 0 1px ${borderColor}40,
              0 0 30px ${borderColor}30,
              inset 0 0 60px ${borderColor}10;
            z-index: 1;
          }
          
          .gold-frame::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid ${borderColor}60;
            border-radius: 8px;
          }
          
          /* Corner Ornaments */
          .corner-ornament {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 3px solid ${borderColor};
            z-index: 2;
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
            margin-bottom: 30px;
            z-index: 10;
            width: 100%;
            position: relative;
          }
          
          .bismillah {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 22pt;
            color: ${primaryColor};
            margin-bottom: 20px;
            font-weight: 700;
            text-shadow: 
              0 2px 4px rgba(0,0,0,0.1),
              0 0 30px ${borderColor}30;
          }
          
          .title {
            font-family: 'Noto Sans', sans-serif;
            font-size: 18pt;
            color: ${accentColor};
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 15px;
            position: relative;
          }
          
          .title::before,
          .title::after {
            content: '◈';
            position: absolute;
            color: ${borderColor};
            font-size: 16pt;
            top: 2px;
          }
          
          .title::before { left: -40px; }
          .title::after { right: -40px; }
          
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
            margin: 25px 0;
            position: relative;
            z-index: 10;
          }
          
          .divider::before,
          .divider::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 35%;
            height: 2px;
            background: linear-gradient(90deg, transparent, ${borderColor}, ${accentColor}, ${borderColor}, transparent);
          }
          
          .divider::before { left: 0; }
          .divider::after { right: 0; }
          
          .divider-symbol {
            display: inline-block;
            color: ${borderColor};
            font-size: 20pt;
            padding: 0 30px;
            background: linear-gradient(135deg, #fefefe, #fdfbf7);
            text-shadow: 0 0 10px ${borderColor}40;
          }
          
          /* Main Content */
          .content {
            width: 100%;
            max-width: 500px;
            z-index: 10;
            position: relative;
          }
          
          /* Arabic Section */
          .arabic-section {
            text-align: center;
            margin-bottom: 25px;
            padding: 25px;
            background: 
              radial-gradient(circle at center, rgba(255,255,255,0.95), rgba(253,251,247,0.8)),
              linear-gradient(135deg, ${borderColor}10, transparent);
            border-radius: 15px;
            box-shadow: 
              0 4px 20px rgba(0,0,0,0.08),
              inset 0 0 40px ${borderColor}08;
            border: 1px solid ${borderColor}20;
            position: relative;
          }
          
          .arabic-section::before,
          .arabic-section::after {
            content: '۞';
            position: absolute;
            font-size: 40px;
            color: ${borderColor}20;
          }
          
          .arabic-section::before { top: 10px; left: 10px; }
          .arabic-section::after { bottom: 10px; right: 10px; transform: rotate(180deg); }
          
          .arabic-text {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 24pt;
            line-height: 2.3;
            color: #1a1a1a;
            direction: rtl;
            text-align: center;
            font-weight: 400;
            margin: 20px 0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
            font-size: 12pt;
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
          
          /* Islamic Decorative Elements */
          .mosque-silhouette {
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 80px;
            opacity: 0.06;
            z-index: 0;
          }
          
          .mosque-silhouette::before {
            content: 'ὔC';
            position: absolute;
            font-size: 100px;
            color: ${primaryColor};
            left: 50%;
            transform: translateX(-50%);
          }
          
          .crescent-moon {
            position: absolute;
            font-size: 40px;
            color: ${borderColor}15;
            opacity: 0.5;
          }
          
          .crescent-moon.left { top: 150px; left: 80px; transform: rotate(-20deg); }
          .crescent-moon.right { top: 150px; right: 80px; transform: rotate(20deg); }
        </style>
      </head>
      <body>
        <!-- Islamic Pattern Background -->
        <div class="islamic-pattern"></div>
        
        <!-- Islamic Star Decorations -->
        <div class="star-pattern top-left"></div>
        <div class="star-pattern top-right"></div>
        <div class="star-pattern bottom-left"></div>
        <div class="star-pattern bottom-right"></div>
        
        <!-- Gold Frame -->
        <div class="gold-frame">
          <div class="corner-ornament top-left"></div>
          <div class="corner-ornament top-right"></div>
          <div class="corner-ornament bottom-left"></div>
          <div class="corner-ornament bottom-right"></div>
        </div>
        
        <!-- Crescent Moon Decorations -->
        <div class="crescent-moon left">☪</div>
        <div class="crescent-moon right">☪</div>
        
        <!-- Mosque Silhouette -->
        <div class="mosque-silhouette"></div>
        
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
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = '595px'
    container.style.height = '842px'
    container.style.backgroundColor = 'white'
    container.innerHTML = this.generateProfessionalHtml(duaData)
    document.body.appendChild(container)
    
    try {
      // Wait for fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Convert to canvas with high quality
      const canvas = await html2canvas(container, {
        scale: 2, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 595,
        height: 842
      })
      
      // Create PDF with exact A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [595, 842], // A4 size in points (72 DPI)
        compress: true
      })
      
      // Calculate scaling to fit perfectly
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      // Add image to PDF with proper scaling
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'SLOW')
      
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