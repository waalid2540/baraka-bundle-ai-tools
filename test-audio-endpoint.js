// Test the audio generation endpoint directly
const fetch = require('node-fetch');

async function testAudioEndpoint() {
  console.log('🧪 Testing audio generation endpoint...\n');

  const testStory = "Once upon a time, in the beautiful city of Medina, there lived a kind boy named Ahmad who loved to help others.";

  try {
    const response = await fetch('http://localhost:3003/api/generate/story-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        storyText: testStory,
        language: 'english'
      })
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers.raw());

    const result = await response.json();
    console.log('\nResponse Body:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Audio generation successful!');
      console.log('Audio type:', result.type);
      console.log('Audio quality:', result.quality);
      if (result.audioData) {
        console.log('Audio data length:', result.audioData.length);
      }
      if (result.audioUrl) {
        console.log('Audio URL:', result.audioUrl);
      }
    } else {
      console.log('\n❌ Audio generation failed!');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// First, let's start the server in the background
console.log('Starting server...');
const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], {
  env: { ...process.env }
});

server.stdout.on('data', (data) => {
  console.log(`Server: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server Error: ${data}`);
});

// Wait a bit for server to start, then test
setTimeout(() => {
  testAudioEndpoint().then(() => {
    console.log('\n🏁 Test complete, stopping server...');
    server.kill();
    process.exit(0);
  });
}, 3000);