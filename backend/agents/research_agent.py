"""
Agentic Tool Research Agent
Automatically discovers and curates new agentic coding tools
"""

import os
import json
import re
from datetime import datetime
from typing import List, Dict, Optional
from openai import OpenAI
import requests
from bs4 import BeautifulSoup

try:
    from .model_registry import (
        get_code_research_model,
        get_default_model,
        CODE_RESEARCH_MODEL_KEY,
        DEFAULT_MODEL_KEY,
        model_supports_temperature
    )
    from .web_scraping_agent import WebScrapingAgent
except ImportError:
    from model_registry import (
        get_code_research_model,
        get_default_model,
        CODE_RESEARCH_MODEL_KEY,
        DEFAULT_MODEL_KEY,
        model_supports_temperature
    )
    from web_scraping_agent import WebScrapingAgent


class ToolResearchAgent:
    """Multi-agent system for discovering agentic coding tools"""

    # Predefined research tags and sources
    RESEARCH_TAGS = [
        "AI code editor",
        "AI pair programming",
        "AI code completion",
        "AI code generation",
        "AI code review",
        "AI refactoring tool",
        "AI testing tool",
        "LLM coding assistant",
        "agentic coding tool",
        "AI IDE plugin",
        "GPT code tool",
        "AI developer tool",
        "agentic coding",
        "agentic programming",
        "LLM-based code completion",
        "code generation agents",
        "autonomous coding agent",
        "multi-agent LLM coding",
        "multi-agent code generation",
        "software engineering with LLMs",
        "LLM code assistant tools",
        "tool-augmented LLM workflow",
        "LLM code completion benchmarking",
        "agentic AI for software engineering",
        "workflow automation LLM coding"
    ]

    SEARCH_SOURCES = [
        "github trending",
        "hackernews agentic coding",
        "reddit r/programming AI tools",
        "producthunt AI developer tools"
    ]

    # Curated awesome lists to scrape
    AWESOME_LISTS = [
        "https://github.com/codefuse-ai/Awesome-Code-LLM"
    ]

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the research agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required")

        self.client = OpenAI(api_key=self.api_key)
        self.discovered_tools = []
        self.search_timestamp = None  # Track when research started
        self.web_scraper = WebScrapingAgent(api_key=self.api_key)  # Real web scraping agent

    def research_tools(self, tags: Optional[List[str]] = None, max_tools: int = 10) -> List[Dict]:
        """
        Main research pipeline

        Args:
            tags: Custom search tags (uses defaults if None)
            max_tools: Maximum number of tools to discover

        Returns:
            List of discovered tool dictionaries
        """
        tags = tags or self.RESEARCH_TAGS

        # Record when this research session started
        self.search_timestamp = datetime.now().isoformat()
        print(f"[RESEARCH] Starting research session at {self.search_timestamp}")
        print(f"[RESEARCH] Researching {len(tags)} tags...")

        # Phase 1: Discovery
        raw_findings = self._discovery_phase(tags)
        print(f"[DISCOVERY] Discovered {len(raw_findings)} potential tools")

        # Phase 2: Validation & Enrichment
        validated_tools = self._validation_phase(raw_findings)
        print(f"[VALIDATION] Validated {len(validated_tools)} high-quality tools")

        # Phase 3: Deduplication
        unique_tools = self._deduplication_phase(validated_tools)
        print(f"[DEDUP] {len(unique_tools)} unique tools after deduplication")

        # Phase 4: Ranking
        ranked_tools = self._ranking_phase(unique_tools)

        return ranked_tools[:max_tools]

    def _discovery_phase(self, tags: List[str]) -> List[Dict]:
        """Phase 1: Discover tools using LLM-powered web research and curated lists"""
        all_findings = []

        # First, scrape awesome lists
        awesome_list_tools = self._scrape_awesome_lists()
        all_findings.extend(awesome_list_tools)
        if awesome_list_tools:
            print(f"  Found {len(awesome_list_tools)} tools from awesome lists")

        # Use REAL web scraping for each tag
        for tag in tags[:5]:  # Limit to avoid rate limits
            print(f"  Researching tag: {tag}")

            try:
                # Use web scraping agent to discover tools from real web content
                web_scraped_tools = self.web_scraper.discover_tools_for_tag(tag, max_results=3)

                if web_scraped_tools:
                    all_findings.extend(web_scraped_tools)
                    print(f"    Discovered {len(web_scraped_tools)} tools via web scraping")

            except Exception as e:
                print(f"    Error web scraping '{tag}': {e}")
                continue

        return all_findings

    def _scrape_awesome_lists(self) -> List[Dict]:
        """Scrape curated awesome lists for tool discoveries"""
        all_tools = []

        for awesome_url in self.AWESOME_LISTS:
            print(f"  Scraping awesome list: {awesome_url}")
            try:
                # Convert GitHub URL to raw content URL
                raw_url = awesome_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
                if not '/raw' in raw_url and not 'raw.githubusercontent' in raw_url:
                    # Extract owner/repo
                    match = re.search(r'github\.com/([^/]+)/([^/]+)', awesome_url)
                    if match:
                        owner, repo = match.groups()
                        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/main/README.md"

                # Fetch markdown content
                response = requests.get(
                    raw_url,
                    timeout=15,
                    headers={'User-Agent': 'Mozilla/5.0 (compatible; AgenticToolResearch/1.0)'}
                )

                if response.status_code == 200:
                    markdown_content = response.text

                    # Extract markdown links using regex
                    # Pattern: [Title](URL) or [Title](URL) - Description
                    link_pattern = r'\[([^\]]+)\]\((https?://[^\)]+)\)'
                    matches = re.findall(link_pattern, markdown_content)

                    if not matches:
                        print(f"    No links found in {awesome_url}")
                        continue

                    print(f"    Found {len(matches)} potential tools")

                    # Filter to only GitHub repos and relevant tools (limit to first 30 to avoid overwhelming LLM)
                    filtered_matches = []
                    for title, url in matches[:50]:
                        # Only include GitHub repos or tool websites
                        if 'github.com' in url or any(keyword in title.lower() for keyword in ['agent', 'llm', 'code', 'ai', 'copilot', 'tool']):
                            filtered_matches.append((title, url))

                    if not filtered_matches:
                        print(f"    No relevant tools found after filtering")
                        continue

                    # Use LLM to structure the tools from markdown
                    tools = self._parse_awesome_list_with_llm(filtered_matches[:20])  # Limit to 20 to avoid token limits
                    all_tools.extend(tools)
                    print(f"    Extracted {len(tools)} structured tools")

            except Exception as e:
                print(f"    Error scraping {awesome_url}: {e}")
                continue

        return all_tools

    def _parse_awesome_list_with_llm(self, raw_tools: List[tuple]) -> List[Dict]:
        """Use LLM to parse and structure tools from awesome list"""

        # Build summary of raw tools
        tools_text = "\n".join([f"{i+1}. {title} - {url}" for i, (title, url) in enumerate(raw_tools)])

        prompt = f"""You are analyzing a curated awesome list of AI/LLM coding tools.

Below are tool entries extracted from the list:

{tools_text}

Your task: Identify which entries are actual AGENTIC CODING TOOLS (AI-powered tools that help developers write, review, or generate code). Exclude:
- Papers, research, benchmarks
- General LLMs not specifically for coding
- Educational resources
- Libraries without agentic features

For each relevant tool, provide:
1. **Title**: The tool's name
2. **Description**: Write a comprehensive 4-5 sentence description based on the tool name and what you know about it. Cover what it does, how it works, target users, and what makes it unique.
3. **URL**: The URL provided
4. **Category**: One of: Code Completion, IDE/Editor, Terminal Tools, Testing, Code Review, Agent Framework, Language Model, Developer Platform
5. **Features**: List 3-4 specific, concrete features

Return ONLY a valid JSON array of relevant tools (limit to top 10 most relevant):
[
  {{
    "title": "Tool Name",
    "description": "Comprehensive 4-5 sentence description explaining what it does, how it works, who uses it, and why it's valuable.",
    "url": "https://tool-url.com",
    "category": "Category Name",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  }}
]

If none are relevant agentic coding tools, return: []
"""

        try:
            api_params = {
                "model": get_code_research_model(),
                "messages": [
                    {"role": "system", "content": "You are a research assistant specialized in identifying agentic coding tools. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            }

            if model_supports_temperature(CODE_RESEARCH_MODEL_KEY):
                api_params["temperature"] = 0.5

            response = self.client.chat.completions.create(**api_params)
            content = response.choices[0].message.content.strip()

            # Extract JSON from response
            tools = self._extract_json(content)

            return tools if tools else []

        except Exception as e:
            print(f"    Error parsing with LLM: {e}")
            return []

    def _validation_phase(self, tools: List[Dict]) -> List[Dict]:
        """Phase 2: Validate and enrich tool data"""
        validated = []

        for tool in tools:
            try:
                # Validate required fields
                if not all(k in tool for k in ["title", "description", "url"]):
                    continue

                # Validate URL
                if not tool["url"].startswith("http"):
                    continue

                # Verify URL is accessible and handle redirects
                verified_url = self._verify_url(tool["url"])
                if not verified_url:
                    print(f"    Skipping {tool['title']}: URL not accessible")
                    continue

                tool["url"] = verified_url  # Use final URL after redirects

                # Enrich with metadata
                enriched = self._enrich_tool_metadata(tool)

                if enriched:
                    validated.append(enriched)

            except Exception as e:
                print(f"    Validation error for {tool.get('title', 'Unknown')}: {e}")
                continue

        return validated

    def _enrich_tool_metadata(self, tool: Dict) -> Optional[Dict]:
        """Enrich tool with additional metadata"""

        try:
            # Try to get real GitHub stars if it's a GitHub repo
            github_data = self._get_github_data(tool["url"])
            if github_data:
                tool["githubStars"] = github_data["stars"]
                tool["githubUrl"] = github_data["url"]
                tool["lastUpdated"] = github_data["updated"]
                tool["githubLastPushed"] = github_data["githubLastPushed"]
                tool["githubDaysAgo"] = github_data["githubDaysAgo"]
                print(f"    Found GitHub repo: {github_data['stars']} stars, last pushed {github_data['updated']}")

            # Get additional metadata from LLM
            prompt = f"""Analyze this agentic coding tool and provide metadata:

Tool: {tool.get('title')}
Description: {tool.get('description')}
URL: {tool.get('url')}

Provide:
1. Latest version (make a reasonable estimate like "1.2.0")
2. Last updated (estimate: "X days/weeks/months ago") - ONLY if not already known

Return ONLY valid JSON:
{{
  "version": "1.2.0",
  "lastUpdated": "1 week ago"
}}
"""

            api_params = {
                "model": get_default_model(),
                "messages": [
                    {"role": "system", "content": "You are a metadata enrichment assistant. Return only valid JSON with realistic estimates."},
                    {"role": "user", "content": prompt}
                ]
            }

            if model_supports_temperature(DEFAULT_MODEL_KEY):
                api_params["temperature"] = 0.3

            response = self.client.chat.completions.create(**api_params)
            content = response.choices[0].message.content.strip()
            metadata = self._extract_json(content)

            if metadata and isinstance(metadata, dict):
                # Only update lastUpdated if we don't have GitHub data
                if "lastUpdated" not in tool and "lastUpdated" in metadata:
                    tool["lastUpdated"] = metadata["lastUpdated"]

                if "version" in metadata:
                    tool["version"] = metadata["version"]

            # Ensure required fields exist
            if "features" not in tool or not tool["features"]:
                tool["features"] = ["AI-Powered", "Code Generation"]

            if "category" not in tool:
                tool["category"] = "Code Completion"

            # Add timestamps
            tool["discoveredAt"] = datetime.now().isoformat()
            tool["searchTimestamp"] = self.search_timestamp

            # Analyze public sentiment
            sentiment_data = self._analyze_public_sentiment(tool)
            if sentiment_data:
                tool["publicSentiment"] = sentiment_data["sentiment"]
                tool["usageNiche"] = sentiment_data.get("usageNiche")
                tool["communityDiscussions"] = sentiment_data.get("discussions", [])
                tool["sentimentAnalyzedAt"] = datetime.now().isoformat()
                print(f"    Sentiment: {sentiment_data['sentiment']}, Niche: {sentiment_data.get('usageNiche', 'N/A')}")

            return tool

        except Exception as e:
            print(f"    Enrichment error: {e}")
            return None

    def _analyze_public_sentiment(self, tool: Dict) -> Optional[Dict]:
        """
        Analyze public sentiment and community discussions about the tool
        Uses LLM to simulate analysis of public forums (Reddit, Twitter, HackerNews, etc.)
        """
        try:
            prompt = f"""You are a sentiment analysis agent tasked with analyzing public discussions about developer tools.

Tool Name: {tool.get('title')}
Description: {tool.get('description')}
Category: {tool.get('category')}
URL: {tool.get('url')}

Task: Analyze what developers would be saying about this tool on public forums like Reddit (r/programming, r/MachineLearning), Twitter/X, HackerNews, and dev.to.

Provide:
1. **Overall Sentiment**: One of: "Very Positive", "Positive", "Mixed", "Neutral", "Negative", "Not Widely Discussed"
2. **Usage Niche**: Describe the specific use case or niche where this tool is popular (e.g., "Enterprise teams migrating legacy systems", "Solo developers building prototypes", "ML researchers", "Startup CTOs", etc.)
3. **Active Usage**: Whether the tool appears to be actively used based on its characteristics
4. **Key Discussion Points**: 3-5 realistic discussion points that developers would mention (both positive and critical)

Consider:
- Tool's age and maturity (newer tools vs established ones)
- Whether it's open-source vs commercial
- Target audience (enterprise, indie devs, researchers)
- Competitors and alternatives
- Pricing model (if applicable)
- GitHub activity level (if provided)

Return ONLY valid JSON:
{{
  "sentiment": "Positive",
  "usageNiche": "Brief description of primary use case and user demographic",
  "activelyUsed": true,
  "discussions": [
    "Realistic discussion point 1",
    "Realistic discussion point 2",
    "Realistic discussion point 3"
  ]
}}
"""

            api_params = {
                "model": get_default_model(),
                "messages": [
                    {"role": "system", "content": "You are a sentiment analysis expert specializing in developer tool ecosystems. Provide realistic, nuanced analysis based on the tool's characteristics. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            }

            if model_supports_temperature(DEFAULT_MODEL_KEY):
                api_params["temperature"] = 0.4

            response = self.client.chat.completions.create(**api_params)
            content = response.choices[0].message.content.strip()
            sentiment_data = self._extract_json(content)

            if sentiment_data and isinstance(sentiment_data, dict):
                return sentiment_data

            return None

        except Exception as e:
            print(f"    Sentiment analysis error: {e}")
            return None

    def _verify_url(self, url: str, timeout: int = 10) -> Optional[str]:
        """
        Verify URL is accessible and handle redirects
        Returns final URL after redirects, or None if not accessible
        """
        try:
            response = requests.get(
                url,
                timeout=timeout,
                allow_redirects=True,
                headers={'User-Agent': 'Mozilla/5.0 (compatible; AgenticToolResearch/1.0)'}
            )

            # Check if successful
            if response.status_code == 200:
                final_url = response.url
                if final_url != url:
                    print(f"    Redirect detected: {url} -> {final_url}")
                return final_url

            print(f"    URL returned status {response.status_code}")
            return None

        except requests.exceptions.Timeout:
            print(f"    URL timeout: {url}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"    URL error: {str(e)[:100]}")
            return None

    def _get_github_data(self, url: str) -> Optional[Dict]:
        """
        Extract GitHub repository data if URL is a GitHub repo
        Returns dict with stars, url, and updated date or None
        """
        # Check if it's a GitHub URL
        github_pattern = r'github\.com/([^/]+)/([^/]+)'
        match = re.search(github_pattern, url)

        if not match:
            return None

        owner, repo = match.groups()
        # Remove .git suffix if present
        repo = repo.replace('.git', '').split('?')[0].split('#')[0]

        try:
            # Call GitHub API (no auth required for public repos, but rate limited)
            api_url = f'https://api.github.com/repos/{owner}/{repo}'
            response = requests.get(
                api_url,
                headers={'Accept': 'application/vnd.github.v3+json'},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                updated_date = datetime.fromisoformat(data['pushed_at'].replace('Z', '+00:00'))
                days_ago = (datetime.now(updated_date.tzinfo) - updated_date).days

                if days_ago == 0:
                    updated_str = "today"
                elif days_ago == 1:
                    updated_str = "1 day ago"
                elif days_ago < 7:
                    updated_str = f"{days_ago} days ago"
                elif days_ago < 30:
                    weeks = days_ago // 7
                    updated_str = f"{weeks} week{'s' if weeks > 1 else ''} ago"
                elif days_ago < 365:
                    months = days_ago // 30
                    updated_str = f"{months} month{'s' if months > 1 else ''} ago"
                else:
                    years = days_ago // 365
                    updated_str = f"{years} year{'s' if years > 1 else ''} ago"

                return {
                    "stars": data['stargazers_count'],
                    "url": data['html_url'],
                    "updated": updated_str,
                    "githubLastPushed": data['pushed_at'],  # Raw ISO timestamp for calculating active/deprecated status
                    "githubDaysAgo": days_ago  # Days since last push for easy status checks
                }

            return None

        except Exception as e:
            print(f"    GitHub API error: {str(e)[:100]}")
            return None

    def _deduplication_phase(self, tools: List[Dict]) -> List[Dict]:
        """Phase 3: Remove duplicate tools"""
        seen_titles = set()
        seen_urls = set()
        unique_tools = []

        for tool in tools:
            title = tool["title"].lower().strip()
            url = tool["url"].lower().strip()

            if title not in seen_titles and url not in seen_urls:
                seen_titles.add(title)
                seen_urls.add(url)
                unique_tools.append(tool)

        return unique_tools

    def _ranking_phase(self, tools: List[Dict]) -> List[Dict]:
        """Phase 4: Rank tools by relevance and quality"""

        # Ranking: sort by GitHub stars if available (higher is better)
        # Tools without GitHub stars will be ranked lower
        ranked = sorted(tools, key=lambda t: t.get("githubStars", 0), reverse=True)

        # Assign IDs
        for idx, tool in enumerate(ranked, start=1):
            tool["id"] = idx

        return ranked

    def _extract_json(self, text: str) -> Optional[any]:
        """Extract JSON from LLM response (handles markdown code blocks)"""
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
            print(f"    JSON parsing error: {e}")
            return None


# Curator Agent for filtering low-quality results
class ToolCuratorAgent:
    """Validates and curates discovered tools"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

    def curate_tools(self, tools: List[Dict], existing_tools: List[Dict], update_existing: bool = False) -> List[Dict]:
        """
        Curate tools by removing low-quality and duplicate entries

        Args:
            tools: Newly discovered tools
            existing_tools: Already known tools
            update_existing: If True, update existing tools instead of skipping them

        Returns:
            Curated list of high-quality, novel tools (or updates if update_existing=True)
        """
        print(f"[CURATOR] Curating {len(tools)} tools...")

        if update_existing:
            # Separate tools into updates and new tools
            existing_titles = {t["title"].lower() for t in existing_tools}
            updates = []
            novel_tools = []

            for tool in tools:
                if tool["title"].lower() in existing_titles:
                    tool["_is_update"] = True  # Mark as update
                    updates.append(tool)
                else:
                    novel_tools.append(tool)

            print(f"  {len(updates)} will update existing tools")
            print(f"  {len(novel_tools)} are truly novel")

            # Filter low-quality tools using LLM (apply to both updates and new)
            curated_updates = self._llm_quality_filter(updates) if updates else []
            curated_novel = self._llm_quality_filter(novel_tools) if novel_tools else []

            curated = curated_updates + curated_novel

            print(f"  [PASS] {len(curated_updates)} updates and {len(curated_novel)} new tools passed quality checks")

            return curated
        else:
            # Original behavior: remove tools that already exist
            existing_titles = {t["title"].lower() for t in existing_tools}
            novel_tools = [t for t in tools if t["title"].lower() not in existing_titles]

            print(f"  {len(novel_tools)} are truly novel")

            # Filter low-quality tools using LLM
            curated = self._llm_quality_filter(novel_tools)

            print(f"  [PASS] {len(curated)} passed quality checks")

            return curated

    def _llm_quality_filter(self, tools: List[Dict]) -> List[Dict]:
        """Use LLM to filter low-quality tools"""

        if not tools:
            return []

        tools_summary = "\n".join([
            f"{i+1}. {t['title']} - {t.get('description', 'No description')[:100]}"
            for i, t in enumerate(tools[:20])  # Limit to avoid token limits
        ])

        prompt = f"""You are a quality control agent for an agentic coding tools directory.

Review these tools and identify which ones are HIGH QUALITY and worth adding:

{tools_summary}

Criteria for HIGH QUALITY:
- Real, existing tool (not hypothetical)
- Actively maintained
- Provides genuine value to developers
- Has a working website/repo
- Is relevant to agentic coding / AI-assisted development

Return ONLY the numbers of HIGH QUALITY tools as a JSON array:
[1, 3, 5, 7]

If all are low quality, return: []
"""

        try:
            # Build API call parameters
            api_params = {
                "model": get_default_model(),
                "messages": [
                    {"role": "system", "content": "You are a strict quality control agent. Return only valid JSON arrays."},
                    {"role": "user", "content": prompt}
                ]
            }

            # Only add temperature if model supports it
            if model_supports_temperature(DEFAULT_MODEL_KEY):
                api_params["temperature"] = 0.2

            response = self.client.chat.completions.create(**api_params)

            content = response.choices[0].message.content.strip()

            # Extract array of indices
            indices_match = re.search(r'\[([\d,\s]*)\]', content)
            if indices_match:
                indices_str = indices_match.group(1)
                if indices_str.strip():
                    indices = [int(x.strip()) - 1 for x in indices_str.split(',') if x.strip()]
                    return [tools[i] for i in indices if 0 <= i < len(tools)]

            # If we can't parse, return all (conservative)
            return tools

        except Exception as e:
            print(f"    Quality filter error: {e}")
            return tools  # Return all on error (conservative)


if __name__ == "__main__":
    # Example usage
    agent = ToolResearchAgent()

    print("=" * 60)
    print("Agentic Tool Research Agent")
    print("=" * 60)

    # Discover tools
    new_tools = agent.research_tools(max_tools=10)

    print("\n" + "=" * 60)
    print(f"Discovered {len(new_tools)} Tools:")
    print("=" * 60)

    for tool in new_tools:
        print(f"\n{tool['id']}. {tool['title']}")
        print(f"   {tool['description']}")
        print(f"   Category: {tool['category']}")
        print(f"   URL: {tool['url']}")
        print(f"   Stars: {tool.get('stars', 0):,}")
