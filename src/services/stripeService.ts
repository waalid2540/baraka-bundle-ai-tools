// BarakahTool Premium Stripe Payment Service
// High-Class Payment Processing for Islamic Digital Products

import { loadStripe } from '@stripe/stripe-js'

const STRIPE_PUBLIC_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || ''
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

// Initialize Stripe only if public key is available
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null

export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  features: string[]
}

export interface CheckoutSession {
  sessionId: string
  url: string
}

class StripeService {
  // Premium Products Configuration
  private products: Product[] = [
    {
      id: 'dua_generator',
      name: 'Premium Dua Generator',
      description: 'Create personalized Islamic duas with Arabic, transliteration, and translations in 8+ languages',
      price: 299, // $2.99 in cents
      currency: 'usd',
      features: [
        'Unlimited dua generation',
        'Beautiful PDF exports',
        'Arabic with tashkeel',
        '8+ language translations',
        'Islamic references included',
        'Lifetime access'
      ]
    },
    {
      id: 'kids_stories',
      name: 'Islamic Kids Stories',
      description: 'Premium bedtime Islamic stories for children with moral lessons',
      price: 299, // $2.99 in cents
      currency: 'usd',
      features: [
        'Unlimited story generation',
        'Age-appropriate content',
        'PDF downloads',
        'Multiple themes',
        'Parent discussion guide',
        'Lifetime access'
      ]
    },
    {
      id: 'name_poster',
      name: 'Name Poster Generator',
      description: 'Beautiful Islamic name posters with meanings and calligraphy',
      price: 399, // $3.99 in cents
      currency: 'usd',
      features: [
        'Arabic calligraphy',
        'Name meanings & etymology',
        'Quranic references',
        'Premium PDF design',
        'Multiple languages',
        'Lifetime access'
      ]
    }
  ]

  // Get product by ID
  getProduct(productId: string): Product | undefined {
    return this.products.find(p => p.id === productId)
  }

  // Get all products
  getAllProducts(): Product[] {
    return this.products
  }

  // Create checkout session
  async createCheckoutSession(
    productId: string,
    customerEmail?: string,
    metadata?: Record<string, string>
  ): Promise<CheckoutSession> {
    const product = this.getProduct(productId)
    
    if (!product) {
      throw new Error('Product not found')
    }

    try {
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productDescription: product.description,
          amount: product.price,
          currency: product.currency,
          customerEmail,
          metadata: {
            ...metadata,
            productId: product.id,
            platform: 'BarakahTool',
            version: '2.0'
          },
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/cancel`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      return {
        sessionId: data.sessionId,
        url: data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await stripePromise
    
    if (!stripe) {
      throw new Error('Stripe not available - please configure REACT_APP_STRIPE_PUBLIC_KEY')
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId
    })

    if (error) {
      console.error('Error redirecting to checkout:', error)
      throw error
    }
  }

  // Process payment (combines create session and redirect)
  async processPayment(
    productId: string,
    customerInfo?: {
      email?: string
      name?: string
      language?: string
    }
  ): Promise<void> {
    try {
      // Create checkout session
      const session = await this.createCheckoutSession(
        productId,
        customerInfo?.email,
        {
          customerName: customerInfo?.name || '',
          language: customerInfo?.language || 'English'
        }
      )

      // Redirect to Stripe Checkout
      await this.redirectToCheckout(session.sessionId)
    } catch (error) {
      console.error('Payment processing error:', error)
      throw error
    }
  }

  // Verify payment success
  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.success === true
    } catch (error) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  // Get payment details
  async getPaymentDetails(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/payment-details/${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get payment details')
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting payment details:', error)
      throw error
    }
  }

  // Format price for display
  formatPrice(priceInCents: number, currency: string = 'usd'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    })
    
    return formatter.format(priceInCents / 100)
  }

  // Check if Stripe is configured
  isConfigured(): boolean {
    return !!STRIPE_PUBLIC_KEY
  }
}

export const stripeService = new StripeService()
export default stripeService