# Ollama Local LLM Setup Guide

## Overview
This guide shows how to set up Ollama as a local LLM alternative to OpenAI API for development and testing. Ollama provides free local AI inference while maintaining all the intelligent features of your administrative assistant.

## 🚀 **Quick Setup**

### 1. Install Ollama
**Windows:**
```bash
# Download and install from https://ollama.com/download
# Or use winget
winget install Ollama.Ollama
```

**macOS:**
```bash
# Download from https://ollama.com/download
# Or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Start Ollama Service
```bash
# Start Ollama (runs on http://localhost:11434 by default)
ollama serve
```

### 3. Download Gemma3:8b Model
```bash
# Download the recommended model (about 4.8GB)
ollama pull gemma3:8b

# Verify model is available
ollama list
```

### 4. Configure Environment Variables
Add to your `.env` file:
```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:8b
OLLAMA_TIMEOUT=30000

# Optional: Disable OpenAI if you only want to use Ollama
# OPENAI_API_KEY=
```

### 5. Test Integration
```bash
# Start your backend
npm run dev

# The application will automatically detect Ollama and use it for:
# - Email analysis and prioritization
# - Morning digest generation
# - Chat responses (with OpenAI fallback)
```

---

## 🎯 **Features Powered by Ollama**

### **Email Intelligence**
- **Content Analysis**: AI analyzes email content for urgency, sentiment, and business relevance
- **Smart Categorization**: Automatically categorizes emails as urgent, standard, follow-up, admin, or spam
- **Morning Digests**: AI-generated summaries with actionable insights and recommendations

### **Chat Interface**
- **Natural Conversations**: Full AI chat capabilities using local Gemma3 model
- **Context Awareness**: Maintains conversation context and business intelligence
- **Industry Knowledge**: Integrates with Australian trade standards and regulations

### **Business Intelligence**
- **Pattern Recognition**: Learns business patterns from natural conversation
- **Smart Suggestions**: Proactive recommendations based on detected context
- **Compliance Integration**: Automatic standard suggestions for trade work

---

## 💻 **System Requirements**

### **Minimum Requirements**
- **RAM**: 8GB (Gemma3:8b requires ~5GB when loaded)
- **Storage**: 6GB free space for model
- **CPU**: Modern x64 processor (Intel/AMD)

### **Recommended**
- **RAM**: 16GB+ for better performance
- **Storage**: SSD for faster model loading
- **CPU**: 8+ cores for optimal response times

### **Performance Expectations**
- **Response Time**: 2-10 seconds (vs <1s for OpenAI API)
- **Quality**: Excellent for trade business context
- **Offline**: Works completely offline once model is downloaded

---

## ⚙️ **Advanced Configuration**

### **Model Options**
```bash
# Smaller, faster model (2GB)
ollama pull gemma3:2b

# Larger, more capable model (14GB) 
ollama pull gemma3:27b

# Update environment for different model
OLLAMA_MODEL=gemma3:2b
```

### **Performance Tuning**
```bash
# Increase timeout for slower systems
OLLAMA_TIMEOUT=60000

# Run Ollama on different port
ollama serve --host 0.0.0.0:11435
OLLAMA_BASE_URL=http://localhost:11435
```

### **Memory Management**
```bash
# Check Ollama memory usage
ollama ps

# Unload model to free memory
ollama stop gemma3:8b

# Preload model for faster first response
ollama run gemma3:8b ""
```

---

## 🔧 **Integration Details**

### **Hybrid Operation**
The application intelligently uses both Ollama and OpenAI:

1. **Ollama First**: Tries local AI for all operations
2. **OpenAI Fallback**: Falls back to OpenAI API if Ollama fails
3. **Graceful Degradation**: Rule-based analysis if both AI systems fail

### **Service Detection**
```typescript
// Service automatically detects Ollama availability
const isOllamaAvailable = ollamaService.getAvailability();

// Get service statistics
const stats = ollamaService.getStats();
console.log(stats);
// { isAvailable: true, model: "gemma3:8b", baseUrl: "http://localhost:11434" }
```

### **Email Analysis Workflow**
```typescript
// Enhanced email analysis with AI
const analysis = await EmailIntelligenceService.analyzeEmails(emails, preferences);

// Morning digest with AI insights
const digest = await EmailIntelligenceService.generateMorningDigest(
  analyzedEmails, 
  dateRange, 
  userContext
);
```

---

## 🛠️ **Troubleshooting**

### **Model Not Found**
```bash
# Check available models
ollama list

# Re-download if missing
ollama pull gemma3:8b
```

### **Service Not Running**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve
```

### **Memory Issues**
```bash
# Free up memory by stopping unused models
ollama stop --all

# Check system memory usage
# Windows: Task Manager > Performance > Memory
# macOS: Activity Monitor > Memory
# Linux: htop or free -h
```

### **Slow Performance**
```bash
# Try smaller model
ollama pull gemma3:2b
OLLAMA_MODEL=gemma3:2b

# Check CPU usage during inference
# High CPU usage is normal during response generation
```

---

## 📊 **Monitoring & Logging**

### **Application Logs**
```javascript
// Watch for Ollama usage in logs
tail -f logs/app.log | grep "Ollama"

// Examples:
// "Using Ollama for chat completion"
// "Email analyzed using Ollama AI"
// "Ollama service available with model: gemma3:8b"
```

### **Ollama Logs**
```bash
# View Ollama logs
journalctl -u ollama  # Linux systemd
Console app           # macOS
Event Viewer         # Windows
```

---

## 🔄 **Development Workflow**

### **Recommended Setup**
1. **Development**: Use Ollama for cost-free testing
2. **Production**: Use OpenAI API for reliability and speed
3. **Hybrid**: Use Ollama with OpenAI fallback for best of both

### **Cost Savings**
- **Development**: $0 (vs ~$10-50/month OpenAI during development)
- **Testing**: Unlimited local inference
- **Privacy**: No data sent to external APIs

### **Environment-Based Configuration**
```bash
# Development .env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:8b
# OPENAI_API_KEY=  # Commented out for dev

# Production .env  
OPENAI_API_KEY=your_production_key
# OLLAMA_BASE_URL=  # Commented out for production
```

---

## 🎯 **Best Practices**

### **Development**
- Use Ollama for feature development and testing
- Keep OpenAI fallback enabled for reliability
- Monitor performance differences during development

### **Performance**
- Preload models at application startup for faster responses
- Use smaller models for development, larger for demos
- Monitor memory usage, especially on development machines

### **Production Readiness**
- Test both Ollama and OpenAI code paths
- Implement proper error handling for both services
- Consider hybrid deployment (Ollama + OpenAI fallback)

---

This setup gives you a completely local, cost-effective AI development environment while maintaining the option to scale to cloud AI services when needed! 🚀