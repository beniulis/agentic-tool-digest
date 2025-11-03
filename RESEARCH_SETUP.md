# Automated Tool Research System - Setup Guide

## 🚀 Overview

The Agentic Tool Digest now includes an **Automated Research System** that uses AI agents to discover, validate, and curate new agentic coding tools automatically.

### Features

- **🤖 Multi-Agent Research**: LLM-powered discovery and curation
- **🎯 Smart Validation**: Quality control and deduplication
- **📊 Real-time Updates**: Live status tracking and notifications
- **🔄 API Integration**: Seamless frontend-backend communication
- **⚡ One-Click Discovery**: Trigger research from the web interface

---

## 📋 Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **OpenAI API Key** (for research agents)

---

## 🛠️ Setup Instructions

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. **Start the API server:**
   ```bash
   python api.py
   ```

   Server runs on `http://localhost:8000`

   **Verify backend is running:**
   ```bash
   curl http://localhost:8000/tools
   ```

### Step 2: Frontend Setup

1. **Navigate to root directory:**
   ```bash
   cd ..  # back to agentic-tool-digest root
   ```

2. **Create frontend environment file:**
   ```bash
   cp .env.example .env
   ```

   Content should be:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Install frontend dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

---

## 🎮 How to Use

### Option 1: Web Interface (Recommended)

1. Open `http://localhost:5173` in your browser
2. Scroll to the "Latest Agentic Tools" section
3. Click **"Discover New Tools"** button in the purple card
4. Watch the AI agents research in real-time!
5. Newly discovered tools appear automatically

### Option 2: API Directly

**Trigger research:**
```bash
curl -X POST http://localhost:8000/tools/research \
  -H "Content-Type: application/json" \
  -d '{
    "max_tools": 10,
    "tags": ["AI code editor", "AI testing tool"]
  }'
```

**Check status:**
```bash
curl http://localhost:8000/tools/research/status
```

**View discovered tools:**
```bash
curl http://localhost:8000/tools
```

### Option 3: Standalone Research Agent

Run the research agent directly:

```bash
cd backend/agents
python research_agent.py
```

This discovers tools and prints results to console (doesn't update database).

---

## 🔧 Configuration

### Customize Research Tags

Edit `backend/agents/research_agent.py`:

```python
RESEARCH_TAGS = [
    "AI code editor",
    "AI pair programming",
    "your custom tag here",
    # ...add more tags
]
```

### Adjust Tool Discovery Limits

In the web interface, use **Advanced Options** to:
- Set custom search tags
- Adjust max tools to discover (5-20)

### Change Quality Thresholds

Modify `backend/agents/research_agent.py`:

```python
class ToolCuratorAgent:
    def _llm_quality_filter(self, tools: List[Dict]) -> List[Dict]:
        # Modify the quality criteria here
        pass
```

---

## 📁 Project Structure

```
agentic-tool-digest/
├── backend/                      # Python research backend
│   ├── agents/
│   │   └── research_agent.py    # Multi-agent research system
│   ├── data/
│   │   ├── tools.json           # Tools database
│   │   └── research_log.json    # Activity logs
│   ├── api.py                   # FastAPI server
│   ├── requirements.txt
│   └── .env                     # API keys
│
├── src/
│   ├── components/
│   │   ├── ResearchControls.tsx # Research UI component
│   │   └── ToolsSection.tsx     # Updated to load from API
│   └── lib/
│       └── api.ts               # API client functions
│
└── .env                         # Frontend config (VITE_API_URL)
```

---

## 🧪 Testing

### Test Backend API

```bash
# List tools
curl http://localhost:8000/tools

# Trigger research
curl -X POST http://localhost:8000/tools/research \
  -H "Content-Type: application/json" \
  -d '{"max_tools": 5}'

# Check status
curl http://localhost:8000/tools/research/status

# View logs
curl http://localhost:8000/tools/research/logs
```

### Test Frontend Integration

1. Open browser dev console (F12)
2. Navigate to Network tab
3. Click "Discover New Tools"
4. Watch API requests to `/tools/research`

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Frontend shows "Failed to load tools"

**Cause:** Backend not running or CORS issue

**Solution:**
1. Ensure backend is running on `http://localhost:8000`
2. Check `.env` has correct `VITE_API_URL`
3. Restart frontend dev server

### Research returns no new tools

**Cause:** All discovered tools already exist in database

**Solution:**
- Try different custom tags
- Increase max_tools limit
- Check research logs: `curl http://localhost:8000/tools/research/logs`

### OpenAI API errors

**Error:** `AuthenticationError: Incorrect API key`

**Solution:**
- Verify API key in `backend/.env`
- Ensure no quotes around the key
- Check API key is active on OpenAI platform

---

## 💡 Tips & Best Practices

1. **Run Research Periodically**: Trigger research weekly to discover new tools
2. **Use Specific Tags**: Better results with focused search terms
3. **Review New Tools**: Check quality before promoting to homepage
4. **Monitor Logs**: Review research logs for trends
5. **Adjust Filters**: Customize curator agent for your quality standards

---

## 🚀 Advanced Features

### Schedule Automatic Research

Use cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Run research daily at 2 AM
0 2 * * * curl -X POST http://localhost:8000/tools/research -d '{"max_tools": 10}'
```

### Add GitHub API Integration

Enhance `research_agent.py` to fetch real GitHub stars:

```python
import requests

def get_github_stars(repo_url):
    # Extract owner/repo from URL
    # Call GitHub API
    # Return star count
    pass
```

### Email Notifications

Add email alerts when new tools are discovered:

```python
import smtplib

def notify_new_tools(tools):
    # Send email with tool list
    pass
```

---

## 📚 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tools` | List all tools |
| `POST` | `/tools/research` | Trigger research |
| `GET` | `/tools/research/status` | Get research status |
| `GET` | `/tools/research/logs` | View activity logs |
| `GET` | `/tools/{id}` | Get specific tool |

### Request/Response Examples

See `backend/README.md` for detailed API documentation.

---

## 🤝 Contributing

Want to improve the research system?

1. Add new research sources (GitHub Trending, Hacker News API)
2. Enhance validation logic
3. Improve metadata enrichment
4. Add more LLM providers (Anthropic, Google)

---

## 📝 License

Same as parent project (MIT)

---

## 🎉 You're All Set!

Visit `http://localhost:5173` and click **"Discover New Tools"** to see the magic happen!

For questions or issues, check the troubleshooting section above.
