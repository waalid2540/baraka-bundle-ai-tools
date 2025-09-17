// Test OpenAI TTS Audio Generation
const fetch = require('node-fetch');
require('dotenv').config();

async function testAudioGeneration() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }

  console.log('🔊 Testing OpenAI TTS API...');
  console.log(`API Key: ${OPENAI_API_KEY.substring(0, 10)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 4)}`);

  const testText = "Bismillah. This is a test of the Islamic story audio generation. May Allah bless this endeavor.";

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: testText,
        voice: 'nova',
        speed: 0.9
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', errorText);
      return;
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ Audio generated successfully!');
    console.log('Audio size:', audioBuffer.byteLength, 'bytes');

    // Save to file for testing
    const fs = require('fs');
    const buffer = Buffer.from(audioBuffer);
    fs.writeFileSync('test-audio.mp3', buffer);
    console.log('✅ Audio saved to test-audio.mp3');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAudioGeneration();