# Agentic Tool Digest 🤖

A web application powered by **Claude Autonomous Agents** to automatically discover, research, and analyze agentic coding tools, IDEs, and AI-powered developer platforms.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)
![Claude](https://img.shields.io/badge/claude-sonnet%204.5-purple.svg)

## 🌟 Features

### 🤖 Claude Autonomous Research Agent

The heart of this application is a **truly autonomous AI agent** powered by Anthropic's Claude that:

- **Plans Its Own Strategy**: Claude creates custom search queries based on your focus areas
- **Performs Real Web Searches**: Uses Tavily or DuckDuckGo to find current, real-world information
- **Validates Quality**: Multi-phase validation ensures only high-quality tools are added
- **Analyzes Public Sentiment**: Searches Reddit, HackerNews, Twitter for actual community opinions
- **Live Progress Updates**: Server-Sent Events show you what the agent is thinking in real-time
- **Stores Sentiment with Timestamps**: Track how public opinion evolves over time

### 📊 Tool Database Features

- **Comprehensive Tool Information**: Descriptions, categories, features, GitHub stats
- **Sentiment Analysis**: Real community feedback from web searches
- **Usage Niches**: Understand who uses each tool and why
- **Discovery Timestamps**: Track when tools were discovered
- **Quality Scores**: Claude's assessment of each tool's value

### 🎨 Beautiful UI

- Modern React interface with Shadcn UI components
- Real-time progress monitoring
- Tabbed navigation between Claude and legacy OpenAI research
- Dark mode support
- Responsive design

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- [Anthropic API Key](https://console.anthropic.com/)
- Optional: [Tavily API Key](https://tavily.com) (free tier: 1000 searches/month)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd agentic-tool-digest
   ```

2. **Set up backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Set up frontend**
   ```bash
   cd ..
   npm install
   ```

4. **Start the servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   python api.py
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to `http://localhost:5173`

📖 **For detailed setup instructions, see [CLAUDE_AGENT_SETUP.md](./CLAUDE_AGENT_SETUP.md)**

## 🎮 Usage

1. Open the web app
2. Click on the **"🤖 Claude Agent (Recommended)"** tab
3. Optionally enter focus areas:
   ```
   AI code editors
   Terminal tools
   Code completion frameworks
   ```
4. Set max tools to discover (default: 10)
5. Click **"Start Autonomous Research"**
6. Watch the live progress log as Claude works!

The agent will:
1. Plan its research strategy
2. Execute web searches
3. Extract and validate tools
4. Analyze public sentiment using real web searches
5. Save results to the local JSON database

## 🏗️ Architecture

```
Frontend (React + TypeScript + Shadcn UI)
    ↓ HTTP + Server-Sent Events
Backend (FastAPI)
    ↓
Claude Autonomous Agent
    ├── Web Search Tool (Tavily/DuckDuckGo)
    ├── Research Planning (Claude)
    ├── Quality Validation (Claude)
    └── Sentiment Analysis (Claude + Web Search)
```

## 📦 Technologies

**Frontend:**
- React 18.3 with TypeScript
- Vite for bundling
- Shadcn UI components
- Tailwind CSS
- Lucide icons

**Backend:**
- FastAPI for REST API
- Anthropic Claude SDK
- Tavily (web search for AI)
- DuckDuckGo Search (free fallback)
- Server-Sent Events for real-time updates

**Data:**
- JSON file storage (easily upgradeable to SQL/Vector DB)

## 🔑 API Endpoints

### Claude Agent

- `POST /tools/research/claude` - Start autonomous research
- `GET /tools/research/claude/status` - Get current status
- `GET /tools/research/claude/progress` - Real-time progress stream (SSE)

### Tools

- `GET /tools` - List all tools
- `GET /tools/{id}` - Get specific tool

### Legacy (OpenAI)

- `POST /tools/research` - OpenAI-based research
- `POST /websearch/search` - OpenAI web search
- `POST /websearch/research` - OpenAI topic research

## 📊 Data Structure

Tools are stored in `backend/data/tools.json`:

```json
{
  "id": 1,
  "title": "Cursor",
  "description": "AI-first code editor...",
  "category": "IDE/Editor",
  "url": "https://cursor.com",
  "features": ["AI predictions", "Chat interface", "..."],

  "publicSentiment": "Positive",
  "usageNiche": "Solo developers and startups",
  "communityDiscussions": [
    "Faster than Copilot for multi-file edits",
    "Great VS Code compatibility"
  ],
  "sentimentAnalyzedAt": "2025-11-04T12:00:00",
  "sentimentSourcesAnalyzed": 8,

  "discoveredAt": "2025-11-04T12:00:00",
  "qualityScore": 0.95
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🎯 Future Enhancements

- [ ] PostgreSQL/SQLite database backend
- [ ] Vector search for semantic tool discovery
- [ ] Scheduled automatic research runs
- [ ] Email notifications for new tools
- [ ] Trend detection and alerting
- [ ] Export to various formats (JSON, CSV, Markdown)
- [ ] Tool comparison features
- [ ] User accounts and favorites

## 🐛 Troubleshooting

See [CLAUDE_AGENT_SETUP.md](./CLAUDE_AGENT_SETUP.md#-troubleshooting) for common issues and solutions.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude
- [Tavily](https://tavily.com/) for AI-optimized web search
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [Lovable](https://lovable.dev/) for initial scaffolding

---

**Built with ❤️ using Claude, React, FastAPI, and Tavily**

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/208ad94e-af77-4bfb-a02e-8b698c8f9416

This project was initially scaffolded with Lovable and has been extended with autonomous Claude agents for tool research and sentiment analysis.
