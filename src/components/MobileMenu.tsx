import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface MobileMenuProps {
  isDark?: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isDark = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAdmin, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <div className="lg:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg ${isDark ? 'text-yellow-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
        aria-label="Toggle menu"
      >
        {!isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className={`fixed right-0 top-0 h-full w-64 ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}>
            {/* Menu Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-gray-900'}`}>
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              {user ? (
                <>
                  <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Signed in as <span className="font-semibold">{user.name}</span>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'text-yellow-300 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📊 Dashboard
                  </Link>
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                        isDark
                          ? 'text-purple-300 hover:bg-white/10'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      🛡️ Admin Panel
                    </Link>
                  )}
                  <hr className={`my-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'text-yellow-300 hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 rounded-lg font-bold text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

export default MobileMenu