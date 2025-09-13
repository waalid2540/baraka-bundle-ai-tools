import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  name?: string
  hasAccess: {
    dua_generator: boolean
    story_generator: boolean
    poster_generator: boolean
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, name?: string) => Promise<boolean>
  logout: () => void
  checkAccess: (productType: 'dua_generator' | 'story_generator' | 'poster_generator') => boolean
  refreshAccess: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
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
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkExistingLogin()
  }, [])

  const checkExistingLogin = async () => {
    try {
      const savedUser = localStorage.getItem('barakah_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        await refreshUserAccess(userData)
      }
    } catch (error) {
      console.error('Failed to check existing login:', error)
      localStorage.removeItem('barakah_user')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserAccess = async (userData: any) => {
    try {
      // Check access for all products
      const accessChecks = await Promise.all([
        checkProductAccess(userData.email, 'dua_generator'),
        checkProductAccess(userData.email, 'story_generator'),
        checkProductAccess(userData.email, 'poster_generator')
      ])

      const userWithAccess: User = {
        ...userData,
        hasAccess: {
          dua_generator: accessChecks[0],
          story_generator: accessChecks[1],
          poster_generator: accessChecks[2]
        }
      }

      setUser(userWithAccess)
      localStorage.setItem('barakah_user', JSON.stringify(userWithAccess))
    } catch (error) {
      console.error('Failed to refresh user access:', error)
      logout()
    }
  }

  const checkProductAccess = async (email: string, productType: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/access/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product_type: productType })
      })

      if (!response.ok) return false

      const { has_access } = await response.json()
      return has_access
    } catch (error) {
      console.error('Failed to check product access:', error)
      return false
    }
  }

  const login = async (email: string, name?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Get or create user
      let userData
      try {
        const userResponse = await fetch(`/api/users/email/${encodeURIComponent(email)}`)
        if (userResponse.ok) {
          userData = await userResponse.json()
        } else {
          // Create new user
          const createResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
          })
          if (createResponse.ok) {
            userData = await createResponse.json()
          } else {
            throw new Error('Failed to create user')
          }
        }
      } catch (error) {
        throw new Error('Failed to get/create user')
      }

      // Refresh access and set user
      await refreshUserAccess(userData)
      return true

    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('barakah_user')
  }

  const checkAccess = (productType: 'dua_generator' | 'story_generator' | 'poster_generator'): boolean => {
    if (!user) return false
    return user.hasAccess[productType]
  }

  const refreshAccess = async () => {
    if (user) {
      await refreshUserAccess(user)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAccess,
    refreshAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}