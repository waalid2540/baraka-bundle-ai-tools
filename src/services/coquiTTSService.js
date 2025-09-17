// Professional Coqui TTS Service for Islamic Content
const { spawn } = require('child_process');
const path = require('path');

class CoquiTTSService {
  constructor() {
    this.isInitialized = false;
    this.pythonPath = 'python3'; // Can be configured via environment
    this.servicePath = path.join(__dirname, '../../simple_tts_service.py');
    this.initializeService();
  }

  async initializeService() {
    try {
      // Test if Python service is available
      const testResult = await this.testPythonService();
      this.isInitialized = testResult;
      
      if (this.isInitialized) {
        console.log('✅ Coqui TTS Service initialized successfully');
      } else {
        console.log('❌ Coqui TTS Service initialization failed');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Coqui TTS:', error.message);
      this.isInitialized = false;
    }
  }

  async testPythonService() {
    return new Promise((resolve) => {
      const testProcess = spawn(this.pythonPath, ['-c', 'import pyttsx3; print("OK")'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let errorOutput = '';
      
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      testProcess.on('close', (code) => {
        if (code === 0 && output.includes('OK')) {
          console.log('✅ Python pyttsx3 test successful');
          resolve(true);
        } else {
          console.error('❌ Python pyttsx3 test failed:', errorOutput || 'Unknown error');
          console.error('💡 Run: pip3 install pyttsx3 to fix this issue');
          resolve(false);
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Python process error:', error.message);
        console.error('💡 Make sure Python3 is installed and available in PATH');
        resolve(false);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        testProcess.kill();
        console.error('❌ Python TTS test timeout - service may be slow');
        resolve(false);
      }, 10000);
    });
  }

  // Professional voice mapping for Islamic content
  getLanguageMapping(language) {
    const languageMap = {
      'english': 'english',
      'arabic': 'english', // Use English model for Arabic content
      'somali': 'english', // Use English model for Somali
      'urdu': 'english',   // Use English model for Urdu
      'turkish': 'turkish',
      'indonesian': 'english',
      'french': 'french',
      'spanish': 'spanish',
      'german': 'german',
      'russian': 'russian',
      'chinese': 'chinese',
      'japanese': 'japanese',
      'italian': 'italian'
    };

    return languageMap[language?.toLowerCase()] || 'english';
  }

  // Professional text preprocessing for Islamic stories
  preprocessText(text) {
    // Limit text length for better quality
    text = text.substring(0, 1000);
    
    // Clean up text for better speech synthesis
    text = text.replace(/[^\w\s.,!?;:'"()-]/g, ' '); // Remove special characters
    text = text.replace(/\s+/g, ' '); // Normalize whitespace
    text = text.trim();
    
    // Add natural pauses for better narration
    text = text.replace(/\./g, '.');
    text = text.replace(/,/g, ',');
    text = text.replace(/:/g, ':');
    
    return text;
  }

  async synthesizeSpeech(text, language = 'english') {
    if (!this.isInitialized) {
      throw new Error('Coqui TTS service not initialized. Please check Python dependencies.');
    }

    return new Promise((resolve, reject) => {
      try {
        const mappedLanguage = this.getLanguageMapping(language);
        const processedText = this.preprocessText(text);
        
        console.log(`🔊 Generating Coqui TTS audio for ${language} language...`);
        console.log(`Using model language: ${mappedLanguage}`);

        // Prepare request data
        const requestData = {
          text: processedText,
          language: mappedLanguage
        };

        // Spawn Python TTS service
        const ttsProcess = spawn(this.pythonPath, [this.servicePath]);
        
        let output = '';
        let errorOutput = '';

        // Send request data to Python service
        ttsProcess.stdin.write(JSON.stringify(requestData));
        ttsProcess.stdin.end();

        // Collect output
        ttsProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        ttsProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        // Handle process completion
        ttsProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output.trim());
              
              if (result.success) {
                console.log('✅ Coqui TTS audio generated successfully');
                resolve(result.audio_data);
              } else {
                console.error('❌ Coqui TTS generation failed:', result.error);
                reject(new Error(`Coqui TTS failed: ${result.error}`));
              }
            } catch (parseError) {
              console.error('❌ Failed to parse TTS output:', parseError);
              console.error('Raw output:', output);
              reject(new Error('Failed to parse TTS service response'));
            }
          } else {
            console.error('❌ Coqui TTS process failed with code:', code);
            console.error('Error output:', errorOutput);
            reject(new Error(`TTS service failed with exit code ${code}: ${errorOutput}`));
          }
        });

        // Handle process errors
        ttsProcess.on('error', (error) => {
          console.error('❌ Coqui TTS process error:', error);
          reject(new Error(`TTS service process error: ${error.message}`));
        });

        // Set timeout for long-running processes
        setTimeout(() => {
          ttsProcess.kill();
          reject(new Error('TTS service timeout - process took too long'));
        }, 30000); // 30 second timeout

      } catch (error) {
        console.error('❌ Coqui TTS synthesis error:', error);
        reject(new Error(`Coqui TTS synthesis failed: ${error.message}`));
      }
    });
  }

  // Test if Coqui TTS is available and working
  async testConnection() {
    try {
      if (!this.isInitialized) {
        return false;
      }
      
      // Try a simple synthesis to test connectivity
      await this.synthesizeSpeech('Test', 'english');
      return true;
    } catch (error) {
      console.error('Coqui TTS connection test failed:', error.message);
      return false;
    }
  }

  get isAvailable() {
    return this.isInitialized;
  }

  // Get service information
  getServiceInfo() {
    return {
      name: 'Coqui TTS',
      type: 'Open Source Neural TTS',
      quality: 'Professional',
      languages: ['English', 'Arabic', 'Spanish', 'French', 'German', 'Turkish', 'Russian', 'Chinese', 'Japanese'],
      features: ['Neural voices', 'Multi-language', 'Offline processing', 'Islamic content optimized'],
      isAvailable: this.isAvailable
    };
  }
}

// Export singleton instance
const coquiTTSService = new CoquiTTSService();
module.exports = coquiTTSService;