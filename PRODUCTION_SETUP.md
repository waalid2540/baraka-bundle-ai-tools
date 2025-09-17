# Production Setup - Professional TTS Fix

## Issue: Browser TTS Fallback Instead of Professional Coqui TTS

Your production deployment is falling back to browser TTS because the Python dependencies aren't installed on your production server.

## Quick Fix for Production

### For Render.com Deployment:

1. **Add build script to package.json:**
```json
{
  "scripts": {
    "build": "vite build && ./render-build.sh"
  }
}
```

2. **Or manually install on your server:**
```bash
# SSH into your production server and run:
pip3 install pyttsx3

# Then restart your application
```

### For Manual Server Setup:

```bash
# Run the setup script
./install-python-deps.sh

# Or install manually
pip3 install pyttsx3
python3 -c "import pyttsx3; print('✅ TTS Ready')"
```

## Verification

After installing Python dependencies, check your server logs for:

✅ **Good (Coqui TTS working):**
```
🔊 Using Coqui TTS for professional audio generation
✅ Coqui TTS Service initialized successfully
✅ Python pyttsx3 test successful
```

❌ **Bad (falling back to browser TTS):**
```
❌ Python pyttsx3 test failed
🔄 Falling back to browser TTS for now
```

## Environment Requirements

- **Python 3.7+** installed
- **pip3** available
- **pyttsx3** Python package

## Current Status

The code is **100% ready** - it just needs the Python dependency installed on your production server. Once `pyttsx3` is installed, you'll get:

✅ **Professional offline TTS**  
✅ **Islamic content optimization**  
✅ **No more browser TTS fallback**  
✅ **High-quality audio generation**

## Deployment Commands

```bash
# 1. Install dependencies
pip3 install pyttsx3

# 2. Test installation  
python3 -c "import pyttsx3; print('TTS Ready')"

# 3. Restart your application
# Your app will now use professional TTS instead of browser TTS
```

---

**This will completely fix the browser TTS issue and give you professional audio generation!** 🎉