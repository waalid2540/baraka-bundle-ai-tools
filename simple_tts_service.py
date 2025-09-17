#!/usr/bin/env python3
"""
Simple Professional TTS Service for Islamic Content
Uses pyttsx3 for offline high-quality speech synthesis
"""

import sys
import json
import base64
import io
import tempfile
import os
from pathlib import Path

try:
    import pyttsx3
    import wave
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

class SimpleTTSService:
    def __init__(self):
        self.engine = None
        self.is_initialized = False
        if TTS_AVAILABLE:
            self.init_engine()
        
    def init_engine(self):
        """Initialize pyttsx3 TTS engine with professional settings"""
        try:
            self.engine = pyttsx3.init()
            
            # Configure professional voice settings
            voices = self.engine.getProperty('voices')
            
            # Find the best quality voice
            preferred_voice = None
            for voice in voices:
                # Prefer female voices for Islamic children's content
                if 'female' in voice.name.lower() or 'woman' in voice.name.lower():
                    preferred_voice = voice
                    break
                # Fallback to any clear voice
                elif 'clear' in voice.name.lower() or 'default' in voice.name.lower():
                    preferred_voice = voice
            
            if preferred_voice:
                self.engine.setProperty('voice', preferred_voice.id)
                print(f"🔊 Using voice: {preferred_voice.name}", file=sys.stderr)
            
            # Professional audio settings
            self.engine.setProperty('rate', 160)    # Slower for children
            self.engine.setProperty('volume', 0.9)  # High volume
            
            self.is_initialized = True
            print("✅ Professional TTS engine initialized", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Failed to initialize TTS engine: {e}", file=sys.stderr)
            self.is_initialized = False
    
    def preprocess_islamic_text(self, text):
        """Professional preprocessing for Islamic content"""
        # Limit text length for better quality
        text = text[:800]
        
        # Add natural pauses for better narration
        text = text.replace('.', '. ')
        text = text.replace(',', ', ')
        text = text.replace(':', ': ')
        text = text.replace(';', '; ')
        
        # Ensure proper spacing
        text = ' '.join(text.split())
        
        # Handle Islamic terms with proper pronunciation
        islamic_replacements = {
            'Allah': 'Allah',
            'Muhammad': 'Muhammad',
            'Quran': 'Quran', 
            'Qur\'an': 'Quran',
            'Bismillah': 'Bismillah',
            'Alhamdulillah': 'Alhamdulillah',
            'Subhanallah': 'Subhanallah',
            'Mashallah': 'Mashallah',
            'Inshallah': 'Inshallah',
            'Astaghfirullah': 'Astaghfirullah'
        }
        
        for arabic, replacement in islamic_replacements.items():
            text = text.replace(arabic, replacement)
            text = text.replace(arabic.lower(), replacement)
            text = text.replace(arabic.upper(), replacement)
        
        return text
    
    def synthesize_speech(self, text, language='english'):
        """Generate professional speech synthesis"""
        if not self.is_initialized or not self.engine:
            raise Exception("TTS engine not initialized")
        
        try:
            # Preprocess text for Islamic content
            processed_text = self.preprocess_islamic_text(text)
            print(f"🔊 Generating speech: {processed_text[:50]}...", file=sys.stderr)
            
            # Create temporary file for audio
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_path = tmp_file.name
            
            try:
                # Generate speech to file
                self.engine.save_to_file(processed_text, tmp_path)
                self.engine.runAndWait()
                
                # Read the generated audio file
                with open(tmp_path, 'rb') as audio_file:
                    audio_data = audio_file.read()
                
                # Convert to base64
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                
                print("✅ Professional speech synthesis completed", file=sys.stderr)
                return f"data:audio/wav;base64,{audio_base64}"
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    
        except Exception as e:
            print(f"❌ Speech synthesis failed: {e}", file=sys.stderr)
            raise e

def main():
    """Main service entry point"""
    try:
        if not TTS_AVAILABLE:
            raise Exception("pyttsx3 library not available. Please install: pip install pyttsx3")
        
        # Read input from stdin
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            raise ValueError("No input data provided")
        
        # Parse JSON input
        try:
            request = json.loads(input_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {e}")
        
        # Validate required fields
        if 'text' not in request:
            raise ValueError("Missing 'text' field in request")
        
        text = request['text']
        language = request.get('language', 'english')
        
        # Initialize TTS service
        tts_service = SimpleTTSService()
        
        if not tts_service.is_initialized:
            raise Exception("Failed to initialize professional TTS service")
        
        # Generate speech
        audio_data = tts_service.synthesize_speech(text, language)
        
        # Return result
        result = {
            'success': True,
            'audio_data': audio_data,
            'language': language,
            'text_length': len(text),
            'service': 'Professional pyttsx3 TTS'
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        # Return error
        error_result = {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }
        
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()