"""
Web Search Tools for Claude Agents
Supports multiple search providers with automatic fallback
"""

import os
from typing import List, Dict, Optional, Literal
from datetime import datetime
import json

# Import search providers
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False
    print("[WARN] Tavily not installed. Install with: pip install tavily-python")

try:
    from duckduckgo_search import DDGS
    DUCKDUCKGO_AVAILABLE = True
except ImportError:
    DUCKDUCKGO_AVAILABLE = False
    print("[WARN] DuckDuckGo search not installed. Install with: pip install duckduckgo-search")


SearchProvider = Literal["tavily", "duckduckgo", "auto"]


class WebSearchTool:
    """
    Unified web search interface for Claude agents
    Automatically selects best available provider
    """

    def __init__(self, provider: SearchProvider = "auto"):
        """
        Initialize web search tool

        Args:
            provider: Search provider to use ("tavily", "duckduckgo", or "auto")
        """
        self.provider = provider
        self.tavily_client = None
        self.tavily_api_key = os.getenv("TAVILY_API_KEY")

        # Initialize Tavily if available and configured
        if TAVILY_AVAILABLE and self.tavily_api_key:
            try:
                self.tavily_client = TavilyClient(api_key=self.tavily_api_key)
                print("[WebSearch] Tavily initialized successfully")
            except Exception as e:
                print(f"[WebSearch] Failed to initialize Tavily: {e}")

        # Determine active provider
        self.active_provider = self._select_provider()
        print(f"[WebSearch] Active provider: {self.active_provider}")

    def _select_provider(self) -> str:
        """Select best available search provider"""
        if self.provider == "tavily" and self.tavily_client:
            return "tavily"
        elif self.provider == "duckduckgo" and DUCKDUCKGO_AVAILABLE:
            return "duckduckgo"
        elif self.provider == "auto":
            # Prefer Tavily (optimized for AI) if available
            if self.tavily_client:
                return "tavily"
            elif DUCKDUCKGO_AVAILABLE:
                return "duckduckgo"

        raise ValueError(
            "No search provider available. Install tavily-python or duckduckgo-search"
        )

    def search(
        self,
        query: str,
        max_results: int = 5,
        search_depth: Literal["basic", "advanced"] = "basic"
    ) -> Dict:
        """
        Perform web search

        Args:
            query: Search query
            max_results: Maximum number of results
            search_depth: "basic" or "advanced" (Tavily only)

        Returns:
            Dictionary with search results and metadata
        """
        print(f"[WebSearch] Searching: '{query}' (provider: {self.active_provider})")

        if self.active_provider == "tavily":
            return self._search_tavily(query, max_results, search_depth)
        elif self.active_provider == "duckduckgo":
            return self._search_duckduckgo(query, max_results)
        else:
            raise ValueError(f"Invalid provider: {self.active_provider}")

    def _search_tavily(
        self,
        query: str,
        max_results: int,
        search_depth: str
    ) -> Dict:
        """Search using Tavily API"""
        try:
            response = self.tavily_client.search(
                query=query,
                max_results=max_results,
                search_depth=search_depth,
                include_answer=True,
                include_raw_content=False
            )

            results = []
            for item in response.get("results", []):
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "content": item.get("content", ""),
                    "score": item.get("score", 0.0),
                    "published_date": item.get("published_date", None)  # ISO timestamp when available
                })

            return {
                "provider": "tavily",
                "query": query,
                "results": results,
                "answer": response.get("answer", ""),
                "timestamp": datetime.now().isoformat(),
                "total_results": len(results)
            }

        except Exception as e:
            print(f"[WebSearch] Tavily error: {e}")
            # Fallback to DuckDuckGo if available
            if DUCKDUCKGO_AVAILABLE:
                print("[WebSearch] Falling back to DuckDuckGo")
                return self._search_duckduckgo(query, max_results)
            raise

    def _search_duckduckgo(self, query: str, max_results: int) -> Dict:
        """Search using DuckDuckGo (free, no API key)"""
        try:
            with DDGS() as ddgs:
                raw_results = list(ddgs.text(query, max_results=max_results))

            results = []
            for item in raw_results:
                results.append({
                    "title": item.get("title", ""),
                    "url": item.get("href", ""),
                    "content": item.get("body", ""),
                    "score": 1.0  # DuckDuckGo doesn't provide scores
                })

            return {
                "provider": "duckduckgo",
                "query": query,
                "results": results,
                "answer": "",  # DuckDuckGo doesn't provide AI answers
                "timestamp": datetime.now().isoformat(),
                "total_results": len(results)
            }

        except Exception as e:
            print(f"[WebSearch] DuckDuckGo error: {e}")
            raise

    def search_news(self, query: str, max_results: int = 5) -> Dict:
        """
        Search for recent news and discussions
        Useful for sentiment analysis
        """
        # Add time-based keywords to get recent content
        time_query = f"{query} latest news discussions 2025"
        return self.search(time_query, max_results=max_results)

    def search_sentiment(self, tool_name: str, max_results: int = 10) -> Dict:
        """
        Search for public sentiment about a specific tool

        Args:
            tool_name: Name of the tool to research
            max_results: Number of results to fetch

        Returns:
            Search results focused on reviews, discussions, and sentiment
        """
        # Craft queries to find sentiment from diverse sources
        # Prioritize blogs, tech news, and developer forums, not just Reddit
        sentiment_query = (
            f'"{tool_name}" (review OR experience OR opinion OR comparison) '
            f'(site:medium.com OR site:dev.to OR site:hackernews.com OR site:news.ycombinator.com '
            f'OR site:reddit.com OR site:stackoverflow.com OR site:producthunt.com) '
            f'2024 OR 2025'
        )

        return self.search(sentiment_query, max_results=max_results, search_depth="advanced")

    def format_for_claude(self, search_results: Dict) -> str:
        """
        Format search results for Claude's context

        Args:
            search_results: Results from search()

        Returns:
            Formatted string for Claude
        """
        output = f"Search Results for: '{search_results['query']}'\n"
        output += f"Provider: {search_results['provider']}\n"
        output += f"Timestamp: {search_results['timestamp']}\n\n"

        if search_results.get("answer"):
            output += f"Quick Answer:\n{search_results['answer']}\n\n"

        output += f"Top {len(search_results['results'])} Results:\n\n"

        for i, result in enumerate(search_results["results"], 1):
            output += f"{i}. {result['title']}\n"
            output += f"   URL: {result['url']}\n"
            output += f"   {result['content'][:300]}...\n\n"

        return output


# Test function
def test_search_tool():
    """Test the web search tool"""
    tool = WebSearchTool(provider="auto")

    print("\n=== Testing basic search ===")
    results = tool.search("latest AI coding tools 2025", max_results=3)
    print(json.dumps(results, indent=2))

    print("\n=== Testing sentiment search ===")
    sentiment = tool.search_sentiment("Cursor IDE", max_results=5)
    print(json.dumps(sentiment, indent=2))

    print("\n=== Testing Claude formatting ===")
    formatted = tool.format_for_claude(results)
    print(formatted)


if __name__ == "__main__":
    test_search_tool()
