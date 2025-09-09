"""
BarakahTool Enterprise - FastAPI Backend
Modern Islamic Digital Platform with Professional PDF Generation
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import openai
import stripe
import redis
import io
import os
from datetime import datetime
import uuid

# Import our enterprise services
from services.dua_service import DuaService
from services.payment_service import PaymentService
from pdf.enterprise_pdf_generator import EnterprisePDFGenerator

# Initialize FastAPI app
app = FastAPI(
    title="BarakahTool Enterprise API",
    description="Professional Islamic Digital Platform - Enterprise Grade",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://barakahtool.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
dua_service = DuaService()
payment_service = PaymentService()
pdf_generator = EnterprisePDFGenerator()

# Redis for caching
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Pydantic models
class DuaRequest(BaseModel):
    situation: str
    language: str = "English"
    premium_features: bool = False
    user_id: Optional[str] = None

class PaymentRequest(BaseModel):
    plan: str  # "premium", "enterprise", "whitelabel"
    user_email: str
    user_name: str

class DuaResponse(BaseModel):
    id: str
    arabic_text: str
    transliteration: Optional[str]
    translation: str
    language: str
    situation: str
    created_at: datetime
    pdf_url: Optional[str] = None

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "BarakahTool Enterprise API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# Generate Dua - Core Feature
@app.post("/api/dua/generate", response_model=DuaResponse)
async def generate_dua(
    request: DuaRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate authentic Islamic dua with professional PDF
    """
    try:
        # Generate unique ID
        dua_id = str(uuid.uuid4())
        
        # Check cache first
        cache_key = f"dua:{hash(request.situation + request.language)}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result and not request.premium_features:
            # Return cached result for basic requests
            import json
            cached_data = json.loads(cached_result)
            cached_data['id'] = dua_id
            return DuaResponse(**cached_data)
        
        # Generate new dua using AI
        dua_data = await dua_service.generate_dua(
            situation=request.situation,
            language=request.language,
            premium=request.premium_features
        )
        
        # Create response
        response = DuaResponse(
            id=dua_id,
            arabic_text=dua_data['arabic'],
            transliteration=dua_data.get('transliteration'),
            translation=dua_data['translation'],
            language=request.language,
            situation=request.situation,
            created_at=datetime.now()
        )
        
        # Generate PDF in background
        background_tasks.add_task(
            generate_pdf_background,
            dua_id,
            dua_data,
            request.situation
        )
        
        # Cache the result
        if not request.premium_features:
            import json
            cache_data = response.dict()
            cache_data.pop('id')  # Remove unique ID from cache
            redis_client.setex(cache_key, 3600, json.dumps(cache_data, default=str))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dua generation failed: {str(e)}")

# Download PDF
@app.get("/api/dua/{dua_id}/pdf")
async def download_pdf(dua_id: str):
    """
    Download professional PDF for generated dua
    """
    try:
        # Check if PDF exists
        pdf_path = f"pdfs/{dua_id}.pdf"
        
        if not os.path.exists(pdf_path):
            # Generate PDF on demand if not exists
            raise HTTPException(status_code=404, detail="PDF not found or still generating")
        
        # Stream PDF file
        def iterfile(file_path: str):
            with open(file_path, "rb") as file:
                yield from file
        
        headers = {
            'Content-Disposition': f'attachment; filename="BarakahTool_Dua_{dua_id}.pdf"',
            'Content-Type': 'application/pdf'
        }
        
        return StreamingResponse(
            iterfile(pdf_path),
            media_type='application/pdf',
            headers=headers
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF download failed: {str(e)}")

# Payment endpoints
@app.post("/api/payment/create-session")
async def create_payment_session(request: PaymentRequest):
    """
    Create Stripe checkout session for one-time payment
    """
    try:
        session = await payment_service.create_checkout_session(
            plan=request.plan,
            user_email=request.user_email,
            user_name=request.user_name
        )
        
        return {
            "checkout_url": session.url,
            "session_id": session.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment session creation failed: {str(e)}")

@app.post("/api/payment/webhook")
async def stripe_webhook(background_tasks: BackgroundTasks):
    """
    Handle Stripe webhook for successful payments
    """
    # This would handle payment completion
    # Activate user's premium access
    return {"status": "success"}

# Get pricing plans
@app.get("/api/pricing")
async def get_pricing():
    """
    Get available pricing plans
    """
    return {
        "plans": [
            {
                "id": "premium",
                "name": "Premium Access",
                "price": 4999,  # $49.99 in cents
                "currency": "usd",
                "features": [
                    "Unlimited Dua Generation",
                    "Professional PDF Downloads",
                    "Multiple Languages",
                    "Premium Islamic Content",
                    "Lifetime Access"
                ]
            },
            {
                "id": "enterprise",
                "name": "Enterprise License",
                "price": 19999,  # $199.99 in cents
                "currency": "usd",
                "features": [
                    "Everything in Premium",
                    "Commercial Usage Rights",
                    "API Access",
                    "White-label Options",
                    "Priority Support"
                ]
            },
            {
                "id": "whitelabel",
                "name": "White Label Rights",
                "price": 49999,  # $499.99 in cents
                "currency": "usd",
                "features": [
                    "Everything in Enterprise",
                    "Complete Rebrand Rights",
                    "Source Code Access",
                    "Custom Domain",
                    "Full Commercial Rights"
                ]
            }
        ]
    }

# Background task for PDF generation
async def generate_pdf_background(dua_id: str, dua_data: dict, situation: str):
    """
    Generate PDF in background task
    """
    try:
        # Ensure pdfs directory exists
        os.makedirs("pdfs", exist_ok=True)
        
        # Generate professional PDF
        pdf_path = f"pdfs/{dua_id}.pdf"
        await pdf_generator.create_enterprise_pdf(
            dua_data=dua_data,
            situation=situation,
            output_path=pdf_path
        )
        
        print(f"PDF generated successfully: {pdf_path}")
        
    except Exception as e:
        print(f"PDF generation failed for {dua_id}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )