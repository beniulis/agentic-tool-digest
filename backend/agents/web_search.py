"""
Real Web Search Integration for Research Agent
Adds actual web browsing capabilities
"""

import os
import requests
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import json


class WebSearchProvider:
    """Base class for web search providers"""

    def search(self, query: str, num_results: int = 10) -> List[Dict]:
        """
        Search the web and return results

        Returns:
            List of dicts with: {title, url, snippet, source}
        """
        raise NotImplementedError


class BingSearchProvider(WebSearchProvider):
    """Bing Web Search API (requires API key)"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("BING_SEARCH_API_KEY")
        if not self.api_key:
            raise ValueError("Bing API key required. Set BING_SEARCH_API_KEY")

        self.endpoint = "https://api.bing.microsoft.com/v7.0/search"

    def search(self, query: str, num_results: int = 10) -> List[Dict]:
        """Search using Bing API"""
        headers = {"Ocp-Apim-Subscription-Key": self.api_key}
        params = {
            "q": query,
            "count": num_results,
            "mkt": "en-US"
        }

        response = requests.get(self.endpoint, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        results = []

        for item in data.get("webPages", {}).get("value", []):
            results.append({
                "title": item.get("name"),
                "url": item.get("url"),
                "snippet": item.get("snippet"),
                "source": "bing"
            })

        return results


class GoogleSearchProvider(WebSearchProvider):
    """Google Custom Search API (requires API key + Search Engine ID)"""

    def __init__(self, api_key: Optional[str] = None, search_engine_id: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_SEARCH_API_KEY")
        self.search_engine_id = search_engine_id or os.getenv("GOOGLE_SEARCH_ENGINE_ID")

        if not self.api_key or not self.search_engine_id:
            raise ValueError("Google API key and Search Engine ID required")

        self.endpoint = "https://www.googleapis.com/customsearch/v1"

    def search(self, query: str, num_results: int = 10) -> List[Dict]:
        """Search using Google Custom Search API"""
        params = {
            "key": self.api_key,
            "cx": self.search_engine_id,
            "q": query,
            "num": min(num_results, 10)  # Google limits to 10 per request
        }

        response = requests.get(self.endpoint, params=params)
        response.raise_for_status()

        data = response.json()
        results = []

        for item in data.get("items", []):
            results.append({
                "title": item.get("title"),
                "url": item.get("link"),
                "snippet": item.get("snippet"),
                "source": "google"
            })

        return results


class DuckDuckGoSearchProvider(WebSearchProvider):
    """DuckDuckGo (Free, no API key required)"""

    def search(self, query: str, num_results: int = 10) -> List[Dict]:
        """
        Search using DuckDuckGo HTML scraping
        Note: This is a simplified version. For production, consider using:
        - duckduckgo-search library (pip install duckduckgo-search)
        """
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            raise ImportError(
                "Install duckduckgo-search: pip install duckduckgo-search"
            )

        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=num_results):
                results.append({
                    "title": r.get("title"),
                    "url": r.get("href"),
                    "snippet": r.get("body"),
                    "source": "duckduckgo"
                })

        return results


class GitHubSearchProvider:
    """Search GitHub repositories"""

    def search_repos(self, query: str, num_results: int = 10) -> List[Dict]:
        """Search GitHub repositories"""
        url = "https://api.github.com/search/repositories"
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": num_results
        }

        # Add authentication if available (increases rate limits)
        headers = {}
        github_token = os.getenv("GITHUB_TOKEN")
        if github_token:
            headers["Authorization"] = f"token {github_token}"

        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()

        data = response.json()
        results = []

        for repo in data.get("items", []):
            results.append({
                "title": repo.get("name"),
                "full_name": repo.get("full_name"),
                "url": repo.get("html_url"),
                "description": repo.get("description"),
                "stars": repo.get("stargazers_count"),
                "language": repo.get("language"),
                "updated_at": repo.get("updated_at"),
                "source": "github"
            })

        return results


class WebPageFetcher:
    """Fetch and parse web page content"""

    def fetch(self, url: str) -> Optional[Dict]:
        """
        Fetch a web page and extract key information

        Returns:
            Dict with: {title, content, meta_description}
        """
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract title
            title = soup.find('title')
            title = title.get_text() if title else ""

            # Extract meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc.get('content', '') if meta_desc else ""

            # Extract main content (simplified)
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get text
            text = soup.get_text()
            # Clean up whitespace
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            content = ' '.join(chunk for chunk in chunks if chunk)

            # Limit content length
            content = content[:5000]

            return {
                "title": title,
                "description": description,
                "content": content,
                "url": url
            }

        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None


# Example usage
if __name__ == "__main__":
    # Test DuckDuckGo (free, no API key)
    print("Testing DuckDuckGo Search...")
    try:
        ddg = DuckDuckGoSearchProvider()
        results = ddg.search("AI code completion tools", num_results=5)

        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result['title']}")
            print(f"   {result['url']}")
            print(f"   {result['snippet'][:100]}...")

    except ImportError:
        print("Install: pip install duckduckgo-search")

    # Test GitHub Search (free, but rate limited)
    print("\n\nTesting GitHub Search...")
    gh = GitHubSearchProvider()
    repos = gh.search_repos("AI code assistant", num_results=5)

    for i, repo in enumerate(repos, 1):
        print(f"\n{i}. {repo['full_name']} ⭐ {repo['stars']:,}")
        print(f"   {repo['url']}")
        print(f"   {repo['description'][:100]}...")
