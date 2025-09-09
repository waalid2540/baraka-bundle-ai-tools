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
            background: linear-gradient(180deg, 
              #1a1a2e 0%, 
              #16213e 20%, 
              #0f3460 40%, 
              #16213e 60%, 
              #1a1a2e 100%);
            font-family: 'Poppins', sans-serif;
            position: relative;
            overflow: hidden;
            color: #ffffff;
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
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 4px solid transparent;
            border-image: ${goldGradient};
            border-image-slice: 1;
            border-radius: 20px;
            box-shadow: 
              0 0 50px rgba(255, 215, 0, 0.3),
              inset 0 0 50px rgba(255, 215, 0, 0.1),
              0 10px 30px rgba(0, 0, 0, 0.5);
            z-index: 2;
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
            width: 120px;
            height: 120px;
            z-index: 3;
          }
          
          .islamic-corner::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: ${goldGradient};
            clip-path: polygon(
              0 0, 30% 0, 50% 20%, 70% 0, 100% 0,
              100% 30%, 80% 50%, 100% 70%, 100% 100%,
              70% 100%, 50% 80%, 30% 100%, 0 100%,
              0 70%, 20% 50%, 0 30%
            );
            opacity: 0.8;
          }
          
          .islamic-corner.top-left { top: 15px; left: 15px; }
          .islamic-corner.top-right { top: 15px; right: 15px; transform: rotate(90deg); }
          .islamic-corner.bottom-left { bottom: 15px; left: 15px; transform: rotate(-90deg); }
          .islamic-corner.bottom-right { bottom: 15px; right: 15px; transform: rotate(180deg); }
          
          /* Content Container */
          .content-wrapper {
            position: relative;
            z-index: 10;
            padding: 60px 50px;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          /* Premium Header */
          .premium-header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
          }
          
          .premium-badge {
            display: inline-block;
            background: ${goldGradient};
            color: #1a1a2e;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: 700;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .bismillah-container {
            position: relative;
            margin-bottom: 20px;
          }
          
          .bismillah {
            font-family: 'Amiri', 'Noto Naskh Arabic', serif;
            font-size: 36pt;
            font-weight: 700;
            background: ${goldGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 
              0 0 30px rgba(255, 215, 0, 0.5),
              0 0 60px rgba(255, 215, 0, 0.3);
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          }
          
          .main-title {
            font-family: 'Playfair Display', serif;
            font-size: 32pt;
            font-weight: 900;
            color: #ffffff;
            text-shadow: 
              0 4px 8px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(255, 215, 0, 0.2);
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
            margin-bottom: 40px;
            position: relative;
          }
          
          .arabic-frame {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.05) 0%, 
              rgba(255, 215, 0, 0.05) 50%, 
              rgba(255, 255, 255, 0.05) 100%);
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 20px;
            padding: 40px;
            position: relative;
            overflow: hidden;
            box-shadow: 
              0 10px 40px rgba(0, 0, 0, 0.3),
              inset 0 0 60px rgba(255, 215, 0, 0.05);
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
            font-size: 38pt;
            line-height: 2.5;
            text-align: center;
            direction: rtl;
            font-weight: 700;
            background: linear-gradient(135deg, 
              #FFD700 0%, 
              #FFA500 25%, 
              ${emeraldGreen} 50%, 
              #FFA500 75%, 
              #FFD700 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
            animation: shimmer 3s ease-in-out infinite;
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
            margin-bottom: 30px;
            background: linear-gradient(135deg, 
              rgba(80, 200, 120, 0.1) 0%, 
              transparent 100%);
            border-left: 4px solid ${emeraldGreen};
            border-radius: 10px;
            padding: 20px;
          }
          
          .transliteration-text {
            font-family: 'Poppins', sans-serif;
            font-size: 16pt;
            color: #ffffff;
            text-align: center;
            font-style: italic;
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          /* Translation Section - Luxury */
          .translation-container {
            width: 100%;
            margin-bottom: 40px;
            position: relative;
          }
          
          .translation-frame {
            background: linear-gradient(135deg,
              rgba(107, 58, 160, 0.1) 0%,
              rgba(232, 180, 184, 0.05) 50%,
              rgba(107, 58, 160, 0.1) 100%);
            border: 1px solid rgba(232, 180, 184, 0.3);
            border-radius: 15px;
            padding: 30px;
            position: relative;
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
            font-size: 18pt;
            color: #ffffff;
            text-align: center;
            line-height: 1.8;
            font-style: italic;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
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
            margin-bottom: 30px;
            background: linear-gradient(135deg,
              rgba(0, 107, 107, 0.1) 0%,
              transparent 100%);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(0, 107, 107, 0.2);
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
            font-size: 11pt;
            color: rgba(255, 255, 255, 0.9);
            margin: 10px 0;
            padding-left: 30px;
            position: relative;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
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
            font-size: 12pt;
            color: ${emeraldGreen};
            margin-bottom: 10px;
            font-style: italic;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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
            font-size: 9pt;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 5px;
            letter-spacing: 1px;
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
            font-size: 180pt;
            color: rgba(255, 215, 0, 0.02);
            font-weight: 900;
            letter-spacing: 50px;
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
        
        <!-- Floating Stars -->
        <div class="floating-star">✦</div>
        <div class="floating-star">✦</div>
        <div class="floating-star">✦</div>
        
        <!-- Premium Watermark -->
        <div class="premium-watermark">PREMIUM</div>
        
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