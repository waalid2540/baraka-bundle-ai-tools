"""
BarakahTool Enterprise Dua Service
Professional AI-powered Islamic content generation
"""

import openai
import os
from typing import Dict, Optional
import re
from decouple import config

class DuaService:
    def __init__(self):
        """Initialize the Dua service with OpenAI"""
        self.client = openai.AsyncOpenAI(
            api_key=config('OPENAI_API_KEY', default='')
        )
        self.model = "gpt-4-turbo-preview"
    
    async def generate_dua(self, situation: str, language: str = "English", premium: bool = False) -> Dict:
        """
        Generate authentic Islamic dua using advanced AI
        """
        try:
            # Create enhanced prompt for premium users
            system_prompt = self._create_system_prompt(premium)
            user_prompt = self._create_user_prompt(situation, language, premium)
            
            # Generate dua using OpenAI
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500 if premium else 800
            )
            
            # Parse the response
            content = response.choices[0].message.content
            parsed_dua = self._parse_dua_response(content, language)
            
            return parsed_dua
            
        except Exception as e:
            print(f"Dua generation error: {str(e)}")
            # Return fallback dua
            return self._get_fallback_dua(situation, language)
    
    def _create_system_prompt(self, premium: bool = False) -> str:
        """Create system prompt for AI"""
        base_prompt = """You are an expert Islamic scholar and dua generator specializing in authentic Islamic supplications from the Quran and Sunnah.

CRITICAL REQUIREMENTS:
- Generate ONLY authentic duas based on Quranic verses and authentic Hadith
- Write Arabic text with proper tashkeel (diacritical marks)
- Keep duas meaningful but concise (2-5 lines maximum)
- Use respectful invocations like "اللَّهُمَّ" (Allahumma), "يَا رَبِّ" (Ya Rabbi)
- Provide clear transliteration for pronunciation
- Give natural, heartfelt translations

Format your response EXACTLY as:

**Arabic:**
[Arabic text with complete tashkeel]

**Transliteration:**
[Clear pronunciation guide using Latin letters]

**Translation in [language]:**
[Natural translation]
"""
        
        if premium:
            premium_addition = """
PREMIUM FEATURES (Enhanced):
- Include deeper spiritual context and references
- Add Quranic verse references when applicable
- Provide additional variations or related duas
- Include timing recommendations for maximum blessing
- More detailed transliteration with stress marks
"""
            return base_prompt + premium_addition
        
        return base_prompt
    
    def _create_user_prompt(self, situation: str, language: str, premium: bool = False) -> str:
        """Create user prompt"""
        base_request = f"""Generate an authentic Islamic dua for this situation: "{situation}"

Language for translation: {language}

Please follow the exact format specified and ensure the dua is:
1. Authentic from Quran/Sunnah sources
2. Appropriate for the situation
3. Spiritually meaningful
4. Properly formatted with complete Arabic tashkeel"""
        
        if premium:
            base_request += f"""

PREMIUM REQUEST: Please provide enhanced content with:
- Quranic references if applicable
- Additional spiritual context
- Detailed pronunciation guide
- Best times for recitation
"""
        
        return base_request
    
    def _parse_dua_response(self, content: str, language: str) -> Dict:
        """Parse the AI response into structured data"""
        try:
            # Extract Arabic text
            arabic_match = re.search(r'\*\*Arabic:\*\*\s*(.*?)(?=\n\*\*|\n\n|$)', content, re.DOTALL | re.IGNORECASE)
            arabic_text = arabic_match.group(1).strip() if arabic_match else ""
            
            # Extract transliteration
            transliteration_match = re.search(r'\*\*Transliteration:\*\*\s*(.*?)(?=\n\*\*|\n\n|$)', content, re.DOTALL | re.IGNORECASE)
            transliteration = transliteration_match.group(1).strip() if transliteration_match else ""
            
            # Extract translation
            translation_pattern = rf'\*\*Translation.*?:\*\*\s*(.*?)(?=\n\*\*|\n\n|$)'
            translation_match = re.search(translation_pattern, content, re.DOTALL | re.IGNORECASE)
            translation = translation_match.group(1).strip() if translation_match else ""
            
            # Clean up the extracted text
            arabic_text = self._clean_text(arabic_text)
            transliteration = self._clean_text(transliteration)
            translation = self._clean_text(translation)
            
            return {
                'arabic': arabic_text,
                'transliteration': transliteration,
                'translation': translation,
                'language': language,
                'source': 'ai_generated'
            }
            
        except Exception as e:
            print(f"Parsing error: {str(e)}")
            # Return basic parsed content
            return {
                'arabic': self._extract_arabic_fallback(content),
                'transliteration': '',
                'translation': content[:200] + '...' if len(content) > 200 else content,
                'language': language,
                'source': 'ai_generated'
            }
    
    def _clean_text(self, text: str) -> str:
        """Clean and format text"""
        if not text:
            return ""
        
        # Remove extra whitespace and newlines
        text = re.sub(r'\n+', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Remove any remaining markdown formatting
        text = re.sub(r'\*\*', '', text)
        text = re.sub(r'\*', '', text)
        
        return text
    
    def _extract_arabic_fallback(self, content: str) -> str:
        """Fallback method to extract Arabic text"""
        # Look for Arabic characters
        arabic_pattern = r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+'
        arabic_matches = re.findall(arabic_pattern, content)
        
        if arabic_matches:
            # Return the longest Arabic match
            return max(arabic_matches, key=len)
        
        return "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ"  # Fallback dua
    
    def _get_fallback_dua(self, situation: str, language: str) -> Dict:
        """Return a fallback dua when AI generation fails"""
        fallback_duas = {
            'general': {
                'arabic': 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                'transliteration': 'Rabbana atina fi\'d-dunya hasanatan wa fi\'l-akhirati hasanatan wa qina azab an-nar',
                'translation': 'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.'
            },
            'success': {
                'arabic': 'اللَّهُمَّ أَعِنِّي وَلَا تُعِنْ عَلَيَّ وَانْصُرْنِي وَلَا تَنْصُرْ عَلَيَّ',
                'transliteration': 'Allahumma a\'inni wa la tu\'in alayya, wansurni wa la tansur alayya',
                'translation': 'O Allah, help me and do not help against me, support me and do not support against me.'
            }
        }
        
        # Choose appropriate fallback
        if any(word in situation.lower() for word in ['success', 'work', 'business', 'job']):
            selected_dua = fallback_duas['success']
        else:
            selected_dua = fallback_duas['general']
        
        return {
            'arabic': selected_dua['arabic'],
            'transliteration': selected_dua['transliteration'],
            'translation': selected_dua['translation'],
            'language': language,
            'source': 'fallback'
        }

# Create singleton instance
dua_service = DuaService()