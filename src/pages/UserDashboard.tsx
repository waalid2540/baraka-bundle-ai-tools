import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DuaGenerator from './DuaGenerator'
import KidsStoryGenerator from './KidsStoryGenerator'
import NamePosterGenerator from './NamePosterGenerator'
import EnterpriseStoryGenerator from '../components/EnterpriseStoryGenerator'
import PaymentGateway from '../components/PaymentGateway'

const UserDashboard: React.FC = () => {
  const { user, logout, hasAccess, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green-600"></div>
      </div>
    )
  }

  const features = [
    {
      id: 'dua_generator',
      name: 'Dua Generator',
      icon: '🤲',
      description: 'Generate personalized Islamic supplications',
      color: 'from-blue-500 to-cyan-600',
      component: DuaGenerator
    },
    {
      id: 'story_generator',
      name: 'Kids Story Generator',
      icon: '📚',
      description: 'Create Islamic stories for children',
      color: 'from-purple-500 to-pink-600',
      component: KidsStoryGenerator
    },
    {
      id: 'name_poster',
      name: 'Name Poster Generator',
      icon: '🎨',
      description: 'Create beautiful Islamic name posters',
      color: 'from-green-500 to-emerald-600',
      component: NamePosterGenerator
    }
  ]

  const renderActiveFeature = () => {
    const feature = features.find(f => f.id === activeTab)
    if (!feature) return null

    const FeatureComponent = feature.component

    // For embedded components, we need to override certain behaviors
    if (activeTab === 'story_generator') {
      return <KidsStoryGeneratorEmbedded />
    }

    return <FeatureComponent />
  }

  // Embedded KidsStoryGenerator that works in dashboard context
  const KidsStoryGeneratorEmbedded = () => {
    const userHasAccess = hasAccess('story_generator')

    const handlePaymentClick = () => {
      setShowPayment(true)
    }

    if (!userHasAccess) {
      return (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-6xl mb-6">🔒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Unlock Kids Story Generator
            </h3>
            <p className="text-gray-600 mb-8">
              Get unlimited access to create personalized Islamic stories with professional illustrations and audio narration
            </p>
            <div className="space-y-3">
              <button
                onClick={handlePaymentClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Get Unlimited Access - $2.99
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <EnterpriseStoryGenerator
        hasAccess={userHasAccess}
        onPaymentClick={handlePaymentClick}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-islamic-green-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-islamic-green-600">
                BarakahTool
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            {user.email} • {user.role === 'admin' && <span className="text-purple-600 font-semibold">Admin</span>}
            {user.role === 'user' && <span className="text-green-600">Member</span>}
            {!user.email_verified && (
              <span className="ml-2 text-orange-500">
                (Email not verified)
              </span>
            )}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-islamic-green-500 text-islamic-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>

              {features.map((feature) => {
                const hasFeatureAccess = hasAccess(feature.id)
                return (
                  <button
                    key={feature.id}
                    onClick={() => hasFeatureAccess && setActiveTab(feature.id)}
                    disabled={!hasFeatureAccess}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === feature.id
                        ? 'border-islamic-green-500 text-islamic-green-600'
                        : hasFeatureAccess
                        ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        : 'border-transparent text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {feature.icon} {feature.name}
                    {!hasFeatureAccess && <span className="ml-2 text-xs">🔒</span>}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature) => {
                    const hasFeatureAccess = hasAccess(feature.id)

                    return (
                      <div
                        key={feature.id}
                        className={`relative bg-gray-50 rounded-xl shadow-lg overflow-hidden ${
                          !hasFeatureAccess ? 'opacity-75' : ''
                        }`}
                      >
                        <div className={`h-2 bg-gradient-to-r ${feature.color}`} />

                        <div className="p-6">
                          <div className="text-4xl mb-4">{feature.icon}</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {feature.name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {feature.description}
                          </p>

                          {hasFeatureAccess ? (
                            <button
                              onClick={() => setActiveTab(feature.id)}
                              className={`block w-full text-center py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${feature.color} hover:shadow-lg transform hover:scale-[1.02] transition-all`}
                            >
                              Open Tool
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate('/pricing')}
                              className="block w-full text-center py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                              🔒 Unlock Feature
                            </button>
                          )}
                        </div>

                        {hasFeatureAccess && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Purchase History */}
                {user.purchased_features && user.purchased_features.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Purchases</h2>
                    <div className="space-y-4">
                      {user.purchased_features.map((purchase, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-lg border"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {purchase.product_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-600">
                              Purchased: {new Date(purchase.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {purchase.expires_at ? (
                                <>
                                  Expires: {new Date(purchase.expires_at).toLocaleDateString()}
                                  {new Date(purchase.expires_at) > new Date() ? (
                                    <span className="ml-2 text-green-600">✓ Active</span>
                                  ) : (
                                    <span className="ml-2 text-red-600">Expired</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-green-600">Lifetime Access</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Purchases */}
                {(!user.purchased_features || user.purchased_features.length === 0) && (
                  <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Start Your Journey
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Unlock powerful Islamic AI tools to enhance your spiritual journey
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-block px-8 py-3 bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all"
                    >
                      View Available Features
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              // Render the active feature component
              <div className="min-h-screen">
                {renderActiveFeature()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPayment && (
        <PaymentGateway
          productType="story_generator"
          isOpen={true}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={() => {
            setShowPayment(false)
            // The auth context will automatically refresh user data
            window.location.reload() // Refresh to get updated access
          }}
        />
      )}
    </div>
  )
}

export default UserDashboard