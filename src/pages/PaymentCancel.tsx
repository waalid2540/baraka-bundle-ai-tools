import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { stripeService } from '../services/stripeService'

const PaymentCancel = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const productType = searchParams.get('product') || ''

  const getProductDisplayName = (type: string) => {
    return stripeService.getProductDisplayName(type)
  }

  const getProductIcon = (type: string) => {
    return stripeService.getProductIcon(type)
  }

  const retryPayment = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="text-6xl mb-6">😔</div>

          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-orange-600 mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 mb-6">
            No worries! Your payment was cancelled and no charges were made.
          </p>

          {/* Product Info */}
          {productType && (
            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">{getProductIcon(productType)}</span>
                <span className="font-semibold text-orange-800">
                  {getProductDisplayName(productType)}
                </span>
              </div>
              <p className="text-sm text-orange-600">
                Still available for purchase
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {productType && (
              <button
                onClick={retryPayment}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-300"
              >
                Try Again - Get {getProductDisplayName(productType)}
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Having trouble with payment? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel