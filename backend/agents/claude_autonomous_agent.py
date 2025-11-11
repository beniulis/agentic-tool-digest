"""
Claude Autonomous Research Agent
Uses Anthropic Claude SDK to autonomously discover and research agentic coding tools
"""

import os
import json
import re
import requests
from typing import List, Dict, Optional, Callable
from datetime import datetime
from anthropic import Anthropic

try:
    from .web_search_tools import WebSearchTool
except ImportError:
    from web_search_tools import WebSearchTool


class ClaudeAutonomousAgent:
    """
    Autonomous agent powered by Claude that researches agentic coding tools

    The agent makes its own decisions about:
    - What search queries to execute
    - How to validate discovered tools
    - When to dig deeper vs move on
    - How to synthesize findings
    """

    # Tool categories for classification
    CATEGORIES = [
        "Code Completion",
        "IDE/Editor",
        "Terminal Tools",
        "Testing",
        "Code Review",
        "Agent Framework",
        "Language Model",
        "Developer Platform"
    ]

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-sonnet-4-20250514",
        progress_callback: Optional[Callable[[str], None]] = None
    ):
        """
        Initialize the Claude autonomous agent

        Args:
            api_key: Anthropic API key (or from env ANTHROPIC_API_KEY)
            model: Claude model to use
            progress_callback: Optional callback for progress updates
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY required")

        self.client = Anthropic(api_key=self.api_key)
        self.model = model
        self.web_search = WebSearchTool(provider="auto")
        self.progress_callback = progress_callback or self._default_progress

        # Agent memory
        self.conversation_history = []
        self.discovered_tools = []
        self.research_log = []

    def _default_progress(self, message: str):
        """Default progress callback"""
        print(f"[Agent] {message}")

    def _log_progress(self, message: str, data: Optional[Dict] = None):
        """Log progress with optional data"""
        # Handle encoding issues for Windows console
        try:
            self.progress_callback(message)
        except UnicodeEncodeError:
            # Fallback: encode with ASCII and replace non-ASCII chars
            safe_message = message.encode('ascii', 'replace').decode('ascii')
            self.progress_callback(safe_message)

        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "data": data
        }
        self.research_log.append(log_entry)

    def research_tools(
        self,
        focus_areas: Optional[List[str]] = None,
        max_tools: int = 10
    ) -> List[Dict]:
        """
        Main entry point: Autonomously research agentic coding tools

        Args:
            focus_areas: Optional list of specific areas to focus on
            max_tools: Maximum number of tools to discover

        Returns:
            List of discovered and validated tools
        """
        self._log_progress("Starting autonomous research session")

        # Phase 1: Planning
        research_plan = self._create_research_plan(focus_areas, max_tools)
        self._log_progress(f"Created research plan with {len(research_plan['queries'])} queries")

        # Phase 2: Discovery
        for i, query in enumerate(research_plan["queries"], 1):
            self._log_progress(f"Executing search {i}/{len(research_plan['queries'])}: {query}")
            self._execute_discovery_query(query)

        self._log_progress(f"Discovery complete. Found {len(self.discovered_tools)} potential tools")

        # Phase 3: Validation & Enrichment
        validated_tools = self._validate_and_enrich_tools()
        self._log_progress(f"Validation complete. {len(validated_tools)} tools passed quality checks")

        # Phase 4: Sentiment Analysis
        tools_with_sentiment = self._analyze_sentiment_for_tools(validated_tools)
        self._log_progress(f"Sentiment analysis complete for {len(tools_with_sentiment)} tools")

        return tools_with_sentiment[:max_tools]

    def _create_research_plan(
        self,
        focus_areas: Optional[List[str]],
        max_tools: int
    ) -> Dict:
        """
        Use Claude to create an intelligent research plan

        The agent decides what search queries will be most effective
        """
        self._log_progress("Planning research strategy...")

        prompt = f"""You are an autonomous research agent tasked with discovering agentic coding tools.

Your goal: Find {max_tools} high-quality, recently active agentic coding tools.

Focus areas: {focus_areas if focus_areas else 'General agentic coding tools, AI code assistants, and developer AI platforms'}

Create a strategic research plan by generating 5-8 diverse search queries that will:
1. Find recently launched tools (2024-2025)
2. Discover both popular and emerging tools
3. Cover different categories (IDEs, CLI tools, code completion, agents, etc.)
4. Include queries for trending discussions on HackerNews, Reddit, Twitter
5. Search for "best of" lists and comparisons

Return ONLY a JSON object in this exact format:
{{
  "reasoning": "Brief explanation of your search strategy",
  "queries": [
    "search query 1",
    "search query 2",
    ...
  ]
}}

Think strategically about what queries will yield the best results."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text
        plan = self._extract_json(content)

        if not plan or "queries" not in plan:
            # Fallback to default queries
            plan = {
                "reasoning": "Using default query set",
                "queries": [
                    "best agentic coding tools 2025",
                    "AI code editor IDE 2025 trending",
                    "GitHub copilot alternatives 2025",
                    "autonomous coding agents LLM",
                    "AI pair programming tools reddit discussions 2025"
                ]
            }

        return plan

    def _execute_discovery_query(self, query: str):
        """
        Execute a discovery query and extract tool information
        Uses Claude to analyze search results
        """
        # Perform web search
        search_results = self.web_search.search(query, max_results=10, search_depth="advanced")

        # Format results for Claude
        formatted_results = self.web_search.format_for_claude(search_results)

        # Ask Claude to extract tools from results
        prompt = f"""You are analyzing web search results to discover agentic coding tools.

{formatted_results}

Your task: Extract ACTUAL agentic coding tools from these search results.

Requirements:
- Only include real, existing tools (not vaporware or concepts)
- Focus on tools that help developers write, review, or generate code
- Exclude: papers, tutorials, blog posts that aren't about specific tools
- For each tool, provide comprehensive information

Return ONLY a JSON array of tools:
[
  {{
    "title": "Tool Name",
    "description": "Detailed 4-5 sentence description explaining what it does, how it works, target users, and unique features",
    "url": "https://tool-url.com",
    "category": "One of: {', '.join(self.CATEGORIES)}",
    "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "confidence": 0.95,
    "source_url": "URL where you found this information"
  }}
]

If no relevant tools found, return: []
Be thorough but accurate. Include 3-7 tools maximum per search."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text
        tools = self._extract_json(content)

        if tools and isinstance(tools, list):
            for tool in tools:
                # Add discovery metadata
                tool["discoveredAt"] = datetime.now().isoformat()
                tool["discoveryQuery"] = query
                tool["searchProvider"] = search_results["provider"]

            self.discovered_tools.extend(tools)
            self._log_progress(f"  Found {len(tools)} tools from this query")

    def _validate_and_enrich_tools(self) -> List[Dict]:
        """
        Validate discovered tools and enrich with metadata
        Uses Claude to assess quality and remove duplicates
        """
        self._log_progress("Validating and enriching discovered tools...")

        if not self.discovered_tools:
            return []

        # Remove obvious duplicates
        unique_tools = self._deduplicate_tools(self.discovered_tools)
        self._log_progress(f"  Removed duplicates: {len(self.discovered_tools)} -> {len(unique_tools)}")

        # Use Claude to quality-check tools
        tools_summary = "\n".join([
            f"{i+1}. {t['title']} - {t.get('description', 'No description')[:100]}... (confidence: {t.get('confidence', 'N/A')})"
            for i, t in enumerate(unique_tools[:20])  # Limit to avoid token limits
        ])

        prompt = f"""You are a quality control agent for an agentic coding tools directory.

Review these discovered tools and assess their quality:

{tools_summary}

Criteria for HIGH QUALITY tools:
1. Real, existing tool (not hypothetical or concept)
2. Actively maintained (not abandoned)
3. Genuinely useful for developers
4. Clear value proposition
5. Accessible (has website or GitHub repo)

Return ONLY a JSON object:
{{
  "approved_indices": [1, 3, 5, 7],
  "reasoning": "Brief explanation of your decisions",
  "quality_scores": {{
    "1": {{"score": 0.95, "reason": "Excellent tool, widely used"}},
    "3": {{"score": 0.85, "reason": "Good tool, active development"}}
  }}
}}

Be selective but fair. List indices (1-based) of HIGH QUALITY tools only."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.content[0].text
        validation_result = self._extract_json(content)

        if validation_result and "approved_indices" in validation_result:
            approved_indices = validation_result["approved_indices"]
            quality_scores = validation_result.get("quality_scores", {})

            validated = []
            for idx in approved_indices:
                if 1 <= idx <= len(unique_tools):
                    tool = unique_tools[idx - 1]

                    # Add quality score
                    if str(idx) in quality_scores:
                        tool["qualityScore"] = quality_scores[str(idx)]["score"]
                        tool["qualityReason"] = quality_scores[str(idx)]["reason"]

                    validated.append(tool)

            return validated

        # Fallback: return all high-confidence tools
        return [t for t in unique_tools if t.get("confidence", 0) >= 0.7]

    def _analyze_sentiment_for_tools(self, tools: List[Dict]) -> List[Dict]:
        """
        Analyze public sentiment for each tool using real web search
        This is the key feature requested by the user
        """
        self._log_progress("Analyzing public sentiment with web search...")

        enriched_tools = []

        for i, tool in enumerate(tools, 1):
            self._log_progress(f"  Analyzing sentiment {i}/{len(tools)}: {tool['title']}")

            # Search for sentiment
            sentiment_results = self.web_search.search_sentiment(
                tool["title"],
                max_results=8
            )

            # Extract source URLs for attribution with timestamps
            source_urls = [
                {
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "published_date": result.get("published_date", None)
                }
                for result in sentiment_results.get("results", [])
                if result.get("url")
            ]

            # Use Claude to synthesize sentiment from real search results
            formatted_results = self.web_search.format_for_claude(sentiment_results)

            prompt = f"""Analyze public sentiment about this developer tool based on REAL web search results.

Tool: {tool['title']}
Description: {tool.get('description', 'N/A')}
Category: {tool.get('category', 'N/A')}

REAL SEARCH RESULTS (with source numbers):
{formatted_results}

Based on these actual search results, provide:
1. **Overall Sentiment**: One of: "Very Positive", "Positive", "Mixed", "Neutral", "Negative", "Not Widely Discussed"
2. **Usage Niche**: Specific use case and user demographic based on what you found
3. **Key Discussion Points**: 3-5 actual points from the search results (both positive and critical)
   - For each discussion point, include which source number(s) [1-8] support it
4. **Activity Level**: Is it actively discussed? (true/false)
5. **Recent Trends**: Any trends visible in recent discussions

Return ONLY valid JSON:
{{
  "sentiment": "Positive",
  "usageNiche": "Description based on actual findings",
  "activelyDiscussed": true,
  "discussions": [
    {{"point": "Actual point from search results 1", "sources": [1, 3]}},
    {{"point": "Actual point from search results 2", "sources": [2, 5]}},
    {{"point": "Actual point from search results 3", "sources": [1, 4, 7]}}
  ],
  "recentTrends": "What's trending in recent discussions",
  "confidence": 0.85,
  "sources_analyzed": 8
}}

Base your analysis ONLY on the search results provided. Be honest if there's limited information."""

            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=2000,
                    messages=[{"role": "user", "content": prompt}]
                )

                content = response.content[0].text
                sentiment_data = self._extract_json(content)

                if sentiment_data:
                    # Process discussions to map source indices to URLs
                    discussions = sentiment_data.get("discussions", [])
                    processed_discussions = []

                    for disc in discussions:
                        if isinstance(disc, dict):
                            # New format with sources
                            point = disc.get("point", "")
                            source_indices = disc.get("sources", [])
                            # Map source indices (1-based) to actual URLs
                            source_links = [
                                source_urls[idx - 1] for idx in source_indices
                                if 0 < idx <= len(source_urls)
                            ]
                            processed_discussions.append({
                                "point": point,
                                "sources": source_links
                            })
                        else:
                            # Old format (just string) - keep as is for backward compatibility
                            processed_discussions.append({"point": disc, "sources": []})

                    # Add sentiment data to tool
                    tool["publicSentiment"] = sentiment_data.get("sentiment", "Unknown")
                    tool["usageNiche"] = sentiment_data.get("usageNiche", "")
                    tool["communityDiscussions"] = processed_discussions
                    tool["sentimentActivelyDiscussed"] = sentiment_data.get("activelyDiscussed", False)
                    tool["recentTrends"] = sentiment_data.get("recentTrends", "")
                    tool["sentimentConfidence"] = sentiment_data.get("confidence", 0.5)
                    tool["sentimentAnalyzedAt"] = datetime.now().isoformat()
                    tool["sentimentSourcesAnalyzed"] = sentiment_data.get("sources_analyzed", 0)
                    tool["sentimentSources"] = source_urls  # Store all source URLs

                    self._log_progress(f"    Sentiment: {tool['publicSentiment']} (confidence: {tool['sentimentConfidence']:.2f})")
                else:
                    self._log_progress(f"    Warning: Could not parse sentiment for {tool['title']}")

            except Exception as e:
                self._log_progress(f"    Error analyzing sentiment: {e}")

            # Fetch GitHub data if available
            github_data = self._fetch_github_data(tool)
            if github_data:
                tool.update(github_data)
                self._log_progress(f"    GitHub: {github_data.get('githubStars', 0)} stars")

            enriched_tools.append(tool)

        return enriched_tools

    def _fetch_github_data(self, tool: Dict) -> Optional[Dict]:
        """
        Fetch GitHub repository data if the tool has a GitHub URL

        Args:
            tool: Tool dictionary that may contain GitHub URL

        Returns:
            Dictionary with GitHub metadata or None if not available
        """
        # Try to find GitHub URL in tool data
        github_url = None

        # Check if URL field contains github.com
        if "url" in tool and tool["url"] and "github.com" in tool["url"]:
            github_url = tool["url"]

        # Also check in description for GitHub links
        if not github_url and "description" in tool:
            github_match = re.search(r'https?://github\.com/[\w-]+/[\w.-]+', tool.get("description", ""))
            if github_match:
                github_url = github_match.group(0)

        if not github_url:
            return None

        # Extract owner and repo from URL
        # Format: https://github.com/owner/repo
        match = re.match(r'https?://github\.com/([\w-]+)/([\w.-]+)', github_url)
        if not match:
            return None

        owner, repo = match.groups()

        # Remove .git suffix if present
        repo = repo.replace('.git', '')

        try:
            # Fetch repo data from GitHub API
            api_url = f'https://api.github.com/repos/{owner}/{repo}'
            headers = {'Accept': 'application/vnd.github.v3+json'}

            # Add GitHub token if available (optional, increases rate limit)
            github_token = os.getenv('GITHUB_TOKEN')
            if github_token:
                headers['Authorization'] = f'token {github_token}'

            response = requests.get(api_url, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()

                # Calculate days since last push
                last_pushed = data.get('pushed_at')
                days_ago = None
                if last_pushed:
                    from datetime import datetime
                    pushed_date = datetime.fromisoformat(last_pushed.replace('Z', '+00:00'))
                    days_ago = (datetime.now(pushed_date.tzinfo) - pushed_date).days

                return {
                    'githubUrl': github_url,
                    'githubStars': data.get('stargazers_count', 0),
                    'githubLastPushed': last_pushed,
                    'githubDaysAgo': days_ago
                }
            elif response.status_code == 404:
                self._log_progress(f"    GitHub repo not found: {owner}/{repo}")
            elif response.status_code == 403:
                self._log_progress(f"    GitHub API rate limit exceeded")
            else:
                self._log_progress(f"    GitHub API error: {response.status_code}")

        except Exception as e:
            self._log_progress(f"    Error fetching GitHub data: {e}")

        return None

    def _deduplicate_tools(self, tools: List[Dict]) -> List[Dict]:
        """Remove duplicate tools based on title and URL"""
        seen_titles = set()
        seen_urls = set()
        unique = []

        for tool in tools:
            # Handle None values properly
            title = (tool.get("title") or "").lower().strip()
            url = (tool.get("url") or "").lower().strip()

            # Create a normalized key
            if title and url:
                key = f"{title}||{url}"
                if key not in seen_titles and url not in seen_urls:
                    seen_titles.add(key)
                    seen_urls.add(url)
                    unique.append(tool)
            elif title and title not in seen_titles:
                seen_titles.add(title)
                unique.append(tool)

        return unique

    def _extract_json(self, text: str) -> Optional[any]:
        """Extract JSON from Claude's response (handles markdown code blocks)"""
        try:
            # Remove markdown code blocks
            text = re.sub(r'```json\s*', '', text)
            text = re.sub(r'```\s*$', '', text)
            text = text.strip()

            # Find JSON array or object
            json_match = re.search(r'(\[.*\]|\{.*\})', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
                return json.loads(json_str)

            # Try direct parse
            return json.loads(text)

        except json.JSONDecodeError as e:
            print(f"[Agent] JSON parsing error: {e}")
            print(f"[Agent] Problematic text: {text[:200]}...")
            return None

    def get_research_summary(self) -> Dict:
        """Get a summary of the research session"""
        return {
            "total_discovered": len(self.discovered_tools),
            "research_log": self.research_log,
            "timestamp": datetime.now().isoformat()
        }


# Test function
def test_claude_agent():
    """Test the Claude autonomous agent"""
    print("\n" + "="*60)
    print("Testing Claude Autonomous Research Agent")
    print("="*60 + "\n")

    agent = ClaudeAutonomousAgent()

    # Run research
    tools = agent.research_tools(
        focus_areas=["AI code editors", "terminal tools"],
        max_tools=5
    )

    print("\n" + "="*60)
    print(f"Discovered {len(tools)} Tools:")
    print("="*60 + "\n")

    for tool in tools:
        print(f"{tool.get('title', 'Unknown')}")
        print(f"  Category: {tool.get('category', 'N/A')}")
        print(f"  URL: {tool.get('url', 'N/A')}")
        print(f"  Sentiment: {tool.get('publicSentiment', 'N/A')}")
        print(f"  Description: {tool.get('description', 'N/A')[:150]}...")
        print()


if __name__ == "__main__":
    test_claude_agent()
