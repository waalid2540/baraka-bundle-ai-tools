"""
BarakahTool Enterprise Payment Service
One-time payment processing with Stripe
"""

import stripe
from decouple import config
from typing import Dict, Optional
import uuid
from datetime import datetime

class PaymentService:
    def __init__(self):
        """Initialize Stripe payment service"""
        stripe.api_key = config('STRIPE_SECRET_KEY', default='')
        self.webhook_secret = config('STRIPE_WEBHOOK_SECRET', default='')
        
        # Pricing plans (in cents)
        self.plans = {
            'premium': {
                'price': 4999,  # $49.99
                'name': 'Premium Access',
                'description': 'Lifetime access to all premium features'
            },
            'enterprise': {
                'price': 19999,  # $199.99
                'name': 'Enterprise License', 
                'description': 'Commercial usage rights with API access'
            },
            'whitelabel': {
                'price': 49999,  # $499.99
                'name': 'White Label Rights',
                'description': 'Complete rebrand and commercial rights'
            }
        }
    
    async def create_checkout_session(self, plan: str, user_email: str, user_name: str) -> stripe.checkout.Session:
        """
        Create Stripe checkout session for one-time payment
        """
        try:
            if plan not in self.plans:
                raise ValueError(f"Invalid plan: {plan}")
            
            plan_info = self.plans[plan]
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"BarakahTool {plan_info['name']}",
                            'description': plan_info['description'],
                            'images': ['https://barakahtool.com/images/logo.png'],  # Your logo
                        },
                        'unit_amount': plan_info['price'],
                    },
                    'quantity': 1,
                }],
                mode='payment',  # One-time payment
                success_url=config('FRONTEND_URL', 'http://localhost:3000') + f'/success?session_id={{CHECKOUT_SESSION_ID}}&plan={plan}',
                cancel_url=config('FRONTEND_URL', 'http://localhost:3000') + '/pricing?cancelled=true',
                customer_email=user_email,
                metadata={
                    'plan': plan,
                    'user_name': user_name,
                    'user_email': user_email,
                    'purchase_id': str(uuid.uuid4()),
                    'timestamp': datetime.now().isoformat()
                },
                payment_intent_data={
                    'metadata': {
                        'plan': plan,
                        'user_email': user_email
                    }
                }
            )
            
            return session
            
        except Exception as e:
            print(f"Payment session creation failed: {str(e)}")
            raise e
    
    async def handle_successful_payment(self, session_id: str) -> Dict:
        """
        Handle successful payment and activate user access
        """
        try:
            # Retrieve the session
            session = stripe.checkout.Session.retrieve(session_id)
            
            if session.payment_status == 'paid':
                plan = session.metadata.get('plan')
                user_email = session.metadata.get('user_email')
                user_name = session.metadata.get('user_name')
                purchase_id = session.metadata.get('purchase_id')
                
                # Here you would:
                # 1. Create user account or update existing
                # 2. Grant access permissions based on plan
                # 3. Send welcome email with access details
                # 4. Generate API keys for enterprise/whitelabel users
                
                access_details = self._create_user_access(plan, user_email, user_name, purchase_id)
                
                return {
                    'success': True,
                    'plan': plan,
                    'user_email': user_email,
                    'access_details': access_details,
                    'amount_paid': session.amount_total / 100,  # Convert from cents
                    'currency': session.currency,
                    'payment_date': datetime.now().isoformat()
                }
            
            else:
                return {
                    'success': False,
                    'error': 'Payment not completed'
                }
                
        except Exception as e:
            print(f"Payment handling failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_user_access(self, plan: str, user_email: str, user_name: str, purchase_id: str) -> Dict:
        """
        Create user access based on purchased plan
        """
        base_access = {
            'unlimited_duas': True,
            'pdf_downloads': True,
            'multiple_languages': True,
            'premium_content': True
        }
        
        if plan == 'premium':
            return {
                **base_access,
                'access_level': 'premium',
                'expiry_date': None,  # Lifetime access
                'features': [
                    'Unlimited dua generation',
                    'Professional PDF downloads', 
                    'Multiple language support',
                    'Premium Islamic content'
                ]
            }
        
        elif plan == 'enterprise':
            return {
                **base_access,
                'access_level': 'enterprise',
                'commercial_rights': True,
                'api_access': True,
                'api_key': self._generate_api_key(user_email, purchase_id),
                'white_label': False,
                'expiry_date': None,
                'features': [
                    'Everything in Premium',
                    'Commercial usage rights',
                    'API access with key',
                    'Priority support',
                    'Advanced analytics'
                ]
            }
        
        elif plan == 'whitelabel':
            return {
                **base_access,
                'access_level': 'whitelabel',
                'commercial_rights': True,
                'api_access': True,
                'white_label': True,
                'source_code_access': True,
                'custom_domain': True,
                'api_key': self._generate_api_key(user_email, purchase_id),
                'admin_panel': True,
                'expiry_date': None,
                'features': [
                    'Everything in Enterprise',
                    'Complete rebrand rights',
                    'Source code access',
                    'Custom domain support',
                    'Admin panel access',
                    'Full commercial rights'
                ]
            }
        
        return base_access
    
    def _generate_api_key(self, user_email: str, purchase_id: str) -> str:
        """
        Generate API key for enterprise/whitelabel users
        """
        import hashlib
        import secrets
        
        # Create unique API key
        key_data = f"{user_email}:{purchase_id}:{secrets.token_urlsafe(32)}"
        api_key = f"bt_{hashlib.md5(key_data.encode()).hexdigest()[:24]}"
        
        # In a real app, you'd store this in database with permissions
        return api_key
    
    async def verify_webhook(self, payload: bytes, sig_header: str) -> Dict:
        """
        Verify Stripe webhook signature and process event
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            
            # Handle the event
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                
                # Process successful payment
                result = await self.handle_successful_payment(session['id'])
                return result
            
            elif event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                print(f"Payment succeeded: {payment_intent['id']}")
                
            return {'success': True, 'event_type': event['type']}
            
        except ValueError as e:
            print(f"Invalid payload: {str(e)}")
            return {'success': False, 'error': 'Invalid payload'}
        except stripe.error.SignatureVerificationError as e:
            print(f"Invalid signature: {str(e)}")
            return {'success': False, 'error': 'Invalid signature'}
    
    async def get_payment_history(self, user_email: str) -> List[Dict]:
        """
        Get payment history for a user
        """
        try:
            # Search for payments by customer email
            customers = stripe.Customer.list(email=user_email)
            
            payments = []
            for customer in customers.data:
                payment_intents = stripe.PaymentIntent.list(customer=customer.id)
                
                for payment in payment_intents.data:
                    payments.append({
                        'id': payment.id,
                        'amount': payment.amount / 100,
                        'currency': payment.currency,
                        'status': payment.status,
                        'created': datetime.fromtimestamp(payment.created).isoformat(),
                        'plan': payment.metadata.get('plan', 'unknown')
                    })
            
            return payments
            
        except Exception as e:
            print(f"Payment history retrieval failed: {str(e)}")
            return []

# Create singleton instance
payment_service = PaymentService()