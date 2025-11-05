"""
FastAPI Server for Agentic Tool Research
Provides endpoints to trigger research and manage tools database
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncIterator
import json
import os
import asyncio
from pathlib import Path
from datetime import datetime
from queue import Queue
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from agents.research_agent import ToolResearchAgent, ToolCuratorAgent
from agents.openai_websearch_agent import OpenAIWebSearchAgent
from agents.claude_autonomous_agent import ClaudeAutonomousAgent
from agents.openai_tools_websearch_agent import OpenAIToolsWebSearchAgent

app = FastAPI(title="Agentic Tool Research API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",  # Alternative port when 8080 is busy
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
DATA_DIR = Path(__file__).parent / "data"
TOOLS_DB_PATH = DATA_DIR / "tools.json"
RESEARCH_LOG_PATH = DATA_DIR / "research_log.json"

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)


# Pydantic models
class ResearchRequest(BaseModel):
    tags: Optional[List[str]] = None
    max_tools: int = 10
    update_existing: bool = False  # If True, update existing tools with fresh data


class ResearchStatus(BaseModel):
    status: str
    message: str
    discovered_count: Optional[int] = None
    added_count: Optional[int] = None


class Tool(BaseModel):
    id: int
    title: str
    description: str
    category: str
    url: str
    features: List[str]
    stars: Optional[int] = 0
    version: Optional[str] = "1.0.0"
    lastUpdated: Optional[str] = "recently"
    discoveredAt: Optional[str] = None
    searchTimestamp: Optional[str] = None
    publicSentiment: Optional[str] = None
    usageNiche: Optional[str] = None
    communityDiscussions: Optional[List] = None  # Can be List[str] or List[dict] with sources
    sentimentAnalyzedAt: Optional[str] = None
    sentimentSources: Optional[List[dict]] = None  # List of {"title": str, "url": str}


# In-memory research status
research_status = {
    "is_running": False,
    "last_run": None,
    "last_result": None
}


def load_tools() -> List[dict]:
    """Load tools from JSON database"""
    if TOOLS_DB_PATH.exists():
        with open(TOOLS_DB_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_tools(tools: List[dict]) -> None:
    """Save tools to JSON database"""
    with open(TOOLS_DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(tools, f, indent=2, ensure_ascii=False)


def log_research(data: dict) -> None:
    """Log research activity"""
    log_entries = []
    if RESEARCH_LOG_PATH.exists():
        with open(RESEARCH_LOG_PATH, 'r', encoding='utf-8') as f:
            log_entries = json.load(f)

    log_entries.append({
        **data,
        "timestamp": datetime.now().isoformat()
    })

    # Keep only last 100 entries
    log_entries = log_entries[-100:]

    with open(RESEARCH_LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(log_entries, f, indent=2, ensure_ascii=False)


@app.get("/")
def root():
    """API root"""
    return {
        "name": "Agentic Tool Research API",
        "version": "1.0.0",
        "endpoints": {
            "/tools": "GET - List all tools",
            "/tools/research": "POST - Trigger research for new tools",
            "/tools/research/status": "GET - Get research status",
            "/tools/research/tags": "GET - Get available research tags",
            "/tools/{tool_id}": "GET - Get specific tool",
            "/websearch/agentic": "POST - Agentic web search using OpenAI tools",
        }
    }


@app.get("/tools/research/tags")
def get_research_tags():
    """Get available research tags"""
    return {
        "tags": ToolResearchAgent.RESEARCH_TAGS
    }


@app.get("/tools", response_model=List[Tool])
def get_tools():
    """Get all tools from database"""
    tools = load_tools()
    return tools


@app.get("/tools/{tool_id}")
def get_tool(tool_id: int):
    """Get a specific tool by ID"""
    tools = load_tools()
    tool = next((t for t in tools if t["id"] == tool_id), None)

    if not tool:
        raise HTTPException(status_code=404, detail=f"Tool with ID {tool_id} not found")

    return tool


@app.post("/tools/research", response_model=ResearchStatus)
async def trigger_research(request: ResearchRequest, background_tasks: BackgroundTasks):
    """Trigger automated tool research"""

    if research_status["is_running"]:
        return ResearchStatus(
            status="already_running",
            message="Research is already in progress. Please wait."
        )

    # Run research in background
    background_tasks.add_task(
        run_research_pipeline,
        tags=request.tags,
        max_tools=request.max_tools,
        update_existing=request.update_existing
    )

    return ResearchStatus(
        status="started",
        message="Research pipeline started. Check /tools/research/status for updates."
    )


@app.get("/tools/research/status", response_model=ResearchStatus)
def get_research_status():
    """Get current research status"""
    if research_status["is_running"]:
        return ResearchStatus(
            status="running",
            message="Research in progress..."
        )

    if research_status["last_result"]:
        return ResearchStatus(
            status="completed",
            message=f"Last research completed at {research_status['last_run']}",
            discovered_count=research_status["last_result"].get("discovered"),
            added_count=research_status["last_result"].get("added")
        )

    return ResearchStatus(
        status="idle",
        message="No research has been run yet"
    )


def run_research_pipeline(tags: Optional[List[str]] = None, max_tools: int = 10, update_existing: bool = False):
    """Background task: Run the research pipeline"""
    global research_status

    research_status["is_running"] = True

    try:
        # Initialize agents
        research_agent = ToolResearchAgent()
        curator_agent = ToolCuratorAgent()

        # Phase 1: Research
        print(f"[RESEARCH] Starting research pipeline...")
        discovered_tools = research_agent.research_tools(tags=tags, max_tools=max_tools)

        # Phase 2: Curate (remove duplicates with existing tools, or update them if requested)
        existing_tools = load_tools()
        curated_tools = curator_agent.curate_tools(discovered_tools, existing_tools, update_existing=update_existing)

        # Phase 3: Merge with existing database
        if curated_tools:
            if update_existing:
                # When updating, curated_tools contains both new and updated tools
                # Build a map of tools to update (by title)
                updates_map = {t["title"].lower(): t for t in curated_tools if t.get("_is_update")}
                new_tools = [t for t in curated_tools if not t.get("_is_update")]

                # Update existing tools
                updated_count = 0
                for existing_tool in existing_tools:
                    if existing_tool["title"].lower() in updates_map:
                        updated_data = updates_map[existing_tool["title"].lower()]
                        # Keep the original ID
                        original_id = existing_tool["id"]
                        existing_tool.update(updated_data)
                        existing_tool["id"] = original_id
                        updated_count += 1

                # Add new tools with fresh IDs
                max_id = max([t.get("id", 0) for t in existing_tools], default=0)
                for idx, tool in enumerate(new_tools, start=max_id + 1):
                    tool["id"] = idx
                    # Remove update flag
                    tool.pop("_is_update", None)

                # Combine
                all_tools = existing_tools + new_tools
                save_tools(all_tools)

                print(f"[SUCCESS] Updated {updated_count} existing tools, added {len(new_tools)} new tools")
            else:
                # Original behavior: just add new tools
                max_id = max([t.get("id", 0) for t in existing_tools], default=0)
                for idx, tool in enumerate(curated_tools, start=max_id + 1):
                    tool["id"] = idx

                # Append to existing tools
                all_tools = existing_tools + curated_tools

                # Save updated database
                save_tools(all_tools)

                print(f"[SUCCESS] Added {len(curated_tools)} new tools to database")

        # Log research activity
        log_research({
            "tags": tags,
            "max_tools": max_tools,
            "discovered": len(discovered_tools),
            "curated": len(curated_tools),
            "added": len(curated_tools)
        })

        # Update status
        research_status["last_run"] = datetime.now().isoformat()
        research_status["last_result"] = {
            "discovered": len(discovered_tools),
            "added": len(curated_tools)
        }

    except Exception as e:
        print(f"[ERROR] Research pipeline error: {e}")
        research_status["last_result"] = {
            "error": str(e)
        }

    finally:
        research_status["is_running"] = False


@app.get("/tools/research/logs")
def get_research_logs():
    """Get research activity logs"""
    if RESEARCH_LOG_PATH.exists():
        with open(RESEARCH_LOG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


# OpenAI WebSearch endpoints
class WebSearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 10


class TopicResearchRequest(BaseModel):
    topic: str
    aspects: Optional[List[str]] = None


class AgenticWebSearchRequest(BaseModel):
    topic: Optional[str] = None
    search_terms: List[str]
    instructions: Optional[str] = None
    focus_questions: Optional[List[str]] = None
    max_output_tokens: Optional[int] = None


@app.post("/websearch/search")
def openai_web_search(request: WebSearchRequest):
    """
    Perform web search using OpenAI's native web search tool

    Example request:
    {
        "query": "latest AI coding assistants 2025",
        "max_results": 10
    }
    """
    try:
        agent = OpenAIWebSearchAgent()
        result = agent.search(query=request.query, max_results=request.max_results)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/websearch/research")
def openai_research_topic(request: TopicResearchRequest):
    """
    Conduct comprehensive research on a topic using OpenAI's web search

    Example request:
    {
        "topic": "Agentic coding tools",
        "aspects": ["latest tools", "key features", "trends"]
    }
    """
    try:
        agent = OpenAIWebSearchAgent()
        result = agent.research_topic(topic=request.topic, aspects=request.aspects)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Claude Autonomous Agent Endpoints
# ============================================================================

# Global progress queue for SSE
progress_queue = Queue()

# Claude research status
claude_research_status = {
    "is_running": False,
    "last_run": None,
    "last_result": None,
    "current_progress": []
}


class ClaudeResearchRequest(BaseModel):
    focus_areas: Optional[List[str]] = None
    max_tools: int = 10
    agent_type: str = "claude"  # "claude" or "openai" for backwards compat


@app.post("/tools/research/claude")
async def trigger_claude_research(request: ClaudeResearchRequest, background_tasks: BackgroundTasks):
    """
    Trigger autonomous research using Claude Agent SDK

    This endpoint starts an autonomous research session where Claude:
    - Creates its own research strategy
    - Executes web searches independently
    - Validates and enriches discovered tools
    - Analyzes public sentiment using real web search

    Returns immediately with status. Use /tools/research/claude/status for updates.
    """
    if claude_research_status["is_running"]:
        return {
            "status": "already_running",
            "message": "Claude research is already in progress. Check /tools/research/claude/status"
        }

    # Clear previous progress
    claude_research_status["current_progress"] = []

    # Clear the queue
    while not progress_queue.empty():
        try:
            progress_queue.get_nowait()
        except:
            break

    # Run research in background
    background_tasks.add_task(
        run_claude_research_pipeline,
        focus_areas=request.focus_areas,
        max_tools=request.max_tools
    )

    return {
        "status": "started",
        "message": "Claude autonomous research started. Monitor progress at /tools/research/claude/progress",
        "agent": "claude-sonnet-4-20250514"
    }


@app.get("/tools/research/claude/status")
def get_claude_research_status():
    """Get current Claude research status"""
    if claude_research_status["is_running"]:
        return {
            "status": "running",
            "message": "Research in progress...",
            "progress": claude_research_status["current_progress"][-10:]  # Last 10 updates
        }

    if claude_research_status["last_result"]:
        return {
            "status": "completed",
            "message": f"Last research completed at {claude_research_status['last_run']}",
            "discovered_count": claude_research_status["last_result"].get("discovered"),
            "added_count": claude_research_status["last_result"].get("added"),
            "progress": claude_research_status["current_progress"]
        }

    return {
        "status": "idle",
        "message": "No research has been run yet"
    }


@app.get("/tools/research/claude/progress")
async def claude_research_progress_stream():
    """
    Server-Sent Events stream for real-time research progress

    Connect to this endpoint to receive live updates as the agent works.
    Format: text/event-stream
    """
    async def event_generator() -> AsyncIterator[str]:
        """Generate SSE events from progress queue"""
        try:
            while True:
                # Check if research is still running
                if not claude_research_status["is_running"] and progress_queue.empty():
                    # Send final event
                    yield f"data: {json.dumps({'type': 'complete', 'message': 'Research complete'})}\n\n"
                    break

                # Wait for progress updates
                await asyncio.sleep(0.5)

                # Get all available progress updates
                updates = []
                while not progress_queue.empty():
                    try:
                        update = progress_queue.get_nowait()
                        updates.append(update)
                    except:
                        break

                # Send updates as SSE
                for update in updates:
                    event_data = json.dumps({
                        "type": "progress",
                        "message": update,
                        "timestamp": datetime.now().isoformat()
                    })
                    yield f"data: {event_data}\n\n"

        except asyncio.CancelledError:
            # Client disconnected
            pass

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


def run_claude_research_pipeline(focus_areas: Optional[List[str]] = None, max_tools: int = 10):
    """
    Background task: Run the Claude autonomous research pipeline

    This is where the magic happens - Claude autonomously:
    1. Plans research strategy
    2. Executes web searches
    3. Discovers and validates tools
    4. Analyzes public sentiment with real web search
    5. Enriches tool metadata
    """
    global claude_research_status

    claude_research_status["is_running"] = True
    claude_research_status["current_progress"] = []

    def progress_callback(message: str):
        """Callback for agent progress updates"""
        progress_queue.put(message)
        claude_research_status["current_progress"].append({
            "message": message,
            "timestamp": datetime.now().isoformat()
        })

    try:
        print(f"[CLAUDE RESEARCH] Starting autonomous research...")
        progress_callback("🚀 Initializing Claude autonomous agent...")

        # Initialize Claude agent with progress callback
        agent = ClaudeAutonomousAgent(progress_callback=progress_callback)

        # Run autonomous research
        progress_callback(f"🎯 Focus areas: {focus_areas or 'General agentic tools'}")
        progress_callback(f"🎯 Target: {max_tools} tools")

        discovered_tools = agent.research_tools(
            focus_areas=focus_areas,
            max_tools=max_tools
        )

        progress_callback(f"✅ Research complete! Discovered {len(discovered_tools)} tools")

        # Merge with existing database
        existing_tools = load_tools()
        existing_titles = {t["title"].lower() for t in existing_tools}

        # Filter out tools that already exist (or update them)
        new_tools = []
        for tool in discovered_tools:
            if tool["title"].lower() not in existing_titles:
                new_tools.append(tool)

        if new_tools:
            # Assign IDs
            max_id = max([t.get("id", 0) for t in existing_tools], default=0)
            for idx, tool in enumerate(new_tools, start=max_id + 1):
                tool["id"] = idx

            # Add to database
            all_tools = existing_tools + new_tools
            save_tools(all_tools)

            progress_callback(f"💾 Saved {len(new_tools)} new tools to database")
        else:
            progress_callback("ℹ️ No new tools found (all were duplicates)")

        # Log research activity
        log_research({
            "agent": "claude-autonomous",
            "focus_areas": focus_areas,
            "max_tools": max_tools,
            "discovered": len(discovered_tools),
            "new_tools": len(new_tools)
        })

        # Update status
        claude_research_status["last_run"] = datetime.now().isoformat()
        claude_research_status["last_result"] = {
            "discovered": len(discovered_tools),
            "added": len(new_tools)
        }

        progress_callback("✨ Research session complete!")

        print(f"[CLAUDE RESEARCH] Success! Added {len(new_tools)} tools")

    except Exception as e:
        error_msg = f"❌ Research error: {str(e)}"
        progress_callback(error_msg)
        print(f"[CLAUDE RESEARCH] Error: {e}")

        claude_research_status["last_result"] = {
            "error": str(e)
        }

    finally:
        claude_research_status["is_running"] = False


@app.post("/tools/{tool_id}/refresh-sentiment")
async def refresh_tool_sentiment(tool_id: int, background_tasks: BackgroundTasks):
    """
    Refresh sentiment analysis for a specific tool

    This allows updating sentiment for existing tools without sentiment data
    or refreshing outdated sentiment analysis
    """
    tools = load_tools()
    tool = next((t for t in tools if t["id"] == tool_id), None)

    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    # Run sentiment analysis in background
    background_tasks.add_task(
        refresh_sentiment_for_tool,
        tool_id=tool_id
    )

    return {
        "status": "started",
        "message": f"Sentiment refresh started for {tool['title']}",
        "tool_id": tool_id
    }


def refresh_sentiment_for_tool(tool_id: int):
    """Background task to refresh sentiment for a single tool"""
    try:
        tools = load_tools()
        tool_index = next((i for i, t in enumerate(tools) if t["id"] == tool_id), None)

        if tool_index is None:
            print(f"[SENTIMENT REFRESH] Tool {tool_id} not found")
            return

        tool = tools[tool_index]
        print(f"[SENTIMENT REFRESH] Starting sentiment analysis for: {tool['title']}")

        # Create Claude agent
        agent = ClaudeAutonomousAgent()

        # Run sentiment analysis on this one tool
        enriched_tools = agent._analyze_sentiment_for_tools([tool])

        if enriched_tools:
            # Update the tool in the database
            tools[tool_index] = enriched_tools[0]
            save_tools(tools)
            print(f"[SENTIMENT REFRESH] Successfully updated sentiment for {tool['title']}")

    except Exception as e:
        print(f"[SENTIMENT REFRESH] Error: {e}")


@app.post("/websearch/agentic")
def openai_agentic_research(request: AgenticWebSearchRequest):
    """
    Run agentic research using the Responses API with web_search and optional MCP servers.

    Example request:
    {
        "topic": "Agentic coding platforms",
        "search_terms": ["OpenAI MCP connectors", "agentic coding tool adoption"],
        "instructions": "Focus on enterprise readiness.",
        "focus_questions": ["Which connectors support SharePoint?"]
    }
    """
    try:
        agent = OpenAIToolsWebSearchAgent()
        result = agent.run_agentic_research(
            topic=request.topic,
            search_terms=request.search_terms,
            user_instructions=request.instructions,
            focus_questions=request.focus_questions,
            max_output_tokens=request.max_output_tokens,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
