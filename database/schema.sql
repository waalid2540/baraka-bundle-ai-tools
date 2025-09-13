-- BarakahTool Database Schema for waalid_legacy_db_user
-- PostgreSQL database schema for payment and user management

-- Users table for authentication and tracking
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    stripe_customer_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table for the three main products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL,
    stripe_price_id VARCHAR(255),
    product_type VARCHAR(50) NOT NULL, -- 'dua_generator', 'story_generator', 'poster_generator'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User purchases table to track what users have bought
CREATE TABLE IF NOT EXISTS user_purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_session_id VARCHAR(255),
    amount_paid_cents INTEGER NOT NULL,
    currency VARCHAR(10) DEFAULT 'usd',
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- For subscription-based products (null = lifetime)
    UNIQUE(user_id, product_id)
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking for analytics
CREATE TABLE IF NOT EXISTS usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'generate_dua', 'generate_story', 'generate_poster'
    metadata JSONB, -- Store generation parameters and results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default products
INSERT INTO products (name, description, price_cents, product_type) VALUES
('Du''a Generator', 'Generate beautiful Islamic du''as with Arabic text and translations', 299, 'dua_generator'),
('Kids Story Generator', 'Create Islamic stories for children with illustrations and audio', 299, 'story_generator'),
('Name Poster Generator', 'Generate beautiful Islamic calligraphy posters with names', 399, 'poster_generator')
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product_id ON user_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_product_type ON usage_logs(product_type);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for user access permissions
CREATE OR REPLACE VIEW user_access AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    p.product_type,
    up.payment_status,
    up.purchased_at,
    up.expires_at,
    CASE 
        WHEN up.payment_status = 'completed' AND (up.expires_at IS NULL OR up.expires_at > CURRENT_TIMESTAMP)
        THEN true 
        ELSE false 
    END as has_access
FROM users u
CROSS JOIN products p
LEFT JOIN user_purchases up ON u.id = up.user_id AND p.id = up.product_id
WHERE p.is_active = true;