const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Store parsed resumes in memory (in production, use a database)
const userResumes = new Map();

// Check if Ollama is available
async function checkOllamaStatus() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 2000 });
    return { available: true, models: response.data.models || [] };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// Parse resume content based on file type
async function parseResume(buffer, mimetype) {
  try {
    let content = '';
    
    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      content = pdfData.text;
    } else if (mimetype.includes('wordprocessingml') || mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else if (mimetype === 'text/plain') {
      content = buffer.toString('utf-8');
    }
    
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

// Call Ollama API for LLM responses
async function callOllama(prompt, resumeContent = '') {
  try {
    // First check if Ollama is available
    const ollamaStatus = await checkOllamaStatus();
    if (!ollamaStatus.available) {
      throw new Error('Ollama is not running. Please start Ollama server and ensure Mistral 7B model is available.');
    }

    const systemPrompt = `You are an expert grant application assistant. You help educators write compelling grant applications by analyzing their background and providing personalized advice.

${resumeContent ? `Here is the user's resume/background information:
${resumeContent}

` : ''}Please provide helpful, specific, and actionable advice for grant applications. Focus on:
1. Highlighting relevant experience and qualifications
2. Suggesting specific examples and achievements to mention
3. Providing tips for writing compelling narratives
4. Addressing common grant application requirements

Keep responses concise but comprehensive, and always relate advice back to the user's specific background when possible.`;

    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b',
      prompt: systemPrompt + '\n\nUser Question: ' + prompt,
      stream: false
    }, {
      timeout: 30000 // 30 second timeout
    });

    return response.data.response;
  } catch (error) {
    console.error('Ollama API error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      throw new Error('Ollama server is not running. Please start Ollama with: ollama serve');
    } else if (error.message.includes('timeout')) {
      throw new Error('Ollama request timed out. The model might be loading or busy.');
    } else {
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }
}

// Upload and parse resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.body.userId || 'anonymous';
    const content = await parseResume(req.file.buffer, req.file.mimetype);
    
    if (!content || content.length < 50) {
      return res.status(400).json({ error: 'Resume content too short or could not be parsed' });
    }

    // Store the parsed resume
    userResumes.set(userId, {
      content,
      uploadedAt: new Date(),
      fileName: req.file.originalname
    });

    res.json({ 
      message: 'Resume uploaded and parsed successfully',
      contentLength: content.length,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chat with AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userResume = userResumes.get(userId || 'anonymous');
    const resumeContent = userResume ? userResume.content : '';

    const aiResponse = await callOllama(message, resumeContent);

    res.json({ 
      response: aiResponse,
      hasResume: !!userResume
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get resume status
router.get('/resume-status/:userId', (req, res) => {
  const userId = req.params.userId || 'anonymous';
  const userResume = userResumes.get(userId);
  
  res.json({
    hasResume: !!userResume,
    uploadedAt: userResume?.uploadedAt,
    fileName: userResume?.fileName
  });
});

// Delete resume
router.delete('/resume/:userId', (req, res) => {
  const userId = req.params.userId || 'anonymous';
  const deleted = userResumes.delete(userId);
  
  res.json({ 
    success: deleted,
    message: deleted ? 'Resume deleted successfully' : 'No resume found'
  });
});

// Check Ollama status
router.get('/ollama-status', async (req, res) => {
  try {
    const status = await checkOllamaStatus();
    res.json(status);
  } catch (error) {
    res.json({ available: false, error: error.message });
  }
});

module.exports = router;
