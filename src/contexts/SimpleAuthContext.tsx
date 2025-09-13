import React, { createContext, useContext, useState, ReactNode } from 'react'

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

export const SimpleAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Start with false

  const login = async (email: string, name?: string): Promise<boolean> => {
    // Simple mock login
    const mockUser: User = {
      id: 1,
      email,
      name,
      hasAccess: {
        dua_generator: false,
        story_generator: false,
        poster_generator: false
      }
    }
    setUser(mockUser)
    return true
  }

  const logout = () => {
    setUser(null)
  }

  const checkAccess = (productType: 'dua_generator' | 'story_generator' | 'poster_generator'): boolean => {
    if (!user) return false
    return user.hasAccess[productType]
  }

  const refreshAccess = async () => {
    // Mock refresh
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