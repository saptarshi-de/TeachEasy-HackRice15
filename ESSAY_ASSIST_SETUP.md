# 🎓 Essay Assist Feature Setup Guide

The Essay Assist feature provides AI-powered assistance for grant applications by analyzing your resume and providing personalized advice.

## 🚀 Quick Setup

### 1. Install Dependencies

First, make sure you have the required backend dependencies:

```bash
cd backend
npm install axios pdf-parse mammoth
```

### 2. Set Up Ollama and Mistral 7B

Run the automated setup script:

```bash
./setup_ollama.sh
```

Or follow the manual steps below:

#### Manual Setup:

**Install Ollama:**
```bash
# macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Or visit https://ollama.ai for other installation methods
```

**Pull Mistral 7B model:**
```bash
ollama pull mistral:7b
```

**Start Ollama server:**
```bash
ollama serve
```

### 3. Start Your Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## 📋 How to Use Essay Assist

1. **Sign In**: Make sure you're signed in to your TeachEasy account
2. **Navigate**: Click on "Essay Assist" in the navigation menu
3. **Upload Resume**: Upload your resume (PDF, DOC, DOCX, or TXT format)
4. **Start Chatting**: Ask questions about grant applications and get personalized advice

## 💡 Example Questions to Ask

- "How can I highlight my teaching experience in grant applications?"
- "What are the key elements of a compelling grant proposal?"
- "How should I structure my grant application essay?"
- "What specific examples from my background should I mention?"
- "Help me write a personal statement for this education grant"

## 🔧 API Endpoints

The Essay Assist feature adds these new API endpoints:

- `POST /api/essay-assist/upload-resume` - Upload and parse resume
- `POST /api/essay-assist/chat` - Chat with AI assistant
- `GET /api/essay-assist/resume-status/:userId` - Check resume status
- `DELETE /api/essay-assist/resume/:userId` - Delete uploaded resume

## 🛠️ Technical Details

### Supported File Formats
- PDF (.pdf)
- Microsoft Word (.doc, .docx)
- Plain Text (.txt)

### File Size Limit
- Maximum: 10MB per file

### AI Model
- **Model**: Mistral 7B
- **Platform**: Ollama (local inference)
- **Purpose**: Grant application assistance with resume context

### Resume Parsing
- PDF: Uses `pdf-parse` library
- Word Documents: Uses `mammoth` library
- Text Files: Direct UTF-8 parsing

## 🔒 Privacy & Security

- **Local Processing**: All AI inference happens locally via Ollama
- **Temporary Storage**: Resumes are stored in memory only (not persisted to database)
- **File Validation**: Only supported file types are accepted
- **Size Limits**: 10MB maximum file size to prevent abuse

## 🐛 Troubleshooting

### Common Issues:

**1. "Failed to get AI response"**
- Make sure Ollama is running: `ollama serve`
- Check if Mistral model is available: `ollama list`
- Verify Ollama is accessible at `http://localhost:11434`

**2. Resume upload fails**
- Check file format (PDF, DOC, DOCX, TXT only)
- Ensure file size is under 10MB
- Try converting to PDF if issues persist

**3. Slow responses**
- First response may be slower as model loads
- Subsequent responses should be faster
- Consider using a lighter model if needed

### Restart Ollama:
```bash
# Stop any running Ollama processes
pkill ollama

# Restart
ollama serve
```

## 📊 Performance Notes

- **First Load**: Initial model loading may take 1-2 minutes
- **Response Time**: Typical responses in 5-15 seconds
- **Memory Usage**: Mistral 7B requires ~8GB RAM
- **Storage**: Model files are ~4GB

## 🔄 Alternative Models

If Mistral 7B is too resource-intensive, you can use lighter alternatives:

```bash
# Smaller, faster models
ollama pull llama2:7b
ollama pull codellama:7b

# Update the model name in backend/routes/essayAssist.js
# Change: model: 'mistral:7b'
# To: model: 'llama2:7b'
```

## 📝 Development Notes

- Resume content is stored in memory (`Map` object) for the session
- In production, consider using a proper database for resume storage
- Add user authentication validation for enhanced security
- Consider implementing rate limiting for API calls

## 🎯 Future Enhancements

- [ ] Persistent resume storage in database
- [ ] Multiple resume versions per user
- [ ] Grant-specific templates and suggestions
- [ ] Integration with scholarship/grant database
- [ ] Enhanced file format support (RTF, etc.)
- [ ] Resume analysis and improvement suggestions
