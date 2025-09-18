// Authentication Service for BarakahTool
interface User {
  id: number
  email: string
  name: string
  role: string
  email_verified: boolean
  purchased_features?: Array<{
    product_type: string
    has_access: boolean
    purchased_at: string
    expires_at: string
    payment_status: string
  }>
}

interface AuthResponse {
  success: boolean
  message: string
  user?: User
  token?: string
  error?: string
}

class AuthService {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = 'https://baraka-bundle-ai-tools.onrender.com/api'
    this.token = localStorage.getItem('authToken')
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('authToken', token)
    } else {
      localStorage.removeItem('authToken')
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token || localStorage.getItem('authToken')
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      const data = await response.json()

      if (data.success && data.token) {
        this.setToken(data.token)
      }

      return data
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: 'Registration failed',
        error: 'Network error'
      }
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success && data.token) {
        this.setToken(data.token)
      }

      return data
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'Login failed',
        error: 'Network error'
      }
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getAuthHeaders()
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user error:', error)
      return {
        success: false,
        error: 'Failed to get user data'
      }
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.setToken(null)
    }
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  // Admin functions
  async getUsers(): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        headers: this.getAuthHeaders()
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get users error:', error)
      return {
        success: false,
        error: 'Failed to get users'
      }
    }
  }

  async getUserDetails(userId: number): Promise<{ success: boolean; user?: any; purchases?: any[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        headers: this.getAuthHeaders()
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get user details error:', error)
      return {
        success: false,
        error: 'Failed to get user details'
      }
    }
  }

  async grantAccess(email: string, productType: string, expiresDays: number = 365): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/grant-access`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          email,
          product_type: productType,
          expires_days: expiresDays
        })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Grant access error:', error)
      return {
        success: false,
        error: 'Failed to grant access'
      }
    }
  }

  // Check if user has access to a specific feature
  hasFeatureAccess(user: User | null, featureType: string): boolean {
    if (!user || !user.purchased_features) return false

    return user.purchased_features.some(feature =>
      feature.product_type === featureType &&
      feature.has_access &&
      new Date(feature.expires_at) > new Date()
    )
  }
}

export const authService = new AuthService()
export default authService
export type { User, AuthResponse }