import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import EnterpriseStoryGenerator from '../components/EnterpriseStoryGenerator'
import PaymentGateway from '../components/PaymentGateway'

const KidsStoryGenerator = () => {
  const { user, hasAccess, loading } = useAuth()
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState<boolean>(false)

  const userHasAccess = hasAccess('story_generator')

  // If not logged in, redirect to login
  const handlePaymentClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/kids-story-generator' } } })
    } else {
      setShowPayment(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-islamic-green-600 hover:text-islamic-green-800">
              ← Back to Baraka Bundle
            </Link>
            <h1 className="text-2xl font-bold text-islamic-green-800">
              📖 Islamic Kids Stories
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Enterprise Kids Story Generator
          </h2>
          <p className="text-lg text-gray-600">
            Professional Islamic storytelling with AI-powered illustrations and narration
          </p>
        </div>

        {/* Access Control */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : !userHasAccess ? (
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
                  🚀 {!user ? 'Login to Access' : 'Get Unlimited Access - $2.99'}
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={handlePaymentClick}
                    className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      <span>Already Purchased? Access Now</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* User has access - show enterprise generator */
          <EnterpriseStoryGenerator
            hasAccess={userHasAccess}
            onPaymentClick={handlePaymentClick}
          />
        )}
      </main>

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

export default KidsStoryGenerator