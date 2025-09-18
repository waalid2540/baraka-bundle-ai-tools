import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import authService, { User } from '../services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasAccess: (featureType: string) => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on component mount
  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    if (authService.isLoggedIn()) {
      try {
        const response = await authService.getCurrentUser()
        if (response.success && response.user) {
          setUser(response.user)
        } else {
          // Token might be expired, clear it
          authService.setToken(null)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        authService.setToken(null)
      }
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)

      if (response.success && response.user) {
        setUser(response.user)
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error || 'Login failed' }
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' }
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.register(email, password, name)

      if (response.success && response.user) {
        setUser(response.user)
        return { success: true, message: response.message }
      } else {
        return { success: false, message: response.error || 'Registration failed' }
      }
    } catch (error) {
      return { success: false, message: 'Network error occurred' }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if logout request fails
      setUser(null)
    }
  }

  const refreshUser = async () => {
    if (authService.isLoggedIn()) {
      try {
        const response = await authService.getCurrentUser()
        if (response.success && response.user) {
          setUser(response.user)
        }
      } catch (error) {
        console.error('Error refreshing user:', error)
      }
    }
  }

  const hasAccess = (featureType: string): boolean => {
    return authService.hasFeatureAccess(user, featureType)
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    hasAccess,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext