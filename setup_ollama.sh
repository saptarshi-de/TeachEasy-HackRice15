#!/bin/bash

echo "🚀 Setting up Essay Assist with Ollama and Mistral 7B"
echo "=================================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing Ollama..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -fsSL https://ollama.ai/install.sh | sh
    else
        # Linux
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
else
    echo "✅ Ollama is already installed"
fi

echo ""
echo "🤖 Pulling Mistral 7B model..."
ollama pull mistral:7b

echo ""
echo "🚀 Starting Ollama server..."
ollama serve &

# Wait a moment for server to start
sleep 3

echo ""
echo "🧪 Testing the connection..."
curl -X POST http://localhost:11434/api/generate \
    -d '{
        "model": "mistral:7b",
        "prompt": "Hello! This is a test.",
        "stream": false
    }' \
    -H "Content-Type: application/json"

echo ""
echo ""
echo "✅ Setup complete! The Essay Assist feature is ready to use."
echo ""
echo "📝 To use Essay Assist:"
echo "1. Make sure the backend server is running (npm run dev in backend/)"
echo "2. Make sure the frontend is running (npm start in frontend/)"
echo "3. Sign in to your account"
echo "4. Click on 'Essay Assist' in the navigation menu"
echo "5. Upload your resume and start chatting!"
echo ""
echo "ℹ️  Note: If you stop the Ollama server, restart it with: ollama serve"
