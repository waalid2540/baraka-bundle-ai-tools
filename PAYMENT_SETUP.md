# BarakahTool Payment & Database Integration Setup

Complete setup guide for PostgreSQL database and Stripe payment integration.

## 🗄️ Database Setup (PostgreSQL)

### 1. Connect to Your Existing Database
```bash
# Connect to your existing PostgreSQL database
psql -h localhost -U your_username -d waalid_legacy_db_user
```

### 2. Run Database Schema
```bash
# Execute the schema file
\i database/schema.sql
```

This will create:
- `users` table for authentication
- `products` table for the three products (Dua, Story, Poster generators)
- `user_purchases` table for tracking payments
- `user_sessions` table for session management
- `usage_logs` table for analytics

### 3. Verify Tables Created
```sql
\dt
-- Should show: users, products, user_purchases, user_sessions, usage_logs
```

## 💳 Stripe Setup

### 1. Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Publishable Key** and **Secret Key**
3. For testing, use the test keys (starting with `pk_test_` and `sk_test_`)

### 2. Configure Environment Variables
Update your `.env` file:
```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
REACT_APP_ENABLE_STRIPE=true

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/waalid_legacy_db_user
DB_HOST=localhost
DB_PORT=5432
DB_NAME=waalid_legacy_db_user
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
```

## 🚀 Backend Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:3001`

### 3. Initialize Database (if needed)
```bash
npm run init-db
```

## 🎯 Frontend Integration

The payment system is already integrated into:

### Du'a Generator (`/dua-generator`)
- Shows pricing: **$2.99** for lifetime access
- Payment gateway modal on click
- Access control: generates unlimited du'as after payment

### Kids Story Generator (`/kids-story-generator`)
- Shows pricing: **$2.99** for lifetime access  
- Includes DALL-E illustrations and audio
- Access control after payment

### Name Poster Generator (`/name-poster-generator`)
- Shows pricing: **$3.99** for lifetime access
- Islamic calligraphy posters
- Access control after payment

## 🔄 Payment Flow

### 1. User Flow
1. User visits any generator (Dua/Story/Poster)
2. System checks if user has access
3. If no access → Shows payment form
4. User enters email/name → Redirects to Stripe Checkout
5. After successful payment → Redirects to success page
6. User gains lifetime access to that product

### 2. Database Updates
- User record created/updated
- Purchase record created with Stripe payment ID
- Access automatically granted
- Usage tracked for analytics

## 🛡️ Security Features

- **Rate limiting**: 100 requests per 15 minutes
- **Input validation**: All user inputs sanitized
- **Secure headers**: Helmet.js protection
- **CORS protection**: Only allowed origins
- **Session management**: Secure token-based auth
- **Payment verification**: Double-check with Stripe

## 📊 Admin Features

### View Users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### View Purchases
```sql
SELECT 
    u.email, 
    p.name as product_name, 
    up.amount_paid_cents/100 as amount_usd,
    up.purchased_at
FROM user_purchases up
JOIN users u ON up.user_id = u.id
JOIN products p ON up.product_id = p.id
WHERE up.payment_status = 'completed'
ORDER BY up.purchased_at DESC;
```

### View Usage Analytics
```sql
SELECT 
    product_type,
    action,
    COUNT(*) as usage_count,
    DATE(created_at) as date
FROM usage_logs
GROUP BY product_type, action, DATE(created_at)
ORDER BY date DESC;
```

## 🚀 Deployment

### Backend (Render/Railway/Vercel)
1. Set environment variables in your hosting platform
2. Connect to your PostgreSQL database
3. Deploy the `backend/` folder

### Frontend
1. Update `REACT_APP_API_URL` to your backend URL
2. Deploy the React app

## 🔧 Testing

### Test Payment Flow
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date and CVC
3. Test successful and failed payments

### Test Database
```bash
# Check connection
node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows[0]); pool.end(); })"
```

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Check backend logs: `npm run dev`
3. Verify environment variables are set
4. Test database connection

---

## 🎉 You're Ready!

Once everything is set up:
- Users can purchase each product individually
- Payments are processed securely through Stripe
- Access is granted automatically after payment
- All data is stored in your PostgreSQL database
- Usage analytics are tracked for insights

Your Islamic digital tools now have a complete payment and user management system! 🚀