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
      const voice = this.voices[language.toLowerCase()] || this.voices.english;
      
      // Professional text preprocessing for Islamic content
      let processedText = text
        .substring(0, 3000) // Limit for quality
        .replace(/[^\w\s.,!?;:'"()-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Generate SSML for professional quality
      const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
          <voice name='${voice}'>
            <prosody rate='0.9' pitch='+5%'>
              ${this.processIslamicContent(processedText)}
            </prosody>
          </voice>
        </speak>
      `;

      // Create request
      const response = await fetch(`${EDGE_TTS_ENDPOINT}/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
          'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br'
        },
        body: ssml
      });

      if (!response.ok) {
        throw new Error('Edge TTS request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Convert to base64 for universal use
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64Audio = reader.result;
          resolve({
            success: true,
            audioUrl: audioUrl,
            audioData: base64Audio,
            type: 'edge-tts',
            quality: 'professional'
          });
        };
        reader.readAsDataURL(audioBlob);
      });

    } catch (error) {
      console.error('Edge TTS Error:', error);
      // Fallback to Google TTS API (also free)
      return this.googleTTSFallback(text, language);
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