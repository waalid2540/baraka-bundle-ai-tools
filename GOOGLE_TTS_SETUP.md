# Google Cloud Text-to-Speech Setup Guide

This application now uses Google Cloud Text-to-Speech for professional audio generation instead of OpenAI TTS.

## Why Google TTS?

✅ **Better voice quality** - Neural voices with natural prosody  
✅ **More languages supported** - 220+ voices in 40+ languages  
✅ **Cost-effective** - Lower cost per character than OpenAI  
✅ **No API key leaks** - Uses service account credentials  
✅ **Islamic language support** - Better Arabic pronunciation  

## Setup Instructions

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Text-to-Speech API**
4. Enable billing for the project

### 2. Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `baraka-tts-service`
4. Grant role: **Cloud Text-to-Speech Client**
5. Click **Create and Continue**
6. Click **Done**

### 3. Generate Service Account Key

1. Click on your service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the JSON file
6. **Keep this file secure!**

### 4. Configure Environment Variables

#### For Local Development:
```bash
# Set the path to your service account key file
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

#### For Production (Render/Heroku):
Add environment variable:
```
GOOGLE_APPLICATION_CREDENTIALS=/tmp/google-credentials.json
```

Then upload your JSON file content as:
```
GOOGLE_CLOUD_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project-id",...}
```

### 5. Update Production Server

For Render deployment, add this to your server startup:

```javascript
// In server.js - add this before starting the server
if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
  const fs = require('fs');
  fs.writeFileSync('/tmp/google-credentials.json', process.env.GOOGLE_CLOUD_CREDENTIALS_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/tmp/google-credentials.json';
}
```

## Pricing

Google Cloud TTS pricing is very reasonable:
- **Standard voices**: $4.00 per 1 million characters
- **Neural voices**: $16.00 per 1 million characters  
- **First 1 million characters free each month**

## Voice Quality

Google TTS provides:
- **Neural voices** for English, Arabic, French, German, etc.
- **Child-friendly settings** (higher pitch, slower rate)
- **Excellent Arabic pronunciation** for Islamic content
- **Multiple voice options** per language

## Testing

Once configured, the system will automatically:
1. Try Google TTS first
2. Fall back to browser TTS if Google fails
3. Show clear error messages if neither works

## Troubleshooting

**Error: "Google Cloud credentials not configured"**
- Check your service account key is valid
- Verify GOOGLE_APPLICATION_CREDENTIALS points to correct file
- Ensure Text-to-Speech API is enabled

**Error: "Google Cloud TTS quota exceeded"**
- Check your billing is enabled
- Monitor usage in Google Cloud Console

**Error: "Permission denied"**
- Verify service account has Text-to-Speech Client role
- Check API is enabled for your project

## Next Steps

After setup:
1. Deploy with new environment variables
2. Test audio generation 
3. Enjoy high-quality multilingual TTS!

The system now provides professional-grade audio generation for your Islamic stories and duas.