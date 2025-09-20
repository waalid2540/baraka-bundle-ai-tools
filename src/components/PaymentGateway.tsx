import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { stripeService } from '../services/stripeService'
import { databaseService } from '../services/databaseService'

interface PaymentGatewayProps {
  productType: 'dua_generator' | 'story_generator' | 'poster_generator'
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
}

interface ProductInfo {
  id: number
  name: string
  description: string
  price_cents: number
  product_type: string
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  productType,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  // Check if user already has access
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 PaymentGateway opened for:', productType)
      checkUserAccess()
      loadProduct()
    }
  }, [isOpen, productType, user])

  const loadProduct = async () => {
    try {
      // Directly fetch from API instead of using stripeService
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'
        
      const response = await fetch(`${apiUrl}/products`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const products = await response.json()
      const product = products.find(p => p.product_type === productType)
      setProduct(product || null)
      
      console.log('💰 Loaded product pricing:', { productType, product })
    } catch (error) {
      console.error('Failed to load product:', error)
      
      // Fallback to hard-coded pricing if API fails
      const fallbackProducts = {
        'dua_generator': {
          id: 1,
          name: "Du'a Generator",
          description: "Generate beautiful Islamic du'as with Arabic text and translations",
          price_cents: 299,
          stripe_price_id: "price_1S6pOZF5UL32ywGmg9RM5AqQ",
          product_type: "dua_generator"
        },
        'story_generator': {
          id: 2,
          name: "Kids Story Generator", 
          description: "Create Islamic stories for children with illustrations and audio",
          price_cents: 299,
          stripe_price_id: "price_1S6yrmF5UL32ywGmrEea8Xfq",
          product_type: "story_generator"
        },
        'poster_generator': {
          id: 3,
          name: "Name Poster Generator",
          description: "Generate beautiful Islamic calligraphy posters with names", 
          price_cents: 399,
          stripe_price_id: null,
          product_type: "poster_generator"
        }
      }
      
      const fallbackProduct = fallbackProducts[productType] || null
      setProduct(fallbackProduct)
      console.log('🔄 Using fallback pricing for:', productType, fallbackProduct)
      console.log('🔄 Setting product to:', fallbackProduct)
    }
  }

  const handlePayment = async () => {
    // Require user to be logged in
    if (!user) {
      // Redirect to login page
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create checkout session with authenticated user's info
      const result = await stripeService.createCheckoutSession(
        productType,
        user.email,
        user.name
      )

      if (result.success && result.session) {
        // Redirect to Stripe Checkout
        stripeService.redirectToCheckout(result.session.url)
      } else {
        setError(result.error || 'Failed to create payment session')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const checkUserAccess = async () => {
    if (!user) return

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? 'https://baraka-bundle-ai-tools.onrender.com/api'
        : '/api'

      const response = await fetch(`${apiUrl}/access/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          product_type: productType
        })
      })

      if (response.ok) {
        const { has_access } = await response.json()
        if (has_access) {
          setHasAccess(true)
          onPaymentSuccess()
          onClose()
        }
      }
    } catch (error) {
      console.error('Access check error:', error)
    }
  }

  // Helper function to format price
  const formatPrice = (priceInCents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {stripeService.getProductIcon(productType)} {stripeService.getProductDisplayName(productType)}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {product && (
            <p className="text-lg mt-2">{formatPrice(product.price_cents)}</p>
          )}
        </div>

        <div className="p-6">
          {hasAccess ? (
            /* User already has access */
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-4">
                You already have access!
              </h3>
              <p className="text-gray-600 mb-6">
                You can start using {stripeService.getProductDisplayName(productType)} right away.
              </p>
              <button
                onClick={() => {
                  onPaymentSuccess()
                  onClose()
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Continue to {stripeService.getProductDisplayName(productType)}
              </button>
            </div>
          ) : (
            /* Payment form */
            <div>
              {/* Product Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">What you get:</h3>
                <p className="text-gray-600 leading-relaxed">
                  {stripeService.getProductDescription(productType)}
                </p>
                
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✨ Premium Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Unlimited generations</li>
                    <li>• High-quality AI-powered content</li>
                    <li>• Multiple language support</li>
                    <li>• Instant access after payment</li>
                    <li>• Lifetime access (one-time payment)</li>
                  </ul>
                </div>
              </div>

              {/* User Information Display - Show logged in user */}
              {user && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Purchasing as:</p>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-islamic-green-600 to-islamic-green-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-islamic-green-700 hover:to-islamic-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="mr-2">💳</span>
                    Pay {product ? formatPrice(product.price_cents) : '...'} - Get Lifetime Access
                  </div>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>🔒 Secure payment powered by Stripe</p>
                <p>Your payment information is encrypted and secure</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentGateway