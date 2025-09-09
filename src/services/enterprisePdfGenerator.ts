// BarakahTool Enterprise PDF Generator
// Premium Commercial-Grade Islamic Dua PDFs

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface EnterpriseDuaData {
  arabicText: string
  transliteration?: string
  translation: string
  language: string
  situation: string
  theme?: string
}

class EnterprisePdfGenerator {
  
  // Generate enterprise-grade HTML template
  private generateEnterpriseHtml(duaData: EnterpriseDuaData): string {
    // Premium color palette
    const goldGradient = 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)'
    const emeraldGreen = '#50C878'
    const royalPurple = '#6B3AA0'
    const deepTeal = '#006B6B'
    const roseGold = '#E8B4B8'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;600;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
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
            width: 794px;
            height: 1123px;
            background: 
              linear-gradient(135deg, rgba(255,223,186,0.3) 0%, transparent 40%),
              linear-gradient(225deg, rgba(255,182,193,0.3) 0%, transparent 40%),
              linear-gradient(45deg, rgba(152,251,152,0.2) 0%, transparent 40%),
              linear-gradient(to bottom, #fef5e7 0%, #fbeee6 50%, #fef5e7 100%);
            font-family: 'Poppins', sans-serif;
            position: relative;
            overflow: hidden;
            color: #2c3e50;
          }
          
          /* Premium Overlay Pattern */
          .premium-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(80, 200, 120, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(107, 58, 160, 0.05) 0%, transparent 70%);
            z-index: 1;
          }
          
          /* Luxury Gold Frame */
          .luxury-frame {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 3px solid #d4af37;
            border-radius: 20px;
            box-shadow: 
              0 0 30px rgba(212, 175, 55, 0.4),
              inset 0 0 30px rgba(212, 175, 55, 0.1),
              0 8px 20px rgba(0, 0, 0, 0.1);
            z-index: 2;
            background: rgba(255, 255, 255, 0.5);
          }
          
          .luxury-frame::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 15px;
          }
          
          /* Islamic Geometric Corners */
          .islamic-corner {
            position: absolute;
            width: 100px;
            height: 100px;
            z-index: 3;
          }
          
          .islamic-corner::before {
            content: '❋';
            position: absolute;
            font-size: 60px;
            color: #d4af37;
            opacity: 0.4;
          }
          
          /* Additional Islamic Patterns */
          .pattern-top {
            position: absolute;
            top: 60px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 4;
          }
          
          .pattern-top::before {
            content: '◈ ◆ ◈ ◆ ◈ ◆ ◈';
            color: #d4af37;
            opacity: 0.3;
            font-size: 14pt;
          }
          
          .pattern-bottom {
            position: absolute;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 4;
          }
          
          .pattern-bottom::before {
            content: '◆ ◈ ◆ ◈ ◆ ◈ ◆';
            color: #d4af37;
            opacity: 0.3;
            font-size: 14pt;
          }
          
          /* Side Decorations */
          .side-decoration {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 200px;
            z-index: 3;
          }
          
          .side-decoration.left {
            left: 25px;
            border-left: 2px solid rgba(212, 175, 55, 0.2);
          }
          
          .side-decoration.right {
            right: 25px;
            border-right: 2px solid rgba(212, 175, 55, 0.2);
          }
          
          .islamic-corner.top-left { top: 15px; left: 15px; }
          .islamic-corner.top-right { top: 15px; right: 15px; transform: rotate(90deg); }
          .islamic-corner.bottom-left { bottom: 15px; left: 15px; transform: rotate(-90deg); }
          .islamic-corner.bottom-right { bottom: 15px; right: 15px; transform: rotate(180deg); }
          
          /* Content Container */
          .content-wrapper {
            position: relative;
            z-index: 10;
            padding: 40px 45px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }
          
          /* Premium Header */
          .premium-header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
          }
          
          .premium-badge {
            display: inline-block;
            background: linear-gradient(135deg, #d4af37, #f4a460);
            color: #ffffff;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 9pt;
            font-weight: 600;
            margin-bottom: 15px;
            box-shadow: 0 3px 10px rgba(212, 175, 55, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .bismillah-container {
            position: relative;
            margin-bottom: 20px;
          }
          
          .bismillah {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 32pt;
            font-weight: 700;
            color: #d4af37;
            text-shadow: 
              2px 2px 4px rgba(0, 0, 0, 0.1),
              0 0 20px rgba(212, 175, 55, 0.3);
          }
          
          .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 28pt;
            font-weight: 900;
            color: #2c3e50;
            text-shadow: 
              2px 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 10px;
          }
          
          .subtitle {
            font-family: 'Poppins', sans-serif;
            font-size: 12pt;
            color: ${emeraldGreen};
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          /* Premium Divider */
          .premium-divider {
            width: 100%;
            height: 40px;
            margin: 30px 0;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .premium-divider::before,
          .premium-divider::after {
            content: '';
            position: absolute;
            height: 2px;
            width: 35%;
            background: ${goldGradient};
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }
          
          .premium-divider::before { left: 0; }
          .premium-divider::after { right: 0; }
          
          .divider-ornament {
            font-size: 24pt;
            background: ${goldGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            z-index: 1;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
          }
          
          /* Arabic Section - Premium */
          .arabic-container {
            width: 100%;
            margin-bottom: 25px;
            position: relative;
          }
          
          .arabic-frame {
            background: 
              linear-gradient(135deg, rgba(255, 248, 220, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%),
              radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
            border: 2px solid #d4af37;
            border-radius: 20px;
            padding: 35px 30px;
            position: relative;
            overflow: hidden;
            box-shadow: 
              0 8px 25px rgba(0, 0, 0, 0.08),
              inset 0 0 40px rgba(212, 175, 55, 0.08);
          }
          
          .arabic-frame::before {
            content: '٭';
            position: absolute;
            top: 15px;
            left: 20px;
            font-size: 30px;
            color: rgba(255, 215, 0, 0.3);
          }
          
          .arabic-frame::after {
            content: '٭';
            position: absolute;
            bottom: 15px;
            right: 20px;
            font-size: 30px;
            color: rgba(255, 215, 0, 0.3);
            transform: rotate(180deg);
          }
          
          .arabic-text {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 34pt;
            line-height: 2.2;
            text-align: center;
            direction: rtl;
            font-weight: 700;
            background: linear-gradient(135deg, 
              #d4af37 0%, 
              #f4a460 35%, 
              #50C878 50%, 
              #f4a460 65%, 
              #d4af37 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
          }
          
          @keyframes shimmer {
            0%, 100% { 
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) brightness(1);
            }
            50% { 
              filter: drop-shadow(0 4px 15px rgba(255, 215, 0, 0.6)) brightness(1.2);
            }
          }
          
          /* Transliteration Section */
          .transliteration-container {
            width: 100%;
            margin-bottom: 20px;
            background: linear-gradient(135deg, 
              rgba(240, 255, 240, 0.7) 0%, 
              rgba(255, 255, 255, 0.5) 100%);
            border-left: 3px solid #50C878;
            border-radius: 10px;
            padding: 15px 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .transliteration-text {
            font-family: 'Poppins', sans-serif;
            font-size: 14pt;
            color: #27ae60;
            text-align: center;
            font-style: italic;
            font-weight: 400;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
          }
          
          /* Translation Section - Luxury */
          .translation-container {
            width: 100%;
            margin-bottom: 40px;
            position: relative;
          }
          
          .translation-frame {
            background: 
              linear-gradient(135deg, rgba(255, 240, 245, 0.6) 0%, rgba(255, 250, 240, 0.6) 100%),
              radial-gradient(circle at top right, rgba(232, 180, 184, 0.2) 0%, transparent 50%);
            border: 1.5px solid rgba(232, 180, 184, 0.4);
            border-radius: 15px;
            padding: 25px;
            position: relative;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          }
          
          .translation-label {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(90deg, #1a1a2e, #16213e, #1a1a2e);
            padding: 5px 20px;
            border-radius: 20px;
            font-size: 10pt;
            color: ${roseGold};
            font-weight: 600;
            border: 1px solid rgba(232, 180, 184, 0.3);
          }
          
          .translation-text {
            font-family: 'Playfair Display', serif;
            font-size: 16pt;
            color: #2c3e50;
            text-align: center;
            line-height: 1.8;
            font-style: italic;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
          }
          
          .translation-text::before,
          .translation-text::after {
            content: '"';
            font-size: 30pt;
            color: ${roseGold};
            opacity: 0.5;
          }
          
          /* Guidance Section - Premium */
          .guidance-container {
            width: 100%;
            margin-bottom: 20px;
            background: 
              linear-gradient(135deg, rgba(240, 255, 255, 0.6) 0%, rgba(245, 255, 250, 0.6) 100%),
              radial-gradient(circle at bottom left, rgba(0, 107, 107, 0.1) 0%, transparent 50%);
            border-radius: 15px;
            padding: 20px;
            border: 1.5px solid rgba(0, 107, 107, 0.25);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
          }
          
          .guidance-title {
            text-align: center;
            font-family: 'Poppins', sans-serif;
            font-size: 14pt;
            color: ${deepTeal};
            font-weight: 600;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .guidance-list {
            list-style: none;
            padding: 0;
          }
          
          .guidance-list li {
            font-family: 'Poppins', sans-serif;
            font-size: 10pt;
            color: #34495e;
            margin: 8px 0;
            padding-left: 25px;
            position: relative;
            line-height: 1.6;
          }
          
          .guidance-list li::before {
            content: '✦';
            position: absolute;
            left: 0;
            color: ${goldGradient};
            font-size: 14pt;
            background: ${goldGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Premium Footer */
          .premium-footer {
            position: absolute;
            bottom: 40px;
            left: 50px;
            right: 50px;
            text-align: center;
            z-index: 10;
          }
          
          .footer-blessing {
            font-family: 'Playfair Display', serif;
            font-size: 11pt;
            color: #50C878;
            margin-bottom: 8px;
            font-style: italic;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
          }
          
          .footer-brand {
            display: inline-block;
            background: ${goldGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'Poppins', sans-serif;
            font-size: 14pt;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
          }
          
          .footer-tagline {
            font-family: 'Poppins', sans-serif;
            font-size: 8pt;
            color: #7f8c8d;
            margin-top: 5px;
            letter-spacing: 0.5px;
          }
          
          /* Decorative Elements */
          .floating-star {
            position: absolute;
            color: rgba(255, 215, 0, 0.2);
            animation: float 6s ease-in-out infinite;
          }
          
          .floating-star:nth-child(1) { 
            top: 20%; 
            left: 10%; 
            font-size: 20px;
            animation-delay: 0s;
          }
          
          .floating-star:nth-child(2) { 
            top: 60%; 
            right: 15%; 
            font-size: 25px;
            animation-delay: 2s;
          }
          
          .floating-star:nth-child(3) { 
            bottom: 30%; 
            left: 8%; 
            font-size: 18px;
            animation-delay: 4s;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          /* Watermark */
          .premium-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 140pt;
            color: rgba(212, 175, 55, 0.03);
            font-weight: 900;
            letter-spacing: 40px;
            z-index: 0;
            font-family: 'Playfair Display', serif;
          }
        </style>
      </head>
      <body>
        <!-- Premium Overlay -->
        <div class="premium-overlay"></div>
        
        <!-- Luxury Frame -->
        <div class="luxury-frame"></div>
        
        <!-- Islamic Corners -->
        <div class="islamic-corner top-left"></div>
        <div class="islamic-corner top-right"></div>
        <div class="islamic-corner bottom-left"></div>
        <div class="islamic-corner bottom-right"></div>
        
        <!-- Additional Patterns -->
        <div class="pattern-top"></div>
        <div class="pattern-bottom"></div>
        
        <!-- Side Decorations -->
        <div class="side-decoration left"></div>
        <div class="side-decoration right"></div>
        
        <!-- Floating Stars -->
        <div class="floating-star">✦</div>
        <div class="floating-star">✦</div>
        <div class="floating-star">✦</div>
        
        <!-- Premium Watermark -->
        <div class="premium-watermark">BARAKAH</div>
        
        <!-- Content -->
        <div class="content-wrapper">
          <!-- Header -->
          <div class="premium-header">
            <div class="premium-badge">Enterprise Edition</div>
            <div class="bismillah-container">
              <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            </div>
            <h1 class="main-title">Sacred Islamic Supplication</h1>
            <p class="subtitle">Authentic Dua from Quran & Sunnah</p>
          </div>
          
          <!-- Premium Divider -->
          <div class="premium-divider">
            <span class="divider-ornament">❋ ❋ ❋</span>
          </div>
          
          <!-- Arabic Section -->
          <div class="arabic-container">
            <div class="arabic-frame">
              <div class="arabic-text">
                ${duaData.arabicText || 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ'}
              </div>
            </div>
          </div>
          
          <!-- Transliteration -->
          ${duaData.transliteration ? `
          <div class="transliteration-container">
            <div class="transliteration-text">
              ${duaData.transliteration}
            </div>
          </div>
          ` : ''}
          
          <!-- Translation -->
          <div class="translation-container">
            <div class="translation-frame">
              <div class="translation-label">${duaData.language || 'English'} Translation</div>
              <div class="translation-text">
                ${duaData.translation || 'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire'}
              </div>
            </div>
          </div>
          
          <!-- Guidance -->
          <div class="guidance-container">
            <div class="guidance-title">◆ Spiritual Excellence Guide ◆</div>
            <ul class="guidance-list">
              <li>Optimal times: Tahajjud, last third of night, between Adhan & Iqamah</li>
              <li>Recite with presence of heart and complete sincerity</li>
              <li>Recommended repetitions: 3, 7, 11, or 33 times</li>
              <li>Maintain wudu and face Qiblah for maximum blessing</li>
              <li>Follow with personal dua in your native language</li>
            </ul>
          </div>
        </div>
        
        <!-- Premium Footer -->
        <div class="premium-footer">
          <div class="footer-blessing">May Allah accept your supplication and shower His infinite mercy upon you</div>
          <div class="footer-brand">BARAKAHTOOL</div>
          <div class="footer-tagline">Enterprise Islamic Digital Solutions • Premium Quality • Authentic Content</div>
        </div>
      </body>
      </html>
    `
  }
  
  // Generate enterprise PDF
  async generateEnterprisePdf(duaData: EnterpriseDuaData): Promise<Blob> {
    console.log('Generating enterprise PDF with data:', duaData)
    
    // Create temporary container
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = '794px'
    container.style.height = '1123px'
    container.innerHTML = this.generateEnterpriseHtml(duaData)
    document.body.appendChild(container)
    
    try {
      // Wait for fonts and animations to load
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Convert to high-quality canvas
      const canvas = await html2canvas(container, {
        scale: 3, // Ultra high quality for enterprise
        useCORS: true,
        logging: false,
        backgroundColor: '#1a1a2e',
        width: 794,
        height: 1123,
        allowTaint: true,
        foreignObjectRendering: true
      })
      
      // Create PDF with optimal settings
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123],
        compress: false, // No compression for highest quality
        hotfixes: ['px_scaling']
      })
      
      // Add image with highest quality
      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, 794, 1123, undefined, 'NONE')
      
      // Add metadata
      pdf.setProperties({
        title: 'Premium Islamic Dua - BarakahTool Enterprise',
        subject: 'Authentic Islamic Supplication',
        author: 'BarakahTool Enterprise Edition',
        keywords: 'Islamic, Dua, Prayer, Premium, Authentic',
        creator: 'BarakahTool Enterprise PDF Generator'
      })
      
      // Clean up
      document.body.removeChild(container)
      
      return pdf.output('blob')
    } catch (error) {
      console.error('Enterprise PDF generation error:', error)
      document.body.removeChild(container)
      throw error
    }
  }
}

export const enterprisePdfGenerator = new EnterprisePdfGenerator()
export default enterprisePdfGenerator