# 🎨 Canva API Setup Guide for Beautiful Islamic PDFs

This guide will help you set up Canva API integration to create stunning, professional Islamic PDF designs for your content creators.

## 📋 Prerequisites

1. **Canva Developer Account** (Free)
2. **Node.js v20.14.0** or higher
3. **Active Canva Pro/Teams Account** (recommended for advanced templates)

## 🚀 Step-by-Step Setup

### 1. Create Canva Developer Account

1. Go to [Canva Developer Portal](https://www.canva.com/developers/)
2. Click "Get Started" and sign up with your Canva account
3. Enable **Multi-Factor Authentication (MFA)** on your account
4. Complete developer verification if prompted

### 2. Create New Integration

1. In the Developer Portal, click **"Create an integration"**
2. Choose integration type:
   - **Public**: For distributing to other users
   - **Private**: For your own use only (recommended to start)
3. Fill in integration details:
   - **Name**: "BarakahTool Islamic PDF Generator"
   - **Description**: "Professional Islamic PDF designs for content creators"
   - **Website**: Your domain or localhost for development

### 3. Configure Integration Settings

1. **Scopes Required** (select these):
   - `design:content:read` - Read design content
   - `design:content:write` - Create/edit designs  
   - `design:meta:read` - Read design metadata
   - `asset:read` - Access media assets
   - `asset:write` - Upload custom assets
   - `brandtemplate:content:read` - Access brand templates
   - `profile:read` - Access user profile

2. **Redirect URLs**:
   - Development: `http://localhost:3001/oauth/redirect`
   - Production: `https://yourdomain.com/oauth/redirect`

3. **Return Navigation URLs**:
   - Development: `http://localhost:3001/return-nav`
   - Production: `https://yourdomain.com/return-nav`

### 4. Get API Credentials

After creating the integration:

1. **Client ID**: Copy this value (visible in integration settings)
2. **Client Secret**: Click "Generate Secret" and save it securely
3. **API Key**: This will be generated after OAuth flow completion

### 5. Environment Configuration

Update your `.env` file with the credentials:

```bash
# Canva API Configuration
REACT_APP_CANVA_CLIENT_ID=your_client_id_here
REACT_APP_CANVA_CLIENT_SECRET=your_client_secret_here
REACT_APP_CANVA_API_KEY=your_api_key_here
```

### 6. Test Integration

1. Run your React app: `npm start`
2. Try generating a PDF with the new Canva integration
3. Check console for any API errors

## 🎨 Available Islamic Templates

Our Canva service includes professional Islamic templates:

- **Rizq (Sustenance)**: Professional green Islamic design
- **Protection**: Professional blue Islamic design  
- **Guidance**: Professional gold Islamic design
- **Forgiveness**: Professional purple Islamic design
- **Health**: Professional crimson Islamic design
- **Knowledge**: Professional gray Islamic design
- **Travel**: Professional orange Islamic design
- **Sleep**: Professional indigo Islamic design

## 🔧 Troubleshooting

### Common Issues:

1. **API Key Not Working**
   - Ensure MFA is enabled on your Canva account
   - Check that all required scopes are selected
   - Verify redirect URLs match exactly

2. **Template Not Found**
   - Template IDs may change - check Canva documentation
   - Ensure you have access to the template (Pro/Teams account needed)

3. **Export Timeout**
   - Large designs take time to export
   - Check network connection
   - Verify API rate limits aren't exceeded

4. **CORS Issues**
   - Canva API calls should be made server-side
   - Use proxy if calling from client-side

### Rate Limits:

- **Design Export API**: 10 requests every 10 seconds
- **General API**: Follow exponential backoff strategy
- **Best Practice**: Cache designs when possible

## 📚 Additional Resources

- [Canva Connect API Documentation](https://www.canva.dev/docs/connect/)
- [Canva Starter Kit](https://github.com/canva-sdks/canva-connect-api-starter-kit)
- [OpenAPI Specification](https://www.canva.dev/sources/connect/api/latest/api.yml)

## 🎯 Next Steps

1. Set up your credentials following this guide
2. Test the integration with a simple dua
3. Customize Islamic templates for your brand
4. Add custom Islamic fonts and graphics
5. Implement batch processing for multiple PDFs

## 🆘 Support

If you encounter issues:

1. Check Canva Developer Documentation
2. Review console logs for specific errors
3. Test with simple designs first
4. Contact Canva Developer Support if needed

---

**🌟 Once set up, your BarakahTool will generate stunning, professional Islamic PDFs that content creators will love to share on social media!** 🕌✨