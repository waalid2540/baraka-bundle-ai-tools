# Deployment Instructions for Baraka Bundle AI Tools

## Important: Environment Variables Setup on Render

After pushing to GitHub, you need to configure the environment variables in Render:

### 1. Go to your Render Dashboard
Visit https://dashboard.render.com and find your `baraka-bundle-ai-tools` service.

### 2. Add Environment Variables
Go to the "Environment" tab and add these variables:

#### Required Variables:
- `OPENAI_API_KEY` - Your OpenAI API key (starts with sk-...)
- `DATABASE_URL` - Your PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

#### Optional Variables (if using):
- `SUPABASE_URL` - Your Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. Deploy the Latest Changes
After setting the environment variables:
1. Click "Manual Deploy" > "Deploy latest commit"
2. Wait for the build to complete
3. Check the logs to ensure the server starts correctly

### 4. Verify Audio Generation
The server logs should show:
```
🔍 Environment Check at Startup:
OPENAI_API_KEY exists: true
OPENAI_API_KEY format: sk-proj-...
```

If you see `OPENAI_API_KEY exists: false`, the environment variable is not set correctly.

## Testing Audio Generation

Once deployed, test the audio generation:

1. Go to your app URL
2. Navigate to the Kids Story Generator
3. Generate a story
4. The audio should generate successfully using OpenAI TTS

## Troubleshooting

### If audio generation fails:
1. Check Render logs for error messages
2. Verify OPENAI_API_KEY is set in Render environment
3. Ensure the API key is valid and has credits
4. Check that the render.yaml is using `env: node` not `env: static`

### Common Issues:
- **"OPENAI_API_KEY not found"**: Environment variable not set in Render
- **"401 Unauthorized"**: Invalid or expired OpenAI API key
- **"429 Rate Limit"**: OpenAI API rate limit reached
- **"Insufficient Credits"**: Add credits to your OpenAI account

## Local Development

For local testing:
```bash
# Install dependencies
npm install

# Run the server
node server.js

# Or run with npm
npm start
```

Make sure your `.env` file has:
```
OPENAI_API_KEY=your-api-key-here
```

## Support

If issues persist, check:
1. Render service logs
2. Browser console for frontend errors
3. Network tab for API response details