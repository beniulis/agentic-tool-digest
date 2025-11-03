#!/bin/bash
# Quick start script for the research backend

echo "🚀 Starting Agentic Tool Research Backend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Please copy .env.example to .env and add your OPENAI_API_KEY"
    echo ""
    read -p "Press enter to continue anyway or Ctrl+C to exit..."
fi

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Start server
echo ""
echo "✅ Backend ready!"
echo "🌐 Starting API server on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python api.py
