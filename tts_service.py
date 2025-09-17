#!/usr/bin/env python3
"""
Professional Coqui TTS Service for Islamic Content
High-quality neural voice synthesis with multi-language support
"""

import sys
import json
import base64
import io
import tempfile
import os
from pathlib import Path
import torch
from TTS.api import TTS
import soundfile as sf
import numpy as np

class ProfessionalTTSService:
    def __init__(self):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🔊 TTS Service initialized on {self.device}", file=sys.stderr)
        
    def get_model_for_language(self, language):
        """Get the best professional model for each language"""
        language_models = {
            'english': 'tts_models/en/ljspeech/tacotron2-DDC_ph',
            'arabic': 'tts_models/en/ljspeech/tacotron2-DDC_ph',  # Use English for Arabic content
            'spanish': 'tts_models/es/mai/tacotron2-DDC',
            'french': 'tts_models/fr/mai/tacotron2-DDC',
            'german': 'tts_models/de/thorsten/tacotron2-DDC',
            'chinese': 'tts_models/zh-CN/baker/tacotron2-DDC-GST',
            'japanese': 'tts_models/ja/kokoro/tacotron2-DDC',
            'russian': 'tts_models/ru/ruslan/tacotron2-DDC',
            'turkish': 'tts_models/tr/common-voice/glow-tts',
            'italian': 'tts_models/it/mai_female/glow-tts'
        }
        
        model_name = language_models.get(language.lower(), language_models['english'])
        
        # Load model if not already loaded
        if model_name not in self.models:
            try:
                print(f"📥 Loading {model_name} for {language}...", file=sys.stderr)
                self.models[model_name] = TTS(model_name=model_name, progress_bar=False).to(self.device)
                print(f"✅ Model {model_name} loaded successfully", file=sys.stderr)
            except Exception as e:
                print(f"❌ Failed to load {model_name}: {e}", file=sys.stderr)
                # Fallback to default English model
                if 'tts_models/en/ljspeech/tacotron2-DDC_ph' not in self.models:
                    self.models['tts_models/en/ljspeech/tacotron2-DDC_ph'] = TTS(
                        model_name='tts_models/en/ljspeech/tacotron2-DDC_ph', 
                        progress_bar=False
                    ).to(self.device)
                model_name = 'tts_models/en/ljspeech/tacotron2-DDC_ph'
        
        return self.models[model_name]
    
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
    
    def post_process_audio(self, audio_data, sample_rate=22050):
        """Professional audio post-processing for children's content"""
        # Normalize audio
        audio_data = audio_data / np.max(np.abs(audio_data))
        
        # Apply gentle compression for consistent volume
        audio_data = np.tanh(audio_data * 0.8)
        
        # Slight pitch adjustment for more pleasant sound
        # This is a simplified approach - for production you might want more sophisticated processing
        
        return audio_data
    
    def synthesize_speech(self, text, language='english'):
        """Generate professional speech synthesis"""
        try:
            # Preprocess text for Islamic content
            processed_text = self.preprocess_islamic_text(text)
            print(f"🔊 Generating speech for: {processed_text[:50]}...", file=sys.stderr)
            
            # Get appropriate model
            tts_model = self.get_model_for_language(language)
            
            # Generate audio with temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                tmp_path = tmp_file.name
            
            try:
                # Generate speech
                tts_model.tts_to_file(
                    text=processed_text,
                    file_path=tmp_path
                )
                
                # Load and process audio
                audio_data, sample_rate = sf.read(tmp_path)
                
                # Post-process for professional quality
                audio_data = self.post_process_audio(audio_data, sample_rate)
                
                # Convert to MP3-compatible format
                audio_buffer = io.BytesIO()
                sf.write(audio_buffer, audio_data, sample_rate, format='WAV')
                audio_buffer.seek(0)
                
                # Convert to base64
                audio_base64 = base64.b64encode(audio_buffer.getvalue()).decode('utf-8')
                
                print("✅ Speech synthesis completed successfully", file=sys.stderr)
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
        tts_service = ProfessionalTTSService()
        
        # Generate speech
        audio_data = tts_service.synthesize_speech(text, language)
        
        # Return result
        result = {
            'success': True,
            'audio_data': audio_data,
            'language': language,
            'text_length': len(text)
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