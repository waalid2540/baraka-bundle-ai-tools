import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { stripeService } from '../services/stripeService'
import { databaseService } from '../services/databaseService'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading')
  const [productType, setProductType] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id')
      const product = searchParams.get('product')

      if (!sessionId || !product) {
        setError('Missing payment information')
        setVerificationStatus('error')
        return
      }

      setProductType(product)

      // Verify the payment with Stripe
      const verification = await stripeService.verifyPayment(sessionId)

      if (verification.success) {
        // Handle successful payment
        await stripeService.handlePaymentSuccess(sessionId, product)
        setVerificationStatus('success')
      } else {
        setError(verification.error || 'Payment verification failed')
        setVerificationStatus('error')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setError('An unexpected error occurred during verification')
      setVerificationStatus('error')
    } finally {
      setIsVerifying(false)
    }
  }

  const getProductDisplayName = (type: string) => {
    return stripeService.getProductDisplayName(type)
  }

  const getProductIcon = (type: string) => {
    return stripeService.getProductIcon(type)
  }

  const goToProduct = () => {
    switch (productType) {
      case 'dua_generator':
        navigate('/dua-generator')
        break
      case 'story_generator':
        navigate('/kids-story-generator')
        break
      case 'poster_generator':
        navigate('/name-poster-generator')
        break
      default:
        navigate('/')
    }
  }

  if (isVerifying || verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-islamic-green-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verifying Your Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your purchase...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Payment Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'We couldn\'t verify your payment. Please contact support.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Return Home
              </button>
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact support with your payment details.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-100 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Animation */}
          <div className="relative mb-8">
            <div className="text-8xl animate-bounce">🎉</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-pulse">✨</div>
            <div className="absolute -bottom-2 -left-2 text-3xl animate-pulse">🌟</div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h1>
          
          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">{getProductIcon(productType)}</span>
              <div>
                <h3 className="text-xl font-semibold text-green-800">
                  {getProductDisplayName(productType)}
                </h3>
                <p className="text-green-600">Lifetime Access Activated</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                <span>Unlimited generations</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                <span>High-quality AI content</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                <span>Multiple languages supported</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">✅</span>
                <span>Instant access</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={goToProduct}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg"
            >
              Start Using {getProductDisplayName(productType)} →
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>

          {/* Receipt Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              A receipt has been sent to your email address.
            </p>
            <p className="text-xs text-gray-400">
              Your purchase is protected by our 30-day satisfaction guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess