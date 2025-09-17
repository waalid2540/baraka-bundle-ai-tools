#!/usr/bin/env python3
"""
Lightweight TTS Service for Production Deployment
Uses text processing to create professional audio metadata
"""

import sys
import json
import base64
import hashlib
import time

class LightweightTTSService:
    def __init__(self):
        self.is_initialized = True
        print("✅ Lightweight TTS Service initialized", file=sys.stderr)
        
    def preprocess_islamic_text(self, text):
        """Professional preprocessing for Islamic content"""
        # Limit text length for better quality
        text = text[:1000]
        
        # Add natural pauses for better narration
        text = text.replace('.', '. ')
        text = text.replace(',', ', ')
        text = text.replace(':', ': ')
        text = text.replace(';', '; ')
        
        # Ensure proper spacing
        text = ' '.join(text.split())
        
        # Handle Islamic terms with proper pronunciation hints
        islamic_replacements = {
            'Allah': 'Allah',
            'Muhammad': 'Muhammad', 
            'Quran': 'Quran',
            'Bismillah': 'Bismillah',
            'Alhamdulillah': 'Alhamdulillah',
            'Subhanallah': 'Subhanallah',
            'Mashallah': 'Mashallah',
            'Inshallah': 'Inshallah'
        }
        
        for arabic, replacement in islamic_replacements.items():
            text = text.replace(arabic, replacement)
            text = text.replace(arabic.lower(), replacement)
            text = text.replace(arabic.upper(), replacement)
        
        return text
    
    def generate_audio_metadata(self, text, language='english'):
        """Generate audio metadata for frontend TTS processing"""
        try:
            processed_text = self.preprocess_islamic_text(text)
            
            # Create audio processing instructions
            audio_config = {
                'text': processed_text,
                'language': language,
                'voice_settings': {
                    'rate': 0.85,  # Slower for children
                    'pitch': 1.1,  # Higher pitch
                    'volume': 0.9,
                    'emphasis': 'moderate'
                },
                'islamic_terms': [
                    'Allah', 'Muhammad', 'Quran', 'Bismillah', 
                    'Alhamdulillah', 'Subhanallah', 'Mashallah', 'Inshallah'
                ],
                'processing_hints': {
                    'pause_after_sentences': 0.5,
                    'pause_after_commas': 0.3,
                    'emphasis_islamic_terms': True,
                    'child_friendly': True
                }
            }
            
            # Generate a unique ID for this audio
            text_hash = hashlib.md5(processed_text.encode()).hexdigest()[:8]
            audio_id = f"islamic_story_{text_hash}"
            
            print(f"🔊 Generated audio metadata for: {processed_text[:50]}...", file=sys.stderr)
            
            # Return metadata that frontend can use for enhanced browser TTS
            return {
                'success': True,
                'audio_id': audio_id,
                'audio_config': audio_config,
                'processing_instructions': 'use_enhanced_browser_tts',
                'fallback_ready': True
            }
            
        except Exception as e:
            print(f"❌ Metadata generation failed: {e}", file=sys.stderr)
            raise e

def main():
    """Main service entry point"""
    try:
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
        tts_service = LightweightTTSService()
        
        # Generate enhanced metadata for frontend processing
        result = tts_service.generate_audio_metadata(text, language)
        
        print(json.dumps(result))
        
    except Exception as e:
        # Return error
        error_result = {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
            'fallback_to_browser': True
        }
        
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()