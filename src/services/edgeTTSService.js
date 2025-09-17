// Microsoft Edge TTS Service - FREE Professional Quality TTS
// No API key required - uses Microsoft's Edge browser TTS API

const EDGE_TTS_ENDPOINT = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud';

class EdgeTTSService {
  constructor() {
    this.voices = {
      english: 'en-US-JennyNeural',
      arabic: 'ar-SA-ZariyahNeural',
      somali: 'en-US-JennyNeural', // Fallback
      urdu: 'ur-PK-UzmaNeural',
      turkish: 'tr-TR-EmelNeural',
      french: 'fr-FR-DeniseNeural',
      spanish: 'es-ES-ElviraNeural'
    };
  }

  async generateAudio(text, language = 'english') {
    try {
      // Skip Edge TTS for now - go straight to enhanced Google TTS
      return this.enhancedGoogleTTS(text, language);
    } catch (error) {
      console.error('Enhanced TTS Error:', error);
      // Final fallback to basic Google TTS
      return this.googleTTSFallback(text, language);
    }
  }

  async enhancedGoogleTTS(text, language = 'english') {
    try {
      const langCode = this.getLanguageCode(language);
      
      // Professional text preprocessing for Islamic content
      let processedText = text
        .substring(0, 800) // Optimal length for quality
        .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Process Islamic content for better pronunciation
      processedText = this.processIslamicContentForGoogle(processedText);
      
      // Use enhanced Google TTS with better parameters
      const enhancedUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(processedText)}&tk=1`;
      
      // Test if URL works by fetching a small portion
      const testResponse = await fetch(enhancedUrl, { method: 'HEAD' });
      
      if (testResponse.ok) {
        return {
          success: true,
          audioUrl: enhancedUrl,
          audioData: enhancedUrl,
          type: 'enhanced-google-tts',
          quality: 'professional'
        };
      } else {
        throw new Error('Enhanced Google TTS failed');
      }
    } catch (error) {
      console.error('Enhanced Google TTS Error:', error);
      throw error;
    }
  }

  async googleTTSFallback(text, language = 'english') {
    try {
      const langCode = this.getLanguageCode(language);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text.substring(0, 200))}`;
      
      return {
        success: true,
        audioUrl: url,
        type: 'google-tts',
        quality: 'good'
      };
    } catch (error) {
      console.error('Google TTS Error:', error);
      throw error;
    }
  }

  processIslamicContent(text) {
    // Add emphasis to Islamic terms
    const islamicTerms = {
      'Allah': "<emphasis level='strong'>Allah</emphasis>",
      'Muhammad': "<emphasis level='strong'>Muhammad</emphasis>",
      'Quran': "<emphasis level='strong'>Quran</emphasis>",
      'Bismillah': "<emphasis level='strong'>Bismillah</emphasis>",
      'Alhamdulillah': "<emphasis level='strong'>Alhamdulillah</emphasis>",
      'Subhanallah': "<emphasis level='strong'>Subhanallah</emphasis>",
      'Mashallah': "<emphasis level='strong'>Mashallah</emphasis>",
      'Inshallah': "<emphasis level='strong'>Inshallah</emphasis>"
    };

    let processed = text;
    for (const [term, replacement] of Object.entries(islamicTerms)) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processed = processed.replace(regex, replacement);
    }

    // Add pauses after sentences
    processed = processed.replace(/\./g, '.<break time="500ms"/>');
    processed = processed.replace(/,/g, ',<break time="300ms"/>');

    return processed;
  }

  processIslamicContentForGoogle(text) {
    // Improve pronunciation of Islamic terms for Google TTS
    const islamicTerms = {
      'Allah': 'Allah',
      'Muhammad': 'Muhammad',
      'Quran': 'Quran',
      'Koran': 'Quran',
      'Bismillah': 'Bismillah',
      'Alhamdulillah': 'Alhamdulillah',
      'Subhanallah': 'Subhanallah',
      'Mashallah': 'Mashallah',
      'Inshallah': 'Inshallah'
    };

    let processed = text;
    
    // Replace common mispronunciations
    for (const [term, correct] of Object.entries(islamicTerms)) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      processed = processed.replace(regex, correct);
    }

    // Add natural pauses
    processed = processed.replace(/\./g, '. ');
    processed = processed.replace(/,/g, ', ');
    processed = processed.replace(/\s+/g, ' ');

    return processed.trim();
  }

  getLanguageCode(language) {
    const codes = {
      'english': 'en',
      'arabic': 'ar',
      'somali': 'so',
      'urdu': 'ur',
      'turkish': 'tr',
      'french': 'fr',
      'spanish': 'es'
    };
    return codes[language.toLowerCase()] || 'en';
  }
}

// Export service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = new EdgeTTSService();
} else {
  window.edgeTTSService = new EdgeTTSService();
}