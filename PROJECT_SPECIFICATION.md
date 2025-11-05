# Agentic Tool Digest - Complete Project Specification

## Executive Summary

Build a full-stack web application that uses autonomous AI agents (powered by Anthropic's Claude) to automatically discover, research, validate, and analyze agentic coding tools and AI-powered developer platforms. The system should perform real web searches, validate findings, analyze public sentiment from developer communities, and maintain a continuously updated directory with timestamped data.

---

## Core Concept

**Problem**: The landscape of AI-powered coding tools evolves faster than humans can manually track and curate.

**Solution**: Deploy an autonomous Claude AI agent that:
1. Plans its own research strategy
2. Executes real web searches (Tavily or DuckDuckGo)
3. Discovers and validates tools automatically
4. Analyzes real public sentiment from Reddit, HackerNews, Twitter, dev.to
5. Maintains a quality-controlled directory with temporal tracking

**Key Differentiator**: This is NOT a simple LLM wrapper. The agent makes autonomous decisions, uses real web search (not hallucinations), and analyzes actual community discussions with timestamps.

---

## Project Goals

### Primary Objectives
1. **Autonomous Discovery**: Agent discovers new tools without human intervention
2. **Real-World Validation**: Every data point sourced from actual web searches
3. **Sentiment Analysis**: Track what developers really think by analyzing community discussions
4. **Temporal Tracking**: Monitor how tools and opinions evolve over time
5. **Transparency**: Show users what the agent is thinking and doing in real-time

### Success Criteria
- Tools discovered automatically match quality of human curation
- Sentiment data reflects actual developer opinions (verifiable via source URLs)
- Real-time progress streaming works smoothly
- System prevents duplicate entries
- Data includes timestamps for tracking evolution

---

## Technical Architecture

### High-Level Stack

```
┌─────────────────────────────────────┐
│   Frontend: React + TypeScript      │
│   UI: Shadcn/UI + Tailwind CSS      │
│   Build: Vite                       │
└─────────────┬───────────────────────┘
              │ HTTP + SSE
┌─────────────▼───────────────────────┐
│   Backend: Python FastAPI           │
│   Agent: Anthropic Claude SDK       │
│   Search: Tavily + DuckDuckGo       │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
  Claude    Tavily   DuckDuckGo
   API      Search    Search
```

### Data Flow
1. User configures research parameters (focus areas, max tools)
2. Frontend sends POST request to backend
3. Backend starts Claude agent as background task
4. Agent autonomously: plans → searches → validates → analyzes sentiment
5. Progress updates stream to frontend via Server-Sent Events (SSE)
6. Validated tools saved to JSON database
7. Frontend displays results in browsable directory

---

## Backend Specifications

### Technology Stack Requirements

**Core Framework:**
- Python 3.8+
- FastAPI (async web framework)
- Uvicorn (ASGI server)
- Pydantic (data validation)

**AI & Search:**
- anthropic>=0.39.0 (Claude SDK)
- tavily-python>=0.5.0 (AI-optimized search, 1000 free/month)
- duckduckgo-search>=7.0.0 (free fallback)

**Support:**
- python-dotenv (environment management)
- requests, beautifulsoup4 (web scraping if needed)

### Environment Variables
```
ANTHROPIC_API_KEY=required
TAVILY_API_KEY=optional_but_recommended
```

### API Endpoints to Implement

#### Claude Autonomous Research Endpoints

**1. POST /tools/research/claude**
- **Purpose**: Start autonomous research session
- **Request Body**:
  ```json
  {
    "focus_areas": ["AI code editors", "Terminal tools"],  // optional
    "max_tools": 10  // integer, default 10
  }
  ```
- **Response**:
  ```json
  {
    "status": "started",
    "message": "Claude autonomous research started. Monitor progress at /tools/research/claude/progress",
    "agent": "claude-sonnet-4-20250514"
  }
  ```
- **Behavior**: Returns immediately, runs research in background task

**2. GET /tools/research/claude/status**
- **Purpose**: Poll current research status
- **Response**:
  ```json
  {
    "status": "running" | "completed" | "idle",
    "message": "Research in progress...",
    "discovered_count": 15,
    "added_count": 8,
    "progress": [
      {"message": "🔍 Executing search 1/5", "timestamp": "2025-11-04T12:00:00"}
    ]
  }
  ```

**3. GET /tools/research/claude/progress**
- **Purpose**: Server-Sent Events stream for real-time progress
- **Media Type**: text/event-stream
- **Event Format**:
  ```
  data: {"type": "progress", "message": "🤔 Planning research...", "timestamp": "ISO8601"}

  data: {"type": "complete", "message": "Research complete"}
  ```
- **Behavior**: Stream stays open during research, closes when complete

#### Tools Management Endpoints

**4. GET /tools**
- **Purpose**: List all discovered tools
- **Response**: Array of tool objects

**5. GET /tools/{tool_id}**
- **Purpose**: Get specific tool by ID
- **Response**: Single tool object

**6. GET /tools/research/logs**
- **Purpose**: Get research activity history
- **Response**: Array of log entries with timestamps

### Data Models

#### Tool Object Structure
```json
{
  "id": 1,
  "title": "Cursor",
  "description": "Detailed 4-5 sentence description explaining what it does, how it works, target users, and unique features",
  "category": "IDE/Editor" | "Code Completion" | "Terminal Tools" | "Testing" | "Code Review" | "Agent Framework" | "Language Model" | "Developer Platform",
  "url": "https://cursor.com",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],

  // Discovery metadata
  "discoveredAt": "2025-11-04T12:00:00",
  "discoveryQuery": "best AI code editors 2025",
  "searchProvider": "tavily" | "duckduckgo",
  "confidence": 0.95,
  "qualityScore": 0.95,
  "qualityReason": "Widely used, active development",
  "source_url": "https://...",

  // Sentiment analysis (KEY FEATURE)
  "publicSentiment": "Very Positive" | "Positive" | "Mixed" | "Neutral" | "Negative" | "Not Widely Discussed",
  "usageNiche": "Solo developers and startups building MVPs",
  "communityDiscussions": [
    "Actual quote or discussion point from search results",
    "Another real discussion point"
  ],
  "sentimentActivelyDiscussed": true,
  "recentTrends": "Growing adoption in indie hacker community",
  "sentimentConfidence": 0.85,
  "sentimentAnalyzedAt": "2025-11-04T12:00:00",
  "sentimentSourcesAnalyzed": 8
}
```

#### Research Log Entry
```json
{
  "timestamp": "2025-11-04T12:00:00",
  "agent": "claude-autonomous",
  "focus_areas": ["AI editors"],
  "max_tools": 10,
  "discovered": 15,
  "new_tools": 8
}
```

### Claude Autonomous Agent Implementation

This is the core backend logic. Implement as a Python class with these methods:

#### Class: ClaudeAutonomousAgent

**Constructor Parameters:**
- `api_key`: Anthropic API key
- `model`: Default "claude-sonnet-4-20250514"
- `progress_callback`: Function to call with progress updates

**Main Method: research_tools(focus_areas, max_tools)**

Should execute these four phases autonomously:

**PHASE 1: Autonomous Planning**
```python
def _create_research_plan(focus_areas, max_tools) -> Dict
```
- Send prompt to Claude asking it to create a research strategy
- Claude should generate 5-8 diverse search queries based on:
  - User's focus areas (or general agentic tools if none provided)
  - Queries should target: recent tools (2024-2025), popular and emerging tools, different categories
  - Include queries for trending discussions on Reddit, HackerNews, Twitter
  - Include "best of" lists and comparisons
- Claude returns JSON: `{"reasoning": "...", "queries": ["query1", "query2", ...]}`
- If parsing fails, use fallback default queries

**PHASE 2: Web Discovery**
```python
def _execute_discovery_query(query: str)
```
For each planned query:
1. Execute web search using WebSearchTool (max 10 results, advanced depth)
2. Format results for Claude
3. Send prompt asking Claude to extract actual tools from results
4. Prompt should specify:
   - Only real, existing tools (not concepts/vaporware)
   - Focus on developer tools
   - Exclude: papers, tutorials, blog posts
   - Extract: title, detailed description, URL, category, features list, confidence score
5. Claude returns JSON array of tools
6. Add discovery metadata to each tool (timestamp, query used, search provider)
7. Append to agent's discovered_tools list
8. Log progress: "Found X tools from this query"

**PHASE 3: Quality Validation**
```python
def _validate_and_enrich_tools() -> List[Dict]
```
1. Deduplicate discovered tools (by title and URL)
2. Format tools summary for Claude (first 20 to avoid token limits)
3. Send prompt asking Claude to quality-check based on:
   - Real, existing tool (not hypothetical)
   - Actively maintained
   - Genuinely useful
   - Clear value proposition
   - Accessible (has website/GitHub)
4. Claude returns: `{"approved_indices": [1, 3, 5], "quality_scores": {...}}`
5. Filter to only approved tools
6. Add quality scores and reasons to each tool
7. Fallback: if parsing fails, return tools with confidence >= 0.7

**PHASE 4: Sentiment Analysis** (THE KEY DIFFERENTIATOR)
```python
def _analyze_sentiment_for_tools(tools) -> List[Dict]
```
For each validated tool:
1. Execute sentiment-focused web search:
   - Query format: `"{tool_name}" reviews opinions "developers say" OR "user experience" reddit OR hackernews OR twitter 2025`
   - Use search_depth="advanced"
   - Get 8-10 results
2. Format results for Claude
3. Send prompt asking Claude to analyze sentiment based on ACTUAL search results
4. Prompt should ask for:
   - Overall sentiment classification
   - Usage niche based on findings
   - 3-5 key discussion points from search results (actual quotes/points)
   - Whether actively discussed
   - Recent trends visible in discussions
   - Confidence score
5. Claude returns JSON with sentiment data
6. Add all sentiment fields to tool object
7. Add timestamp and sources count
8. Log progress: "Analyzing sentiment X/Y: ToolName"

**Helper Method: _deduplicate_tools(tools)**
- Remove duplicates based on normalized title and URL
- Keep first occurrence

**Helper Method: _extract_json(text)**
- Parse JSON from Claude responses
- Handle markdown code blocks (```json ... ```)
- Use regex to find JSON objects/arrays
- Return None if parsing fails

### Web Search Tool Implementation

#### Class: WebSearchTool

**Constructor Parameters:**
- `provider`: "tavily" | "duckduckgo" | "auto" (default auto)

**Behavior:**
- Auto mode: Use Tavily if API key available, else DuckDuckGo
- Initialize appropriate client on construction
- Print which provider is active

**Method: search(query, max_results=5, search_depth="basic")**
```python
Returns:
{
  "provider": "tavily" | "duckduckgo",
  "query": "original query",
  "results": [
    {
      "title": "Result title",
      "url": "https://...",
      "content": "Result snippet/description",
      "score": 0.95  // relevance score, 1.0 for DuckDuckGo
    }
  ],
  "answer": "AI-generated answer (Tavily only)",
  "timestamp": "ISO8601",
  "total_results": 5
}
```

**Tavily Implementation:**
- Use tavily_client.search()
- Parameters: query, max_results, search_depth, include_answer=True
- Extract results array and answer
- If Tavily fails and DuckDuckGo available, auto-fallback

**DuckDuckGo Implementation:**
- Use DDGS().text(query, max_results)
- Format results to match standard structure
- No AI answer available (return empty string)

**Method: search_sentiment(tool_name, max_results=10)**
- Craft sentiment-focused query (see Phase 4 above)
- Call search() with advanced depth
- Return results

**Method: format_for_claude(search_results)**
- Format search results into readable text for Claude
- Include: query, provider, timestamp, answer (if any), all results with titles, URLs, and content
- Return formatted string

### Background Task Management

**Function: run_claude_research_pipeline(focus_areas, max_tools)**
- Run as FastAPI background task
- Use global status dictionary to track state
- Progress callback should:
  - Put message in progress queue (for SSE streaming)
  - Append to status["current_progress"]
  - Print to console
- Error handling with try/finally to ensure status["is_running"] = False
- Merge discovered tools with existing database:
  - Load existing tools from JSON
  - Filter out duplicates (by lowercase title)
  - Assign sequential IDs to new tools
  - Append to existing tools
  - Save back to JSON
- Log research activity to separate log file

### Data Storage

**File: backend/data/tools.json**
- JSON array of tool objects
- Create data directory if doesn't exist
- Load: Read JSON file, return empty array if not exists
- Save: Write JSON with indent=2, ensure_ascii=False

**File: backend/data/research_log.json**
- JSON array of log entries
- Append new entry on each research session
- Keep only last 100 entries

### CORS Configuration
Allow origins:
- http://localhost:5173 (Vite default)
- http://localhost:3000
- http://localhost:8080
- http://localhost:8081

---

## Frontend Specifications

### Technology Stack Requirements

**Core Framework:**
- React 18.3+
- TypeScript
- Vite (build tool)

**UI Components:**
- Shadcn UI (built on Radix UI primitives)
- Tailwind CSS
- Lucide React (icons)

**State Management:**
- React hooks (useState, useEffect, useRef)
- TanStack Query (optional, for server state)

**Styling:**
- Tailwind CSS utility classes
- Dark mode support via next-themes

### Pages & Routing

**Main Page: Index**
- Three-tab interface using Shadcn Tabs component
- Tabs:
  1. "Tools Directory" (Database icon) - Browse discovered tools
  2. "AI Web Search" (Search icon) - Legacy feature (can be basic)
  3. "Agentic Researcher" (Sparkles icon) - PRIMARY FEATURE

### Component Specifications

#### 1. ClaudeResearchControls Component

**Location**: Main feature, shown in "Agentic Researcher" tab

**State Management:**
```typescript
const [isResearching, setIsResearching] = useState(false)
const [status, setStatus] = useState<ClaudeStatus | null>(null)
const [focusAreas, setFocusAreas] = useState("")
const [maxTools, setMaxTools] = useState(10)
const [progressLog, setProgressLog] = useState<ProgressUpdate[]>([])
const [isConnectedToStream, setIsConnectedToStream] = useState(false)
const eventSourceRef = useRef<EventSource | null>(null)
```

**UI Layout:**

**Header Section:**
- Card with gradient border (blue/purple/pink)
- Brain icon in gradient circle
- Title: "Claude Autonomous Research"
- Badge: "Powered by Claude Sonnet 4.5"
- Description: "Let Claude autonomously discover, validate, and analyze agentic coding tools with real web search"

**Configuration Section (Grid Layout):**

Left Column:
- Label: "Focus Areas (optional, one per line)"
- Textarea input (4 rows)
  - Placeholder: "AI code editors\nTerminal tools\nCode completion"
  - Value: focusAreas state
  - Disabled when researching
- Helper text: "Leave empty to let Claude decide what to research"

Right Column:
- Input: "Maximum Tools to Discover"
  - Type: number, min=1, max=50
  - Value: maxTools state
  - Disabled when researching
- Status indicator:
  - Badge showing current status (idle/running/completed)
  - Icon based on status (spinner/checkmark/alert)
  - If connected to SSE: show "🔴 Live" badge

**Action Buttons:**
- Primary button: "Start Autonomous Research"
  - Gradient: blue → purple → pink
  - Icon: Bot
  - Shows "Researching..." with spinner when active
  - Disabled when already researching
  - onClick: handleStartResearch()
- Refresh button (icon only)
  - Icon: RefreshCw
  - onClick: checkStatus()
  - Disabled when researching

**Progress Log Section (Conditional - show if progressLog.length > 0):**
- Label: "Agent Activity Log" with Sparkles icon
- Badge showing update count
- ScrollArea component (height: 300px)
  - Auto-scrolls to bottom on new messages
  - Displays each progress update:
    - Timestamp (formatted as HH:MM:SS)
    - Message text
    - Fade-in animation for new entries

**Results Summary (Conditional - show when status.status === 'completed'):**
- Green success box
- CheckCircle icon
- Text: "Research Complete!"
- Sub-text: "Discovered X tools, added Y new ones to the database"

**Features Highlight Box:**
- List of key features with checkmarks:
  - "Autonomous Planning: Claude creates its own research strategy"
  - "Real Web Search: Uses Tavily/DuckDuckGo to find current information"
  - "Sentiment Analysis: Searches for public opinions and reviews with timestamps"
  - "Quality Validation: Claude validates each tool before adding it"

**Functions to Implement:**

**checkStatus()**
- Fetch GET /tools/research/claude/status
- Update status state
- If was researching and now completed:
  - Set isResearching = false
  - Close SSE connection
  - Call onResearchComplete callback (if provided)
  - Show success toast
- Load existing progress into progressLog if available

**connectToProgressStream()**
- Close existing EventSource if any
- Create new EventSource: GET /tools/research/claude/progress
- eventSource.onopen: Set isConnectedToStream = true
- eventSource.onmessage:
  - Parse JSON data
  - Append to progressLog
  - If type === 'complete': close connection, checkStatus()
- eventSource.onerror:
  - Close connection
  - Set isConnectedToStream = false
  - Call checkStatus()

**handleStartResearch()**
- Clear progressLog
- Set isResearching = true
- Parse focus areas (split by newline, trim, filter empty)
- POST to /tools/research/claude with body:
  ```json
  {
    "focus_areas": [...],
    "max_tools": maxTools
  }
  ```
- Show success toast: "Claude Agent Started"
- Call connectToProgressStream()
- Start polling checkStatus() every 5 seconds as backup

**useEffect Hooks:**
- On mount: Call checkStatus()
- On progressLog change: Auto-scroll to bottom
- On unmount: Close eventSource if open

#### 2. ToolsSection Component

**Purpose**: Display browsable directory of discovered tools

**Features:**
- Fetch tools from GET /tools on mount
- Display in grid layout (responsive: 1-3 columns)
- Each tool uses ToolCard component
- Filters:
  - Category dropdown (filter by category)
  - Search input (filter by title/description)
- Sort options:
  - Most recent (discoveredAt desc)
  - Highest quality (qualityScore desc)
  - Alphabetical (title asc)
- Empty state: "No tools discovered yet. Start a research session!"
- Refresh button to reload tools

#### 3. ToolCard Component

**Props**: `tool` object

**UI Layout:**
- Card with hover effect
- Header:
  - Title (font-semibold, text-lg)
  - Category badge (colored by category)
- Content:
  - URL link with external link icon
  - Description (text-sm, muted)
  - Features list (bulleted, max 4 shown)
  - Sentiment section:
    - "Public Sentiment" label
    - Sentiment badge (color-coded: green=positive, yellow=mixed, gray=neutral)
    - Usage niche (text-xs, italic)
    - Collapsible "Community Discussions":
      - List of discussion points
      - "Sources analyzed: X" count
      - Timestamp: "Analyzed on DATE"
- Footer:
  - Quality score indicator (star rating or progress bar)
  - Discovered date (text-xs, muted)

#### 4. Header Component

**Simple top navigation:**
- Logo: "AT" in gradient circle + "AgenticTools" text
- Minimal design

#### 5. HeroSection Component

**Hero banner:**
- Title: "Agentic Tool Digest"
- Subtitle: "Autonomous AI-powered directory of coding tools"
- Brief description
- CTA pointing to Agentic Researcher tab

### Styling Requirements

**Color Scheme:**
- Primary: Blue/Purple gradient
- Accent: Pink
- Success: Green
- Muted: Gray tones
- Dark mode support

**Key UI Patterns:**
- Gradient borders for important cards
- Smooth animations (fade-in, slide-in)
- Loading spinners for async operations
- Toast notifications for user feedback
- Icons from Lucide React (Bot, Brain, Sparkles, Search, Database, etc.)

**Responsive Design:**
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts adjust column count
- Stack elements vertically on mobile

### User Flow

1. **User lands on page** → Shows Tools Directory tab by default
2. **User clicks "Agentic Researcher" tab** → Shows ClaudeResearchControls
3. **User optionally enters focus areas** → e.g., "AI code editors\nTerminal tools"
4. **User sets max tools** → Default 10
5. **User clicks "Start Autonomous Research"**
6. **Frontend establishes SSE connection**
7. **Live progress updates appear in log:**
   - "🚀 Initializing Claude autonomous agent..."
   - "🤔 Planning research strategy..."
   - "📋 Created research plan with 5 queries"
   - "🔍 Executing search 1/5: best AI code editors 2025"
   - "  Found 4 tools from this query"
   - "🔍 Executing search 2/5: GitHub copilot alternatives"
   - "  Found 3 tools from this query"
   - "✅ Discovery complete. Found 12 potential tools"
   - "🔍 Validating and enriching discovered tools..."
   - "  Removed duplicates: 12 -> 10"
   - "✅ Validation complete. 8 tools passed quality checks"
   - "💭 Analyzing public sentiment with web search..."
   - "  Analyzing sentiment 1/8: Cursor"
   - "    Sentiment: Positive (confidence: 0.87)"
   - "  Analyzing sentiment 2/8: Windsurf"
   - "    Sentiment: Very Positive (confidence: 0.92)"
   - "..."
   - "✅ Sentiment analysis complete for 8 tools"
   - "💾 Saved 6 new tools to database"
   - "✨ Research session complete!"
8. **Success summary appears** → "Discovered 8 tools, added 6 new ones"
9. **User switches to "Tools Directory" tab** → Sees newly added tools
10. **User browses tools** → Can filter, sort, read details
11. **User clicks on tool card** → Sees full details including sentiment analysis

---

## Integration Requirements

### API Integration
- Frontend should use configurable API_BASE_URL (environment variable)
- Default: http://localhost:8000
- All fetch calls should include proper error handling
- Show user-friendly error messages via toast notifications

### Real-Time Integration (SSE)
- Use native EventSource API for SSE
- Handle connection errors gracefully
- Automatic reconnection on failure (via status polling)
- Close connections on component unmount

### Error Handling

**Backend:**
- Return proper HTTP status codes (200, 400, 404, 500)
- Include error messages in response body
- Log errors to console
- Graceful degradation (e.g., Tavily → DuckDuckGo fallback)

**Frontend:**
- Try/catch around all async operations
- Display errors via toast notifications
- Show meaningful error messages to users
- Maintain UI state consistency on errors

---

## Development Workflow

### Setup Instructions to Provide

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY
python api.py
# Server runs on http://localhost:8000
```

**Frontend:**
```bash
npm install
npm run dev
# App runs on http://localhost:5173
```

### Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Can start research session
- [ ] SSE progress stream works
- [ ] Progress updates appear in real-time
- [ ] Research completes successfully
- [ ] New tools appear in directory
- [ ] Tools have all required fields
- [ ] Sentiment data is populated
- [ ] Timestamps are correct
- [ ] No duplicate tools in database
- [ ] Error handling works (e.g., invalid API key)
- [ ] Status polling works as fallback
- [ ] UI is responsive on mobile
- [ ] Dark mode works

---

## Advanced Features (Optional Enhancements)

### If Time Permits:

1. **Tool Comparison View**
   - Select 2-3 tools to compare side-by-side
   - Show features, sentiment, quality scores in table format

2. **Sentiment Timeline**
   - If tool analyzed multiple times, show sentiment evolution
   - Graph or timeline visualization

3. **Export Functionality**
   - Export tools to JSON, CSV, or Markdown
   - Generate report of research session

4. **Search & Filters**
   - Full-text search across all tool fields
   - Filter by sentiment (only positive, only recently discussed, etc.)
   - Filter by quality score range

5. **Scheduled Research**
   - Allow user to schedule recurring research (e.g., weekly)
   - Email notifications for new tools

---

## Critical Implementation Notes

### For the Agent Logic:

1. **Claude Must Make Decisions**: The agent should genuinely decide what queries to run, not follow hardcoded templates. Give Claude autonomy in planning.

2. **Use Real Search Results**: Always feed actual web search results to Claude. Never ask Claude to "guess" or "imagine" - it must analyze real data.

3. **Sentiment Must Be Real**: The sentiment analysis MUST be based on actual search results from developer communities. This is the project's key differentiator.

4. **Timestamps Are Critical**: Every analysis should include timestamp so users can track when data was gathered and how it evolves.

5. **Quality Control**: The validation phase should be strict. Better to have fewer high-quality tools than many low-quality ones.

### For the UI:

1. **Real-Time Feel**: The SSE streaming should feel smooth and responsive. Users should see what Claude is "thinking".

2. **Progress Transparency**: Show every step of the process. Users should understand what's happening at all times.

3. **Trust Building**: Display source counts, timestamps, confidence scores to build trust in the data.

4. **Graceful Degradation**: If SSE fails, polling should kick in seamlessly. Users shouldn't notice.

5. **Mobile Experience**: The log viewer and tool cards should work well on mobile devices.

---

## Expected Project Deliverables

1. **Backend (Python FastAPI)**
   - Fully functional API with all specified endpoints
   - Claude autonomous agent with 4-phase research logic
   - Web search integration (Tavily + DuckDuckGo)
   - SSE streaming for real-time progress
   - JSON database management
   - Background task handling

2. **Frontend (React TypeScript)**
   - Three-tab interface (Tools, Search, Agentic Researcher)
   - ClaudeResearchControls component with SSE integration
   - ToolsSection with filtering and sorting
   - ToolCard component showing all metadata
   - Responsive design with dark mode
   - Toast notifications for feedback

3. **Documentation**
   - README with setup instructions
   - API endpoint documentation
   - Environment variable requirements
   - Architecture diagram

4. **Data**
   - Sample tools.json with 5-10 pre-populated tools (for demo)
   - Empty research_log.json

---

## Success Definition

The project is successful if:

1. **Autonomous Operation**: Agent can discover 10+ relevant tools without human intervention
2. **Data Quality**: Discovered tools match human-curated quality standards
3. **Real Sentiment**: Sentiment data verifiably comes from real web sources
4. **Real-Time UX**: Progress streaming works smoothly with <500ms latency
5. **No Duplicates**: System correctly identifies and skips duplicate tools
6. **Error Resilience**: Handles API failures, search errors gracefully
7. **Visual Appeal**: UI is modern, clean, professional-looking
8. **Trust**: Users can verify data quality via timestamps, source counts, quality scores

---

## Final Notes

This is an **agentic AI application**, not a simple chatbot. The AI makes autonomous decisions, validates its own work, and provides transparency into its reasoning. The key innovation is using real web search for both discovery AND sentiment analysis, with temporal tracking to monitor evolution over time.

Build this system to be production-ready: proper error handling, clean separation of concerns, type safety, responsive design, and excellent user experience. The goal is to demonstrate what's possible when you give an AI agent real tools (web search) and autonomy (let it plan and execute).
