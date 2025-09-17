#!/bin/bash
# Render.com build script for BarakahBundle with Professional TTS

echo "🚀 Building BarakahBundle with Professional TTS..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the React frontend
echo "🔨 Building React frontend..."
npm run build

# Install Python TTS dependencies
echo "🐍 Installing Python TTS dependencies..."
pip3 install pyttsx3 || pip install pyttsx3

# Test Python TTS installation
echo "🧪 Testing Python TTS installation..."
python3 -c "import pyttsx3; print('✅ pyttsx3 installed successfully')" 2>/dev/null || {
    echo "⚠️ pyttsx3 not available with python3, trying python..."
    python -c "import pyttsx3; print('✅ pyttsx3 installed successfully')" 2>/dev/null || {
        echo "❌ Failed to install pyttsx3. Audio will fall back to browser TTS."
    }
}

echo "✅ Build complete!"
echo "🔊 Professional Islamic TTS ready for production"