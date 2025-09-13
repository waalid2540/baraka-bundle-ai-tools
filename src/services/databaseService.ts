// Database Service for PostgreSQL Integration
// Handles user authentication, payments, and access control

interface User {
  id: number
  email: string
  name?: string
  stripe_customer_id?: string
  created_at: string
}

interface Product {
  id: number
  name: string
  description: string
  price_cents: number
  stripe_price_id?: string
  product_type: 'dua_generator' | 'story_generator' | 'poster_generator'
  is_active: boolean
}

interface UserPurchase {
  id: number
  user_id: number
  product_id: number
  stripe_payment_intent_id: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount_paid_cents: number
  purchased_at: string
  expires_at?: string
}

interface UserAccess {
  user_id: number
  email: string
  product_type: string
  has_access: boolean
  payment_status?: string
  purchased_at?: string
}

class DatabaseService {
  private apiUrl: string

  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
  }

  // User Management
  async createUser(email: string, name?: string): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }

    return response.json()
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const response = await fetch(`${this.apiUrl}/users/email/${encodeURIComponent(email)}`)
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/users/${userId}/stripe-customer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripe_customer_id: stripeCustomerId })
    })

    if (!response.ok) {
      throw new Error('Failed to update Stripe customer ID')
    }
  }

  // Product Management
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${this.apiUrl}/products`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    return response.json()
  }

  async getProductByType(productType: string): Promise<Product | null> {
    const response = await fetch(`${this.apiUrl}/products/type/${productType}`)
    
    if (response.status === 404) {
      return null
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch product')
    }

    return response.json()
  }

  // Purchase Management
  async createPurchase(
    userId: number, 
    productId: number, 
    stripePaymentIntentId: string,
    amountPaidCents: number,
    stripeSessionId?: string
  ): Promise<UserPurchase> {
    const response = await fetch(`${this.apiUrl}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        stripe_payment_intent_id: stripePaymentIntentId,
        stripe_session_id: stripeSessionId,
        amount_paid_cents: amountPaidCents,
        payment_status: 'pending'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create purchase')
    }

    return response.json()
  }

  async updatePurchaseStatus(
    paymentIntentId: string, 
    status: 'completed' | 'failed' | 'refunded'
  ): Promise<void> {
    const response = await fetch(`${this.apiUrl}/purchases/payment-intent/${paymentIntentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_status: status })
    })

    if (!response.ok) {
      throw new Error('Failed to update purchase status')
    }
  }

  async getUserPurchases(userId: number): Promise<UserPurchase[]> {
    const response = await fetch(`${this.apiUrl}/purchases/user/${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user purchases')
    }

    return response.json()
  }

  // Access Control
  async checkUserAccess(userId: number, productType: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/access/${userId}/${productType}`)
    
    if (response.status === 404) {
      return false
    }
    
    if (!response.ok) {
      throw new Error('Failed to check user access')
    }

    const { has_access } = await response.json()
    return has_access
  }

  async getUserAccess(userId: number): Promise<UserAccess[]> {
    const response = await fetch(`${this.apiUrl}/access/${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user access')
    }

    return response.json()
  }

  // Session Management
  async createSession(userId: number): Promise<string> {
    const response = await fetch(`${this.apiUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    if (!response.ok) {
      throw new Error('Failed to create session')
    }

    const { session_token } = await response.json()
    return session_token
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    const response = await fetch(`${this.apiUrl}/sessions/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_token: sessionToken })
    })

    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      throw new Error('Failed to validate session')
    }

    return response.json()
  }

  async deleteSession(sessionToken: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/sessions/${sessionToken}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete session')
    }
  }

  // Usage Tracking
  async logUsage(
    userId: number, 
    productType: string, 
    action: string, 
    metadata?: any
  ): Promise<void> {
    const response = await fetch(`${this.apiUrl}/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        product_type: productType,
        action,
        metadata
      })
    })

    if (!response.ok) {
      console.error('Failed to log usage')
      // Don't throw error for logging failures
    }
  }

  // Local Storage Helpers
  setAuthToken(token: string): void {
    localStorage.setItem('barakah_auth_token', token)
  }

  getAuthToken(): string | null {
    return localStorage.getItem('barakah_auth_token')
  }

  removeAuthToken(): void {
    localStorage.removeItem('barakah_auth_token')
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('barakah_current_user', JSON.stringify(user))
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('barakah_current_user')
    return userStr ? JSON.parse(userStr) : null
  }

  removeCurrentUser(): void {
    localStorage.removeItem('barakah_current_user')
  }

  // Authentication Flow
  async loginUser(email: string, name?: string): Promise<{ user: User; token: string }> {
    // Get or create user
    let user = await this.getUserByEmail(email)
    if (!user) {
      user = await this.createUser(email, name)
    }

    // Create session
    const token = await this.createSession(user.id)

    // Store locally
    this.setAuthToken(token)
    this.setCurrentUser(user)

    return { user, token }
  }

  async logoutUser(): Promise<void> {
    const token = this.getAuthToken()
    if (token) {
      try {
        await this.deleteSession(token)
      } catch (error) {
        console.error('Failed to delete session:', error)
      }
    }

    this.removeAuthToken()
    this.removeCurrentUser()
  }

  async getCurrentSession(): Promise<User | null> {
    const token = this.getAuthToken()
    if (!token) {
      return null
    }

    try {
      const user = await this.validateSession(token)
      if (user) {
        this.setCurrentUser(user)
      } else {
        this.removeAuthToken()
        this.removeCurrentUser()
      }
      return user
    } catch (error) {
      console.error('Session validation failed:', error)
      this.removeAuthToken()
      this.removeCurrentUser()
      return null
    }
  }
}

export const databaseService = new DatabaseService()
export default databaseService