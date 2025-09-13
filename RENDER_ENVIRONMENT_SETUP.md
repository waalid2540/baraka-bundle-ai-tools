# Environment Configuration for Existing Render Services

## ✅ Database Setup Complete
Your PostgreSQL database has been successfully initialized with all required tables:
- ✅ **users** - User accounts and authentication
- ✅ **products** - Payment products (Du'a Generator: $2.99, Story Generator: $2.99, Poster Generator: $3.99)
- ✅ **user_purchases** - Payment tracking
- ✅ **user_sessions** - Session management
- ✅ **user_access** - Access control
- ✅ **usage_logs** - Usage tracking

## 🔧 Environment Variables Setup

### For Your **Backend Service** on Render:

Add these environment variables in your Render Dashboard → Backend Service → Environment:

```bash
# Database Connection
DATABASE_URL=postgresql://waalid_legacy_db_user:dD5PV96lz21Zuh9Kd03lUuds15iZZbKt@dpg-d2rtj5m3jp1c738k0t20-a.oregon-postgres.render.com/waalid_legacy_db?sslmode=require

# Stripe Configuration (Get these from your Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=production
PORT=10000

# CORS Origins (Replace with your actual frontend URL)
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### For Your **Frontend Service** on Render:

Add these environment variables in your Render Dashboard → Frontend Service → Environment:

```bash
# API Configuration (Replace with your actual backend URL)
REACT_APP_API_URL=https://your-backend-url.onrender.com/api

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# OpenAI Configuration  
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Build Configuration
NODE_ENV=production
```

## 🚀 Required API Keys

### 1. Stripe Keys (Required for Payments)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. OpenAI API Key (Required for AI Features)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Create a new secret key
4. Copy the key (starts with `sk-`)

## 🔄 CORS Configuration Update

Update your backend's CORS configuration to include your actual frontend URL. In your backend service, update line 28-32 in `server.js`:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-actual-frontend-domain.onrender.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
```

## 📝 Step-by-Step Setup Instructions

### Step 1: Get Your Service URLs
1. Go to your Render Dashboard
2. Note down your **Backend Service URL** (something like `https://your-backend-name.onrender.com`)
3. Note down your **Frontend Service URL** (something like `https://your-frontend-name.onrender.com`)

### Step 2: Update Backend Environment Variables
1. Go to your **Backend Service** in Render Dashboard
2. Click **Environment** tab
3. Add all the backend environment variables listed above
4. Replace `your-backend-url` and `your-frontend-url` with your actual URLs
5. Add your actual Stripe and OpenAI API keys

### Step 3: Update Frontend Environment Variables
1. Go to your **Frontend Service** in Render Dashboard  
2. Click **Environment** tab
3. Add all the frontend environment variables listed above
4. Replace `your-backend-url` with your actual backend URL
5. Add your actual Stripe and OpenAI API keys

### Step 4: Redeploy Services
1. After adding environment variables, **redeploy both services**
2. Backend: Click **Manual Deploy** → **Deploy latest commit**
3. Frontend: Click **Manual Deploy** → **Deploy latest commit**

## 🧪 Testing the Integration

After deployment, test these endpoints:

### Backend Health Check
```
GET https://your-backend-url.onrender.com/api/health
```

### Frontend Payment Flow
1. Visit your frontend URL
2. Try accessing Du'a Generator, Story Generator, or Poster Generator
3. Click "Get Lifetime Access" button
4. Complete a test payment with Stripe test card: `4242 4242 4242 4242`

## 🔒 Payment Products Configured

The following products are now available in your database:

| Product | Price | Type | Description |
|---------|--------|------|-------------|
| Du'a Generator | $2.99 | `dua_generator` | Generate personalized Islamic prayers |
| Kids Story Generator | $2.99 | `story_generator` | Create Islamic children's stories |
| Name Poster Generator | $3.99 | `poster_generator` | Generate beautiful name posters |

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your frontend URL is added to backend CORS origins
2. **Database Connection Errors**: Verify the `DATABASE_URL` environment variable
3. **Payment Errors**: Check Stripe API keys are correctly set
4. **API Not Found**: Ensure backend URL in frontend matches your actual backend service URL

### Debug Steps:
1. Check service logs in Render Dashboard
2. Verify all environment variables are set
3. Ensure both services are deployed and running
4. Test backend API endpoints directly

## 📞 Next Steps

Once you provide your actual Render service URLs, I can help you:
1. Update the specific environment variables with your URLs
2. Test the integration
3. Fix any CORS or connection issues
4. Set up Stripe webhooks for production

Please share your:
- **Frontend URL**: `https://your-frontend-name.onrender.com`
- **Backend URL**: `https://your-backend-name.onrender.com`

And I'll help you complete the final configuration!