"""
Enhanced Research Agent with REAL Web Browsing
Combines LLM intelligence with actual web search
"""

from typing import List, Dict, Optional
from openai import OpenAI
import os

try:
    from .web_search import (
        DuckDuckGoSearchProvider,
        GitHubSearchProvider,
        WebPageFetcher
    )
    from .model_registry import get_code_research_model
except ImportError:
    from web_search import (
        DuckDuckGoSearchProvider,
        GitHubSearchProvider,
        WebPageFetcher
    )
    from model_registry import get_code_research_model


class EnhancedResearchAgent:
    """
    Research agent that ACTUALLY browses the web
    Combines:
    1. Real web search (DuckDuckGo, GitHub)
    2. LLM analysis of search results
    3. Web page content extraction
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

        # Initialize web search providers
        try:
            self.web_search = DuckDuckGoSearchProvider()
        except ImportError:
            print("⚠️  DuckDuckGo search not available. Install: pip install duckduckgo-search")
            self.web_search = None

        self.github_search = GitHubSearchProvider()
        self.page_fetcher = WebPageFetcher()

    def research_tools_with_web_search(
        self,
        query: str,
        max_tools: int = 10
    ) -> List[Dict]:
        """
        Research using ACTUAL web search + LLM analysis

        Process:
        1. Search the web for tools
        2. Fetch top result pages
        3. Use LLM to analyze and extract tool info
        4. Return structured tool data
        """
        print(f"🌐 Searching the web for: {query}")

        all_tools = []

        # Step 1: Search the web
        web_results = self._search_web(query)
        github_results = self._search_github(query)

        print(f"   Found {len(web_results)} web results, {len(github_results)} GitHub repos")

        # Step 2: Analyze web search results with LLM
        if web_results:
            web_tools = self._analyze_web_results(web_results, query)
            all_tools.extend(web_tools)

        # Step 3: Analyze GitHub results with LLM
        if github_results:
            github_tools = self._analyze_github_results(github_results)
            all_tools.extend(github_tools)

        # Step 4: Deduplicate and rank
        unique_tools = self._deduplicate(all_tools)

        return unique_tools[:max_tools]

    def _search_web(self, query: str) -> List[Dict]:
        """Search the web using DuckDuckGo"""
        if not self.web_search:
            return []

        try:
            results = self.web_search.search(query, num_results=10)
            return results
        except Exception as e:
            print(f"   Web search error: {e}")
            return []

    def _search_github(self, query: str) -> List[Dict]:
        """Search GitHub repositories"""
        try:
            results = self.github_search.search_repos(query, num_results=5)
            return results
        except Exception as e:
            print(f"   GitHub search error: {e}")
            return []

    def _analyze_web_results(self, results: List[Dict], query: str) -> List[Dict]:
        """
        Use LLM to analyze web search results and extract tool information
        This is where LLM + Web Search combine!
        """
        # Format search results for LLM
        results_text = "\n\n".join([
            f"Result {i+1}:\nTitle: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}"
            for i, r in enumerate(results[:5])
        ])

        prompt = f"""You are analyzing REAL web search results for: "{query}"

Here are actual search results from the web:

{results_text}

For each result that appears to be an agentic coding tool, extract:
1. Tool name
2. Brief description (1-2 sentences)
3. Category (Code Completion, IDE/Editor, Testing, etc.)
4. Key features (2-3)
5. URL (use the actual URL from results)

IMPORTANT: Only include tools that are clearly mentioned in the search results above.
If a result is not a tool (e.g., article, blog post), skip it.

Return ONLY valid JSON array:
[
  {{
    "title": "Tool Name",
    "description": "Description",
    "url": "actual URL from results",
    "category": "Category",
    "features": ["Feature 1", "Feature 2"],
    "source": "web_search"
  }}
]
"""

        try:
            response = self.client.chat.completions.create(
                model=get_code_research_model(),  # GPT-5-Codex for analyzing code tools
                messages=[
                    {"role": "system", "content": "You extract tool information from web search results. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )

            content = response.choices[0].message.content.strip()
            tools = self._extract_json(content)

            if tools and isinstance(tools, list):
                print(f"   [SUCCESS] Extracted {len(tools)} tools from web results")
                return tools

        except Exception as e:
            print(f"   LLM analysis error: {e}")

        return []

    def _analyze_github_results(self, results: List[Dict]) -> List[Dict]:
        """Analyze GitHub search results"""
        tools = []

        for repo in results:
            # GitHub repos have structured data already
            tool = {
                "title": repo["full_name"].split("/")[-1],
                "description": repo.get("description", "No description"),
                "url": repo["url"],
                "category": "Open Source",
                "features": [
                    f"Language: {repo.get('language', 'Unknown')}",
                    "Open Source",
                    "GitHub"
                ],
                "stars": repo.get("stars", 0),
                "version": "Latest",
                "lastUpdated": "Recently",
                "source": "github"
            }
            tools.append(tool)

        print(f"   [SUCCESS] Extracted {len(tools)} tools from GitHub")
        return tools

    def _deduplicate(self, tools: List[Dict]) -> List[Dict]:
        """Remove duplicate tools"""
        seen_titles = set()
        seen_urls = set()
        unique = []

        for tool in tools:
            title = tool["title"].lower().strip()
            url = tool["url"].lower().strip()

            if title not in seen_titles and url not in seen_urls:
                seen_titles.add(title)
                seen_urls.add(url)
                unique.append(tool)

        return unique

    def _extract_json(self, text: str):
        """Extract JSON from LLM response"""
        import re
        import json

        # Remove markdown
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*$', '', text)

        # Find JSON
        json_match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        return json.loads(text)


# Example usage
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("🌐 Enhanced Research Agent - WITH REAL WEB SEARCH")
    print("=" * 60)

    # Check dependencies
    try:
        from duckduckgo_search import DDGS
        has_ddg = True
    except ImportError:
        print("\n⚠️  Missing dependency: pip install duckduckgo-search")
        print("Install it to enable web search functionality")
        has_ddg = False
        sys.exit(1)

    # Create agent
    agent = EnhancedResearchAgent()

    # Research with REAL web search
    query = "AI code completion tools 2024"
    print(f"\n🔍 Researching: {query}")
    print("-" * 60)

    tools = agent.research_tools_with_web_search(query, max_tools=5)

    print("\n" + "=" * 60)
    print(f"📊 Discovered {len(tools)} Tools (from REAL web search):")
    print("=" * 60)

    for i, tool in enumerate(tools, 1):
        print(f"\n{i}. {tool['title']}")
        print(f"   {tool['description'][:100]}...")
        print(f"   URL: {tool['url']}")
        print(f"   Category: {tool['category']}")
        print(f"   Source: {tool.get('source', 'unknown')}")
        if 'stars' in tool:
            print(f"   Stars: {tool['stars']:,}")
