// Test DALL-E through backend API
const fetch = require('node-fetch');

async function testBackendDalle() {
  console.log('🎨 Testing DALL-E through backend API...');

  const apiUrl = 'https://baraka-bundle-ai-tools.onrender.com/api/generate/dalle-image';

  try {
    const requestBody = {
      type: 'book-cover',
      title: 'Ahmed and the Golden Heart',
      theme: 'kindness',
      ageGroup: '6-9'
    };

    console.log('📨 Sending request to:', apiUrl);
    console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (data.success && data.imageUrl) {
      console.log('✅ SUCCESS! Real DALL-E image generated!');
      console.log('🖼️ Image URL:', data.imageUrl);
      console.log('\n👉 Open this URL in your browser to see the image:', data.imageUrl);
    } else {
      console.error('❌ Failed:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

testBackendDalle();