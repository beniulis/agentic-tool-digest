"""
FastAPI Server for Agentic Tool Research
Provides endpoints to trigger research and manage tools database
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from pathlib import Path
from datetime import datetime

from agents.research_agent import ToolResearchAgent, ToolCuratorAgent

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
