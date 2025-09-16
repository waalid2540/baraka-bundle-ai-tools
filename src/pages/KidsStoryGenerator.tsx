import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import EnterpriseStoryGenerator from '../components/EnterpriseStoryGenerator'
import PaymentGateway from '../components/PaymentGateway'

const KidsStoryGenerator = () => {
  // Access control state
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true)
  const [showPayment, setShowPayment] = useState<boolean>(false)

  // Check access on component mount
  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    try {
      setCheckingAccess(true)
      
      // Get user email from localStorage
      const storedEmail = localStorage.getItem('user_email')
      
      if (!storedEmail) {
        // No user email, show payment
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      // Check access via API endpoint
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'
        
      const response = await fetch(`${apiUrl}/access/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: storedEmail, 
          product_type: 'story_generator' 
        })
      })

      if (!response.ok) {
        console.error('Access check failed:', response.status)
        setHasAccess(false)
        setCheckingAccess(false)
        return
      }

      const { has_access } = await response.json()
      setHasAccess(has_access)
      
      console.log('📖 Kids Story access check:', { email: storedEmail, has_access })
    } catch (error) {
      console.error('Access check error:', error)
      setHasAccess(false)
    } finally {
      setCheckingAccess(false)
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
        {checkingAccess ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access...</p>
          </div>
        ) : !hasAccess ? (
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
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🚀 Get Unlimited Access - $2.99
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors border border-gray-600"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span>Already Purchased? Access Now</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* User has access - show enterprise generator */
          <EnterpriseStoryGenerator 
            hasAccess={hasAccess}
            onPaymentClick={() => setShowPayment(true)}
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
            checkAccess() // Recheck access after payment
          }}
        />
      )}
    </div>
  )
}

export default KidsStoryGenerator