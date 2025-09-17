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

  // Language and voice mapping for better quality
  getVoiceConfig(language) {
    const voiceConfigs = {
      'english': {
        languageCode: 'en-US',
        name: 'en-US-Neural2-F', // Female neural voice
        ssmlGender: 'FEMALE'
      },
      'arabic': {
        languageCode: 'ar-XA',
        name: 'ar-XA-Standard-A',
        ssmlGender: 'FEMALE'
      },
      'somali': {
        languageCode: 'en-US', // Fallback to English for Somali
        name: 'en-US-Neural2-F',
        ssmlGender: 'FEMALE'
      },
      'urdu': {
        languageCode: 'en-IN', // Use Indian English for Urdu (closer accent)
        name: 'en-IN-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      'turkish': {
        languageCode: 'tr-TR',
        name: 'tr-TR-Standard-A',
        ssmlGender: 'FEMALE'
      },
      'indonesian': {
        languageCode: 'id-ID',
        name: 'id-ID-Standard-A',
        ssmlGender: 'FEMALE'
      },
      'french': {
        languageCode: 'fr-FR',
        name: 'fr-FR-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      'spanish': {
        languageCode: 'es-ES',
        name: 'es-ES-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      'german': {
        languageCode: 'de-DE',
        name: 'de-DE-Neural2-A',
        ssmlGender: 'FEMALE'
      },
      'russian': {
        languageCode: 'ru-RU',
        name: 'ru-RU-Standard-A',
        ssmlGender: 'FEMALE'
      },
      'chinese': {
        languageCode: 'zh-CN',
        name: 'zh-CN-Standard-A',
        ssmlGender: 'FEMALE'
      },
      'japanese': {
        languageCode: 'ja-JP',
        name: 'ja-JP-Neural2-B',
        ssmlGender: 'FEMALE'
      }
    };

    return voiceConfigs[language?.toLowerCase()] || voiceConfigs.english;
  }

  async synthesizeSpeech(text, language = 'english') {
    if (!this.isInitialized || !this.client) {
      throw new Error('Google TTS client not initialized. Please check your Google Cloud credentials.');
    }

    try {
      const voiceConfig = this.getVoiceConfig(language);
      
      console.log(`🔊 Generating Google TTS audio for ${language} language...`);
      console.log(`Using voice: ${voiceConfig.name} (${voiceConfig.languageCode})`);

      // Construct the request
      const request = {
        input: { text: text.substring(0, 5000) }, // Google TTS character limit
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9, // Slightly slower for kids
          pitch: 2.0, // Higher pitch for children's content
          volumeGainDb: 0.0,
          effectsProfileId: ['small-bluetooth-speaker-class-device'], // Optimize for small speakers
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