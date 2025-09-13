// Stripe Payment Service for BarakahTool
// Handles payment processing for each product

import { databaseService } from './databaseService'

interface Product {
  id: number
  name: string
  description: string
  price_cents: number
  product_type: 'dua_generator' | 'story_generator' | 'poster_generator'
}

interface PaymentSession {
  sessionId: string
  url: string
}

interface PaymentResult {
  success: boolean
  session?: PaymentSession
  error?: string
}

class StripeService {
  private apiUrl: string
  private publicKey: string

  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
    this.publicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || ''
  }

  // Create Stripe Checkout Session for product purchase
  async createCheckoutSession(
    productType: 'dua_generator' | 'story_generator' | 'poster_generator',
    userEmail: string,
    userName?: string
  ): Promise<PaymentResult> {
    try {
      console.log(`💳 Creating checkout session for ${productType}`)

      // Get or create user first
      let user = await databaseService.getUserByEmail(userEmail)
      if (!user) {
        user = await databaseService.createUser(userEmail, userName)
      }

      // Get product details
      const product = await databaseService.getProductByType(productType)
      if (!product) {
        return { success: false, error: 'Product not found' }
      }

      // Check if user already has access
      const hasAccess = await databaseService.checkUserAccess(user.id, productType)
      if (hasAccess) {
        return { success: false, error: 'You already have access to this product' }
      }

      // Create Stripe checkout session
      const response = await fetch(`${this.apiUrl}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType,
          user_id: user.id,
          user_email: userEmail,
          user_name: userName,
          success_url: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&product=${productType}`,
          cancel_url: `${window.location.origin}/payment-cancel?product=${productType}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to create payment session' }
      }

      const { session_id, url } = await response.json()
      
      console.log('✅ Checkout session created:', session_id)
      
      return {
        success: true,
        session: {
          sessionId: session_id,
          url
        }
      }
    } catch (error) {
      console.error('❌ Stripe checkout error:', error)
      return { success: false, error: 'Failed to initialize payment' }
    }
  }

  // Verify payment after successful checkout
  async verifyPayment(sessionId: string): Promise<{ success: boolean; productType?: string; error?: string }> {
    try {
      console.log('🔍 Verifying payment for session:', sessionId)

      const response = await fetch(`${this.apiUrl}/stripe/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Payment verification failed' }
      }

      const { product_type, payment_intent_id } = await response.json()
      
      console.log('✅ Payment verified for product:', product_type)
      
      return { success: true, productType: product_type }
    } catch (error) {
      console.error('❌ Payment verification error:', error)
      return { success: false, error: 'Failed to verify payment' }
    }
  }

  // Get product pricing information
  async getProductPricing(): Promise<{ [key: string]: Product }> {
    try {
      const products = await databaseService.getProducts()
      const pricing: { [key: string]: Product } = {}
      
      products.forEach(product => {
        pricing[product.product_type] = product
      })

      return pricing
    } catch (error) {
      console.error('Failed to fetch product pricing:', error)
      return {}
    }
  }

  // Format price for display
  formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100)
  }

  // Redirect to Stripe Checkout
  redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl
  }

  // Check if user has access to a product
  async checkProductAccess(productType: string): Promise<boolean> {
    const user = databaseService.getCurrentUser()
    if (!user) {
      return false
    }

    try {
      return await databaseService.checkUserAccess(user.id, productType)
    } catch (error) {
      console.error('Failed to check product access:', error)
      return false
    }
  }

  // Get all user's purchased products
  async getUserPurchases(): Promise<string[]> {
    const user = databaseService.getCurrentUser()
    if (!user) {
      return []
    }

    try {
      const access = await databaseService.getUserAccess(user.id)
      return access
        .filter(item => item.has_access)
        .map(item => item.product_type)
    } catch (error) {
      console.error('Failed to get user purchases:', error)
      return []
    }
  }

  // Product type mapping for display
  getProductDisplayName(productType: string): string {
    const names: { [key: string]: string } = {
      'dua_generator': 'Du\'a Generator',
      'story_generator': 'Kids Story Generator', 
      'poster_generator': 'Name Poster Generator'
    }
    return names[productType] || productType
  }

  getProductDescription(productType: string): string {
    const descriptions: { [key: string]: string } = {
      'dua_generator': 'Generate unlimited beautiful Islamic du\'as with Arabic text, transliteration, and translations in multiple languages.',
      'story_generator': 'Create unlimited Islamic stories for children with DALL-E illustrations, audio narration, and interactive storybooks.',
      'poster_generator': 'Generate unlimited beautiful Islamic calligraphy posters with names and custom designs.'
    }
    return descriptions[productType] || 'Premium Islamic digital tool access'
  }

  getProductIcon(productType: string): string {
    const icons: { [key: string]: string } = {
      'dua_generator': '🤲',
      'story_generator': '📖',
      'poster_generator': '🎨'
    }
    return icons[productType] || '✨'
  }

  // Handle payment success (called from success page)
  async handlePaymentSuccess(sessionId: string, productType: string): Promise<void> {
    try {
      // Verify the payment
      const verification = await this.verifyPayment(sessionId)
      
      if (verification.success) {
        // Log usage
        const user = databaseService.getCurrentUser()
        if (user) {
          await databaseService.logUsage(
            user.id,
            productType,
            'product_purchased',
            { session_id: sessionId, payment_verified: true }
          )
        }

        console.log('🎉 Payment successful for', productType)
      } else {
        console.error('Payment verification failed:', verification.error)
      }
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  // Check if Stripe is enabled
  isStripeEnabled(): boolean {
    return process.env.REACT_APP_ENABLE_STRIPE === 'true' && !!this.publicKey
  }
}

export const stripeService = new StripeService()
export default stripeService