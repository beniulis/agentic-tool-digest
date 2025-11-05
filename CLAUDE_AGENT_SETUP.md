# Claude Autonomous Agent Setup Guide

This guide will help you set up the Claude-powered autonomous research agent for discovering and analyzing agentic coding tools.

## 🎯 What's New

The app now features a **Claude Autonomous Research Agent** that:

- 🧠 **Plans its own research strategy** - Claude decides what search queries will be most effective
- 🌐 **Performs real web searches** - Uses Tavily or DuckDuckGo to find current information
- 💭 **Analyzes public sentiment** - Searches Reddit, HackerNews, Twitter for real opinions
- ✅ **Validates quality** - Claude evaluates each tool before adding it to the database
- 📊 **Real-time progress** - Server-Sent Events show you what the agent is doing live
- 🎨 **Beautiful UI** - Modern React interface with live progress logs

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Anthropic API Key** ([Get one here](https://console.anthropic.com/))
4. **Optional: Tavily API Key** for better web search ([Free tier: 1000 searches/month](https://tavily.com))

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- `anthropic>=0.39.0` - Claude Agent SDK
- `tavily-python>=0.5.0` - Web search optimized for AI agents
- `duckduckgo-search>=7.0.0` - Free web search fallback
- FastAPI, Uvicorn, and other backend dependencies

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```env
# Required: Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Tavily API Key (recommended for better search)
# Get free key at https://tavily.com (1000 free searches/month)
TAVILY_API_KEY=your_tavily_api_key_here

# Optional: Keep OpenAI key for legacy features
OPENAI_API_KEY=your_openai_api_key_here
```

**Notes:**
- **DuckDuckGo** works without any API key and is used as automatic fallback
- **Tavily** is recommended as it's optimized for AI agents and has a generous free tier
- The agent will automatically use the best available search provider

### 3. Start the Backend Server

```bash
cd backend
python api.py
```

The server will start on `http://localhost:8000`

You can test the API at `http://localhost:8000/docs`

### 4. Install Frontend Dependencies

```bash
# From project root
npm install
```

### 5. Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎮 Using the Claude Autonomous Agent

1. Open the web app at `http://localhost:5173`
2. Navigate to the "Tools Directory" tab
3. Click on **"🤖 Claude Agent (Recommended)"**
4. (Optional) Enter focus areas like:
   ```
   AI code editors
   Terminal tools
   Code completion frameworks
   ```
5. Set the maximum number of tools to discover (default: 10)
6. Click **"Start Autonomous Research"**
7. Watch the live progress log as Claude:
   - Plans its research strategy
   - Executes web searches
   - Discovers and validates tools
   - Analyzes public sentiment
   - Saves results to the database

## 📊 How It Works

### Phase 1: Autonomous Planning
Claude analyzes your focus areas and creates a strategic research plan with diverse search queries.

### Phase 2: Web Discovery
For each query, the agent:
1. Performs a web search using Tavily or DuckDuckGo
2. Analyzes search results to extract tool information
3. Validates that each tool is real and relevant

### Phase 3: Quality Validation
Claude evaluates each discovered tool based on:
- Is it a real, existing tool?
- Is it actively maintained?
- Does it provide genuine value?
- Is it relevant to agentic coding?

### Phase 4: Sentiment Analysis ⭐
For each validated tool, Claude:
1. Performs targeted web searches for reviews and discussions
2. Searches Reddit, HackerNews, Twitter, dev.to
3. Analyzes real community feedback
4. Stores sentiment summary with timestamp
5. Identifies usage niches and trends

## 🗃️ Data Storage

Tools are stored in `backend/data/tools.json` with this structure:

```json
{
  "id": 1,
  "title": "Tool Name",
  "description": "Detailed description...",
  "category": "Code Completion",
  "url": "https://tool-url.com",
  "features": ["Feature 1", "Feature 2"],

  // Sentiment Analysis (NEW!)
  "publicSentiment": "Positive",
  "usageNiche": "Solo developers building prototypes",
  "communityDiscussions": [
    "Real discussion point from web search",
    "Another community insight"
  ],
  "sentimentAnalyzedAt": "2025-11-04T12:00:00",
  "sentimentSourcesAnalyzed": 8,

  // Metadata
  "discoveredAt": "2025-11-04T12:00:00",
  "qualityScore": 0.95
}
```

## 🔧 API Endpoints

### Claude Agent Endpoints

- `POST /tools/research/claude` - Start autonomous research
  ```json
  {
    "focus_areas": ["AI editors", "CLI tools"],
    "max_tools": 10
  }
  ```

- `GET /tools/research/claude/status` - Get current status
- `GET /tools/research/claude/progress` - Server-Sent Events stream for real-time updates

### Other Endpoints

- `GET /tools` - List all tools
- `GET /tools/{id}` - Get specific tool
- `POST /tools/research` - Legacy OpenAI research
- `POST /websearch/search` - OpenAI web search
- `POST /websearch/research` - OpenAI topic research

## 🐛 Troubleshooting

### "No search provider available"
- Install `tavily-python` or `duckduckgo-search`
- Check that `requirements.txt` dependencies are installed

### "ANTHROPIC_API_KEY required"
- Make sure you created `backend/.env`
- Add your Anthropic API key to the file
- Restart the backend server

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env` if needed

### SSE (real-time progress) not working
- Check browser console for CORS errors
- Ensure backend CORS settings include your frontend URL
- Try refreshing the page

## 💡 Tips

1. **Start small**: Try with `max_tools: 5` first to test the system
2. **Be specific**: Provide focused areas like "terminal AI assistants" rather than "AI tools"
3. **Monitor progress**: Watch the live log to understand what Claude is doing
4. **Check sentiment**: The sentiment analysis shows real community opinions from web searches
5. **Deduplicate**: The agent automatically skips tools already in your database

## 🔮 Advanced Configuration

### Custom Web Search Provider

Edit `backend/agents/web_search_tools.py` to configure search behavior:

```python
# Initialize with specific provider
tool = WebSearchTool(provider="tavily")  # or "duckduckgo" or "auto"
```

### Adjust Claude Model

Edit `backend/agents/claude_autonomous_agent.py`:

```python
agent = ClaudeAutonomousAgent(
    model="claude-sonnet-4-20250514"  # or other Claude models
)
```

### Custom Research Categories

Edit categories in `backend/agents/claude_autonomous_agent.py`:

```python
CATEGORIES = [
    "Code Completion",
    "IDE/Editor",
    "Your Custom Category",
    # ...
]
```

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ClaudeResearchControls.tsx                         │   │
│  │  - Configure research                               │   │
│  │  - Monitor live progress (SSE)                      │   │
│  │  - View results                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP + Server-Sent Events
┌──────────────────────────▼──────────────────────────────────┐
│                     FastAPI Backend                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  /tools/research/claude (POST)                      │   │
│  │  /tools/research/claude/progress (SSE)              │   │
│  └──────────────────────────┬──────────────────────────┘   │
└─────────────────────────────┼──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│              Claude Autonomous Agent                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  1. Plans research strategy                         │  │
│  │  2. Executes web searches                           │  │
│  │  3. Extracts tool information                       │  │
│  │  4. Validates quality                               │  │
│  │  5. Analyzes sentiment                              │  │
│  └──────────────────────────┬──────────────────────────┘  │
└─────────────────────────────┼─────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼─────────┐  ┌──────▼──────┐  ┌─────────▼────────┐
│ Anthropic API    │  │ Tavily API  │  │ DuckDuckGo       │
│ (Claude Sonnet)  │  │ (Web Search)│  │ (Free Search)    │
└──────────────────┘  └─────────────┘  └──────────────────┘
```

## 🎉 What Makes This Special

This implementation goes beyond simple LLM calls:

1. **True Autonomy**: Claude makes its own decisions about research strategy
2. **Real Web Search**: Not hallucinations - actual web results from Tavily/DuckDuckGo
3. **Sentiment from Real Data**: Searches public forums for actual opinions
4. **Quality Control**: Multi-phase validation ensures high-quality results
5. **Real-time Transparency**: See exactly what the agent is thinking and doing
6. **Production Ready**: Proper error handling, fallbacks, and API design

## 📝 License

[Your License Here]

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests.

---

Built with ❤️ using Claude, React, FastAPI, and Tavily
