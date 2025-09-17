// Google Cloud Text-to-Speech Service
const textToSpeech = require('@google-cloud/text-to-speech');

class GoogleTTSService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.initializeClient();
  }

  initializeClient() {
    try {
      // Initialize the client
      this.client = new textToSpeech.TextToSpeechClient({
        // Google Cloud automatically detects credentials from:
        // 1. GOOGLE_APPLICATION_CREDENTIALS environment variable (path to service account key)
        // 2. Google Cloud SDK credentials
        // 3. Google Cloud metadata service (when running on GCP)
      });
      this.isInitialized = true;
      console.log('✅ Google Cloud Text-to-Speech initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google TTS:', error.message);
      this.isInitialized = false;
    }
  }

  // Professional voice mapping with highest quality voices
  getVoiceConfig(language) {
    const voiceConfigs = {
      'english': {
        languageCode: 'en-US',
        name: 'en-US-Studio-O', // Premium Studio voice - most professional
        ssmlGender: 'FEMALE'
      },
      'arabic': {
        languageCode: 'ar-XA',
        name: 'ar-XA-Wavenet-B', // Wavenet for better quality
        ssmlGender: 'MALE'
      },
      'somali': {
        languageCode: 'en-US', // Professional English for Somali
        name: 'en-US-Studio-M', // Premium male voice
        ssmlGender: 'MALE'
      },
      'urdu': {
        languageCode: 'en-IN', // Professional Indian English
        name: 'en-IN-Wavenet-D',
        ssmlGender: 'FEMALE'
      },
      'turkish': {
        languageCode: 'tr-TR',
        name: 'tr-TR-Wavenet-A', // Wavenet for professional quality
        ssmlGender: 'FEMALE'
      },
      'indonesian': {
        languageCode: 'id-ID',
        name: 'id-ID-Wavenet-A', // Wavenet quality
        ssmlGender: 'FEMALE'
      },
      'french': {
        languageCode: 'fr-FR',
        name: 'fr-FR-Studio-A', // Premium Studio voice
        ssmlGender: 'FEMALE'
      },
      'spanish': {
        languageCode: 'es-ES',
        name: 'es-ES-Studio-F', // Premium Studio voice
        ssmlGender: 'FEMALE'
      },
      'german': {
        languageCode: 'de-DE',
        name: 'de-DE-Studio-B', // Premium Studio voice
        ssmlGender: 'FEMALE'
      },
      'russian': {
        languageCode: 'ru-RU',
        name: 'ru-RU-Wavenet-A', // Wavenet quality
        ssmlGender: 'FEMALE'
      },
      'chinese': {
        languageCode: 'zh-CN',
        name: 'zh-CN-Wavenet-A', // Wavenet quality
        ssmlGender: 'FEMALE'
      },
      'japanese': {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-A', // Wavenet quality
        ssmlGender: 'FEMALE'
      }
    };

    return voiceConfigs[language?.toLowerCase()] || voiceConfigs.english;
  }

  // Format text with professional SSML markup for better narration
  formatTextWithSSML(text) {
    // Escape any existing XML/HTML tags
    const escapedText = text.replace(/[<>&'"]/g, (char) => {
      const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
      return entities[char];
    });

    // Professional SSML formatting for Islamic stories
    let ssml = `<speak>
      <prosody rate="0.95" pitch="0st" volume="loud">
        <emphasis level="moderate">${escapedText}</emphasis>
      </prosody>
    </speak>`;

    // Add pauses for better narration flow
    ssml = ssml.replace(/\./g, '.<break time="0.5s"/>');
    ssml = ssml.replace(/,/g, ',<break time="0.3s"/>');
    ssml = ssml.replace(/:/g, ':<break time="0.4s"/>');
    
    // Emphasis for Islamic terms
    ssml = ssml.replace(/\b(Allah|Prophet|Muhammad|Islam|Islamic|Quran|Bismillah|Alhamdulillah|Subhanallah|Mashallah|Inshallah)\b/gi, 
      '<emphasis level="strong">$1</emphasis>');

    return ssml;
  }

  async synthesizeSpeech(text, language = 'english') {
    if (!this.isInitialized || !this.client) {
      throw new Error('Google TTS client not initialized. Please check your Google Cloud credentials.');
    }

    try {
      const voiceConfig = this.getVoiceConfig(language);
      
      console.log(`🔊 Generating Google TTS audio for ${language} language...`);
      console.log(`Using voice: ${voiceConfig.name} (${voiceConfig.languageCode})`);

      // Format text with professional SSML for better narration
      const formattedText = this.formatTextWithSSML(text.substring(0, 5000));
      
      // Construct the request
      const request = {
        input: { ssml: formattedText }, // Use SSML for professional formatting
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95, // Professional speaking rate
          pitch: 0.0, // Natural pitch for professional sound
          volumeGainDb: 2.0, // Slightly louder for clarity
          effectsProfileId: ['large-home-entertainment-class-device'], // Optimize for quality speakers
        },
      };

      // Perform the text-to-speech request
      const [response] = await this.client.synthesizeSpeech(request);
      
      console.log('✅ Google TTS audio generated successfully');

      // Convert audio content to base64
      const base64Audio = response.audioContent.toString('base64');
      return `data:audio/mp3;base64,${base64Audio}`;

    } catch (error) {
      console.error('❌ Google TTS generation error:', error);
      
      // More specific error messages
      if (error.message?.includes('credentials')) {
        throw new Error('Google Cloud credentials not configured properly');
      } else if (error.message?.includes('quota')) {
        throw new Error('Google Cloud TTS quota exceeded');
      } else if (error.message?.includes('permission')) {
        throw new Error('Google Cloud TTS permission denied');
      } else {
        throw new Error(`Google TTS failed: ${error.message}`);
      }
    }
  }

  // Test if Google TTS is available
  async testConnection() {
    try {
      if (!this.isInitialized) {
        return false;
      }
      
      // Try a simple synthesis to test connectivity
      await this.synthesizeSpeech('Test', 'english');
      return true;
    } catch (error) {
      console.error('Google TTS connection test failed:', error.message);
      return false;
    }
  }

  get isAvailable() {
    return this.isInitialized && this.client !== null;
  }
}

// Export singleton instance
const googleTTSService = new GoogleTTSService();
module.exports = googleTTSService;