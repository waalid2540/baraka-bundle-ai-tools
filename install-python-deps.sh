#!/bin/bash
# Production setup script for Coqui TTS dependencies

echo "🚀 Setting up Professional TTS for BarakahBundle..."

# Check if Python3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python3 first."
    exit 1
fi

# Check if pip3 is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip3 first."
    exit 1
fi

echo "✅ Python3 and pip3 found"

# Install pyttsx3 for professional TTS
echo "📦 Installing pyttsx3 for professional audio generation..."
pip3 install pyttsx3

# Test the installation
echo "🧪 Testing TTS installation..."
python3 -c "import pyttsx3; print('✅ pyttsx3 installed successfully')" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "🎉 Professional TTS setup complete!"
    echo "🔊 Your Islamic stories will now have professional audio narration"
else
    echo "❌ Installation failed. Please check your Python environment."
    exit 1
fi

echo ""
echo "🚀 Ready to deploy with professional TTS!"
echo "📝 Note: This replaces Google TTS with free, offline professional audio generation"