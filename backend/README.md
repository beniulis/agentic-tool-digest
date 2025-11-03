# Agentic Tool Research Backend

Automated research system for discovering new agentic coding tools using LLM-powered agents.

## Features

- **Multi-Agent Research System**: Discovers, validates, and curates new tools
- **Automated Discovery**: Uses GPT-4 to research and analyze tools
- **Quality Control**: Curator agent filters low-quality results
- **Deduplication**: Automatically removes duplicate entries
- **REST API**: FastAPI backend for frontend integration

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Run the API server:**
   ```bash
   python api.py
   ```

   Server runs on `http://localhost:8000`

## API Endpoints

### GET `/tools`
List all tools in the database

**Response:**
```json
[
  {
    "id": 1,
    "title": "GitHub Copilot",
    "description": "...",
    "category": "Code Completion",
    "url": "https://...",
    "features": [...],
    "stars": 50000,
    "version": "1.156.0",
    "lastUpdated": "2 days ago"
  }
]
```

### POST `/tools/research`
Trigger automated research for new tools

**Request Body:**
```json
{
  "tags": ["AI code editor", "AI testing tool"],  // optional
  "max_tools": 10
}
```

**Response:**
```json
{
  "status": "started",
  "message": "Research pipeline started"
}
```

### GET `/tools/research/status`
Get current research status

**Response:**
```json
{
  "status": "completed",
  "message": "Last research completed at 2024-10-15T14:30:00",
  "discovered_count": 15,
  "added_count": 5
}
```

### GET `/tools/research/logs`
Get research activity history

### GET `/tools/{tool_id}`
Get a specific tool by ID

## Research Pipeline

The research agent follows a 4-phase pipeline:

1. **Discovery**: LLM-powered web research using predefined tags
2. **Validation**: Verify tool existence and enrich metadata
3. **Deduplication**: Remove duplicates within results
4. **Curation**: Filter low-quality tools and duplicates with existing database

## Standalone Usage

You can run the research agent standalone:

```bash
cd backend/agents
python research_agent.py
```

## Customization

### Add Custom Research Tags

Edit `research_agent.py`:

```python
RESEARCH_TAGS = [
    "AI code editor",
    "your custom tag here",
    # ...
]
```

### Adjust Quality Thresholds

Modify the `ToolCuratorAgent._llm_quality_filter()` method to change quality criteria.

## Data Storage

- **`data/tools.json`**: Main tools database
- **`data/research_log.json`**: Research activity history (last 100 runs)

## Architecture

```
backend/
├── agents/
│   └── research_agent.py      # Multi-agent research system
├── data/
│   ├── tools.json            # Tools database
│   └── research_log.json     # Activity logs
├── api.py                     # FastAPI server
├── requirements.txt
└── .env                       # API keys
```

## Future Enhancements

- [ ] GitHub API integration for real star counts
- [ ] Hacker News API scraping
- [ ] Reddit API for r/programming trends
- [ ] Scheduled automatic research (cron job)
- [ ] Email notifications for new discoveries
- [ ] Tool changelog tracking
