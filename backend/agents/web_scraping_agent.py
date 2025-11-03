"""
Web Scraping Agent for Real-Time Tool Discovery
Performs actual web searches and scrapes content, then uses LLM to extract tools
"""

import os
import time
import requests
from typing import Dict, List, Optional
from datetime import datetime
from openai import OpenAI
from bs4 import BeautifulSoup
import json
import re

try:
    from .model_registry import get_code_research_model, CODE_RESEARCH_MODEL_KEY, model_supports_temperature
except ImportError:
    from model_registry import get_code_research_model, CODE_RESEARCH_MODEL_KEY, model_supports_temperature


class WebScrapingAgent:
    """Performs real web scraping to discover tools"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

    def discover_tools_for_tag(self, tag: str, max_results: int = 5) -> List[Dict]:
        """
        Discover tools for a specific tag using REAL web scraping

        Args:
            tag: Search query/tag (e.g., "AI code editor")
            max_results: Max number of tools to discover

        Returns:
            List of discovered tool dictionaries
        """
        print(f"\n[WEB SCRAPING] Searching web for: {tag}")

        all_web_content = []

        # 1. Search DuckDuckGo
        ddg_results = self._search_duckduckgo(tag)
        all_web_content.extend(ddg_results)
        print(f"  DuckDuckGo: {len(ddg_results)} results")

        # 2. Scrape HackerNews
        hn_results = self._scrape_hackernews(tag)
        all_web_content.extend(hn_results)
        print(f"  HackerNews: {len(hn_results)} results")

        # 3. Scrape Reddit
        reddit_results = self._scrape_reddit(tag)
        all_web_content.extend(reddit_results)
        print(f"  Reddit: {len(reddit_results)} results")

        # 4. Scrape GitHub Trending (if tag is code-related)
        if any(keyword in tag.lower() for keyword in ['code', 'ai', 'llm', 'agent', 'programming']):
            gh_results = self._scrape_github_trending()
            all_web_content.extend(gh_results)
            print(f"  GitHub Trending: {len(gh_results)} results")

        print(f"  Total web content scraped: {len(all_web_content)} items")

        if not all_web_content:
            return []

        # Use LLM to analyze scraped content and extract tools
        tools = self._extract_tools_with_llm(tag, all_web_content, max_results)

        return tools

    def _search_duckduckgo(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search DuckDuckGo and scrape results (no API key needed)"""
        results = []

        try:
            # DuckDuckGo HTML search
            url = "https://html.duckduckgo.com/html/"
            params = {'q': query}
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.post(url, data=params, headers=headers, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

                # Find search result divs
                result_divs = soup.find_all('div', class_='result')

                for div in result_divs[:max_results]:
                    try:
                        # Extract title
                        title_tag = div.find('a', class_='result__a')
                        if not title_tag:
                            continue

                        title = title_tag.get_text(strip=True)
                        link = title_tag.get('href', '')

                        # Extract snippet
                        snippet_tag = div.find('a', class_='result__snippet')
                        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ''

                        if title and link:
                            results.append({
                                'source': 'DuckDuckGo',
                                'title': title[:200],
                                'url': link[:500],
                                'snippet': snippet[:500],
                                'query': query
                            })
                    except Exception as e:
                        continue

        except Exception as e:
            print(f"    DuckDuckGo error: {e}")

        return results

    def _scrape_hackernews(self, query: str, max_results: int = 10) -> List[Dict]:
        """Scrape HackerNews using Algolia API"""
        results = []

        try:
            url = "http://hn.algolia.com/api/v1/search"
            params = {
                'query': query,
                'tags': 'story',
                'hitsPerPage': max_results
            }

            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()

                for hit in data.get('hits', []):
                    title = hit.get('title', '')
                    url_link = hit.get('url', '')

                    if title and url_link:
                        results.append({
                            'source': 'HackerNews',
                            'title': title[:200],
                            'url': url_link[:500],
                            'snippet': '',
                            'points': hit.get('points', 0),
                            'query': query
                        })

        except Exception as e:
            print(f"    HackerNews error: {e}")

        return results

    def _scrape_reddit(self, query: str, max_results: int = 10) -> List[Dict]:
        """Scrape Reddit search results"""
        results = []

        try:
            url = "https://www.reddit.com/search.json"
            headers = {'User-Agent': 'AgenticToolResearch/1.0'}
            params = {
                'q': query,
                'limit': max_results,
                'sort': 'relevance'
            }

            response = requests.get(url, params=params, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()

                for post in data.get('data', {}).get('children', []):
                    post_data = post.get('data', {})

                    title = post_data.get('title', '')
                    url_link = post_data.get('url', '')
                    selftext = post_data.get('selftext', '')

                    if title and url_link:
                        results.append({
                            'source': 'Reddit',
                            'title': title[:200],
                            'url': url_link[:500],
                            'snippet': selftext[:300],
                            'subreddit': post_data.get('subreddit', ''),
                            'query': query
                        })

        except Exception as e:
            print(f"    Reddit error: {e}")

        return results

    def _scrape_github_trending(self) -> List[Dict]:
        """Scrape GitHub trending repositories"""
        results = []

        try:
            url = "https://github.com/trending"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')

                # Find repo articles
                articles = soup.find_all('article', class_='Box-row')

                for article in articles[:10]:
                    try:
                        # Extract repo name
                        h2 = article.find('h2')
                        if not h2:
                            continue

                        a_tag = h2.find('a')
                        if not a_tag:
                            continue

                        repo_path = a_tag.get('href', '')
                        repo_url = f"https://github.com{repo_path}" if repo_path else ''

                        # Extract description
                        p_tag = article.find('p', class_='col-9')
                        description = p_tag.get_text(strip=True) if p_tag else ''

                        # Extract language
                        lang_span = article.find('span', attrs={'itemprop': 'programmingLanguage'})
                        language = lang_span.get_text(strip=True) if lang_span else ''

                        # Extract stars
                        stars_text = ''
                        star_links = article.find_all('a', class_='Link')
                        for link in star_links:
                            if '/stargazers' in link.get('href', ''):
                                stars_text = link.get_text(strip=True)
                                break

                        if repo_url:
                            results.append({
                                'source': 'GitHub Trending',
                                'title': repo_path.strip('/'),
                                'url': repo_url,
                                'snippet': description[:300],
                                'language': language,
                                'stars': stars_text,
                                'query': 'trending'
                            })

                    except Exception as e:
                        continue

        except Exception as e:
            print(f"    GitHub Trending error: {e}")

        return results

    def _extract_tools_with_llm(self, tag: str, web_content: List[Dict], max_tools: int = 5) -> List[Dict]:
        """Use LLM to analyze scraped web content and extract actual tools"""

        # Build summary of web content (limit to prevent token overflow)
        content_summary = []
        for idx, item in enumerate(web_content[:30], 1):  # Max 30 items
            source = item['source']
            title = item['title'][:150]
            url = item['url'][:200]
            snippet = item.get('snippet', '')[:200]

            content_summary.append(
                f"{idx}. [{source}] {title}\n   URL: {url}\n   {snippet if snippet else '(no description)'}"
            )

        content_str = "\n\n".join(content_summary)

        prompt = f"""You are analyzing REAL WEB SEARCH RESULTS to discover agentic coding tools.

Search Query: "{tag}"

ACTUAL WEB CONTENT SCRAPED FROM MULTIPLE SOURCES:
{content_str}

Task: Analyze the actual web content above and identify REAL AGENTIC CODING TOOLS (AI-powered tools that help developers write, review, or generate code).

CRITICAL REQUIREMENTS:
- Only extract tools that appear in the ACTUAL web content above
- Verify the tool name and URL from the content
- Tools must be CURRENTLY AVAILABLE (not papers, benchmarks, or research)
- Provide WORKING URLs from the web content

For each tool found in the web content, provide:
1. **Title**: Exact tool name from web content
2. **Description**: Comprehensive 4-5 sentence description based on web content and your knowledge. Cover what it does, how it works, target users, and uniqueness.
3. **URL**: The actual URL from the web content
4. **Category**: One of: Code Completion, IDE/Editor, Terminal Tools, Testing, Code Review, Agent Framework, Language Model, Developer Platform
5. **Features**: List 3-4 specific, concrete features

Return ONLY a valid JSON array of tools (max {max_tools}):
[
  {{
    "title": "Tool Name",
    "description": "Comprehensive 4-5 sentence description...",
    "url": "https://actual-url-from-web-content.com",
    "category": "Category Name",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  }}
]

If no relevant tools found in web content, return: []
"""

        try:
            api_params = {
                "model": get_code_research_model(),
                "messages": [
                    {"role": "system", "content": "You are a web scraping analyst extracting tool information from real search results. Only extract tools that appear in the provided web content. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            }

            if model_supports_temperature(CODE_RESEARCH_MODEL_KEY):
                api_params["temperature"] = 0.5

            response = self.client.chat.completions.create(**api_params)
            content = response.choices[0].message.content.strip()

            # Extract JSON
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    tools = json.loads(json_match.group(0))
                    print(f"  LLM extracted {len(tools)} tools from web content")
                    return tools if isinstance(tools, list) else []
                except:
                    return []

            return []

        except Exception as e:
            print(f"    LLM extraction error: {e}")
            return []


if __name__ == "__main__":
    # Test the web scraping agent
    print("Testing Web Scraping Agent")
    print("=" * 60)

    agent = WebScrapingAgent()
    tools = agent.discover_tools_for_tag("AI code editor", max_results=5)

    print("\n" + "=" * 60)
    print(f"DISCOVERED {len(tools)} TOOLS FROM REAL WEB SCRAPING:")
    print("=" * 60)

    for i, tool in enumerate(tools, 1):
        print(f"\n{i}. {tool.get('title')}")
        print(f"   URL: {tool.get('url')}")
        print(f"   Category: {tool.get('category')}")
        print(f"   Description: {tool.get('description', '')[:150]}...")
