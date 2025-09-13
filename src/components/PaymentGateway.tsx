import React, { useState, useEffect } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [hasAccess, setHasAccess] = useState(false)

  // Check if user already has access
  useEffect(() => {
    if (isOpen) {
      checkAccess()
      loadProduct()
    }
  }, [isOpen, productType])

  const checkAccess = async () => {
    try {
      const access = await stripeService.checkProductAccess(productType)
      setHasAccess(access)
    } catch (error) {
      console.error('Failed to check access:', error)
    }
  }

  const loadProduct = async () => {
    try {
      const products = await stripeService.getProductPricing()
      setProduct(products[productType] || null)
    } catch (error) {
      console.error('Failed to load product:', error)
    }
  }

  const handlePayment = async () => {
    if (!userEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!userName.trim()) {
      setError('Please enter your name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create checkout session
      const result = await stripeService.createCheckoutSession(
        productType,
        userEmail.trim(),
        userName.trim()
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

  const handleLoginAndAccess = async () => {
    if (!userEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await databaseService.loginUser(userEmail.trim(), userName.trim() || undefined)
      const access = await stripeService.checkProductAccess(productType)
      
      if (access) {
        setHasAccess(true)
        onPaymentSuccess()
        onClose()
      } else {
        setError('No active subscription found for this email')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to verify access. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <p className="text-lg mt-2">{stripeService.formatPrice(product.price_cents)}</p>
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

              {/* User Information Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-islamic-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Main Payment Button */}
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
                      Pay {product ? stripeService.formatPrice(product.price_cents) : '...'} - Get Lifetime Access
                    </div>
                  )}
                </button>

                {/* Already Purchased Button */}
                <button
                  onClick={handleLoginAndAccess}
                  disabled={isLoading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                >
                  Already purchased? Access your account
                </button>
              </div>

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