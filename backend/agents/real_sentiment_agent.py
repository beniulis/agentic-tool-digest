"""
Real Sentiment Analysis Agent
Fetches actual discussions from Reddit, HackerNews, and other sources
Analyzes real user sentiment with token/cost tracking
"""

import os
import time
import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from openai import OpenAI

try:
    from .model_registry import get_default_model, DEFAULT_MODEL_KEY, model_supports_temperature
except ImportError:
    from model_registry import get_default_model, DEFAULT_MODEL_KEY, model_supports_temperature


class RealSentimentAgent:
    """Fetches and analyzes real discussions from public forums"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

        # Metrics tracking
        self.total_tokens = 0
        self.total_cost = 0.0
        self.start_time = None
        self.end_time = None

        # Pricing (GPT-5 pricing - update these as needed)
        self.input_token_cost = 0.00001  # $10 per 1M tokens
        self.output_token_cost = 0.00003  # $30 per 1M tokens

    def analyze_tool_sentiment(self, tool: Dict, max_discussions: int = 50) -> Dict:
        """
        Analyze real public sentiment for a tool

        Args:
            tool: Tool dictionary with title, description, url
            max_discussions: Maximum number of discussions to fetch per source

        Returns:
            Sentiment data with metrics
        """
        self.start_time = time.time()
        print(f"\n{'='*60}")
        print(f"Real Sentiment Analysis: {tool['title']}")
        print(f"{'='*60}")

        # Fetch real discussions from multiple sources
        all_discussions = []

        # 1. HackerNews (Algolia API - free, no auth needed)
        hn_discussions = self._fetch_hackernews_discussions(tool['title'], max_results=max_discussions)
        all_discussions.extend(hn_discussions)
        print(f"[OK] Fetched {len(hn_discussions)} HackerNews discussions")

        # 2. Reddit (using pushshift/Reddit API)
        reddit_discussions = self._fetch_reddit_discussions(tool['title'], max_results=max_discussions)
        all_discussions.extend(reddit_discussions)
        print(f"[OK] Fetched {len(reddit_discussions)} Reddit discussions")

        # 3. GitHub Issues/Discussions (if it's a GitHub repo)
        if 'github.com' in tool.get('url', ''):
            gh_discussions = self._fetch_github_discussions(tool['url'], max_results=max_discussions)
            all_discussions.extend(gh_discussions)
            print(f"[OK] Fetched {len(gh_discussions)} GitHub discussions")

        print(f"\nTotal discussions found: {len(all_discussions)}")

        if len(all_discussions) == 0:
            return self._generate_no_data_response(tool)

        # Analyze sentiment using LLM with real data
        sentiment_result = self._analyze_with_llm(tool, all_discussions)

        # Add metrics
        self.end_time = time.time()
        sentiment_result['metrics'] = self._get_metrics()

        return sentiment_result

    def _fetch_hackernews_discussions(self, tool_name: str, max_results: int = 50) -> List[Dict]:
        """Fetch discussions from HackerNews using Algolia API"""
        discussions = []

        try:
            # HackerNews Algolia Search API (free, no auth)
            url = "http://hn.algolia.com/api/v1/search"
            params = {
                'query': tool_name,
                'tags': '(story,comment)',
                'hitsPerPage': max_results
            }

            response = requests.get(url, params=params, timeout=10)

            if response.status_code == 200:
                data = response.json()

                for hit in data.get('hits', []):
                    # Extract meaningful content
                    if hit.get('story_text'):
                        text = hit['story_text']
                    elif hit.get('comment_text'):
                        text = hit['comment_text']
                    else:
                        text = hit.get('title', '')

                    if text and len(text) > 20:  # Only meaningful content
                        discussions.append({
                            'source': 'HackerNews',
                            'text': text[:500],  # Limit to 500 chars per discussion
                            'points': hit.get('points', 0),
                            'created_at': hit.get('created_at'),
                            'url': f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
                        })

        except Exception as e:
            print(f"  HackerNews fetch error: {e}")

        return discussions

    def _fetch_reddit_discussions(self, tool_name: str, max_results: int = 50) -> List[Dict]:
        """Fetch discussions from Reddit using official API (no auth for search)"""
        discussions = []

        try:
            # Reddit Search API (public, no auth for basic search)
            url = "https://www.reddit.com/search.json"
            headers = {'User-Agent': 'AgenticToolResearch/1.0'}
            params = {
                'q': tool_name,
                'limit': max_results,
                'sort': 'relevance',
                't': 'all'  # all time
            }

            response = requests.get(url, params=params, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()

                for post in data.get('data', {}).get('children', []):
                    post_data = post.get('data', {})

                    # Get post title and selftext
                    text = post_data.get('title', '')
                    if post_data.get('selftext'):
                        text += ' ' + post_data['selftext'][:300]

                    if text and len(text) > 20:
                        discussions.append({
                            'source': 'Reddit',
                            'subreddit': post_data.get('subreddit'),
                            'text': text[:500],
                            'score': post_data.get('score', 0),
                            'num_comments': post_data.get('num_comments', 0),
                            'created_utc': post_data.get('created_utc'),
                            'url': f"https://reddit.com{post_data.get('permalink', '')}"
                        })

        except Exception as e:
            print(f"  Reddit fetch error: {e}")

        return discussions

    def _fetch_github_discussions(self, repo_url: str, max_results: int = 30) -> List[Dict]:
        """Fetch recent issues/discussions from GitHub repo"""
        discussions = []

        try:
            # Extract owner/repo from URL
            import re
            match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
            if not match:
                return discussions

            owner, repo = match.groups()
            repo = repo.replace('.git', '').split('?')[0].split('#')[0]

            # GitHub API for issues (public, rate limited but no auth needed)
            url = f"https://api.github.com/repos/{owner}/{repo}/issues"
            headers = {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'AgenticToolResearch/1.0'
            }
            params = {
                'state': 'all',
                'per_page': max_results,
                'sort': 'comments',
                'direction': 'desc'
            }

            response = requests.get(url, headers=headers, params=params, timeout=10)

            if response.status_code == 200:
                issues = response.json()

                for issue in issues:
                    text = issue.get('title', '')
                    if issue.get('body'):
                        text += ' ' + issue['body'][:300]

                    if text and len(text) > 20:
                        discussions.append({
                            'source': 'GitHub',
                            'text': text[:500],
                            'comments': issue.get('comments', 0),
                            'state': issue.get('state'),
                            'created_at': issue.get('created_at'),
                            'url': issue.get('html_url')
                        })

        except Exception as e:
            print(f"  GitHub fetch error: {e}")

        return discussions

    def _analyze_with_llm(self, tool: Dict, discussions: List[Dict]) -> Dict:
        """Analyze real discussions using LLM"""

        # Prepare discussion summary (limit to prevent excessive tokens)
        discussion_texts = []
        for idx, disc in enumerate(discussions[:30], 1):  # Max 30 discussions
            source = disc['source']
            text = disc['text'][:300]  # Max 300 chars per discussion
            discussion_texts.append(f"{idx}. [{source}] {text}")

        discussions_str = "\n".join(discussion_texts)

        prompt = f"""You are analyzing REAL public discussions about a developer tool.

Tool: {tool['title']}
Description: {tool.get('description', 'N/A')}
URL: {tool.get('url', 'N/A')}

REAL DISCUSSIONS FROM PUBLIC FORUMS:
{discussions_str}

Based on these ACTUAL discussions, provide:
1. **Overall Sentiment**: One of: "Very Positive", "Positive", "Mixed", "Neutral", "Negative", "Not Widely Discussed"
2. **Usage Niche**: Based on the discussions, who is actually using this tool? (e.g., "Enterprise teams", "Solo developers", "ML researchers", etc.)
3. **Active Usage**: Are people actively discussing and using this tool?
4. **Key Discussion Points**: Extract 3-5 REAL themes from the discussions above (what people are actually saying - praise, complaints, use cases, etc.)
5. **Discussion Count**: How many real discussions were found? (Total: {len(discussions)})

IMPORTANT: Base your analysis ONLY on the actual discussions provided above. Do not make assumptions.

Return ONLY valid JSON:
{{
  "sentiment": "Positive",
  "usageNiche": "Description based on actual user discussions",
  "activelyUsed": true,
  "discussions": [
    "Real theme from discussions",
    "Another real theme from discussions",
    "Another real theme from discussions"
  ],
  "discussionCount": {len(discussions)},
  "sources": ["HackerNews", "Reddit", "GitHub"]
}}
"""

        print(f"\nAnalyzing {len(discussions)} real discussions with LLM...")

        api_params = {
            "model": get_default_model(),
            "messages": [
                {"role": "system", "content": "You are a sentiment analysis expert. Analyze ONLY the actual discussions provided. Be objective and factual."},
                {"role": "user", "content": prompt}
            ]
        }

        if model_supports_temperature(DEFAULT_MODEL_KEY):
            api_params["temperature"] = 0.3  # Lower temperature for factual analysis

        response = self.client.chat.completions.create(**api_params)

        # Track token usage
        usage = response.usage
        self.total_tokens = usage.total_tokens
        input_cost = usage.prompt_tokens * self.input_token_cost
        output_cost = usage.completion_tokens * self.output_token_cost
        self.total_cost = input_cost + output_cost

        print(f"[OK] LLM analysis complete")
        print(f"  Tokens: {usage.total_tokens} (input: {usage.prompt_tokens}, output: {usage.completion_tokens})")
        print(f"  Cost: ${self.total_cost:.4f}")

        # Parse response
        import json
        import re

        content = response.choices[0].message.content.strip()

        # Extract JSON from response
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group(0))
                return result
            except:
                pass

        # Fallback
        return self._generate_no_data_response(tool)

    def _generate_no_data_response(self, tool: Dict) -> Dict:
        """Generate response when no discussions are found"""
        return {
            "sentiment": "Not Widely Discussed",
            "usageNiche": "Limited public discussion found",
            "activelyUsed": False,
            "discussions": ["No significant public discussions found"],
            "discussionCount": 0,
            "sources": []
        }

    def _get_metrics(self) -> Dict:
        """Get performance metrics"""
        duration = self.end_time - self.start_time if self.end_time else 0

        return {
            'total_tokens': self.total_tokens,
            'total_cost_usd': round(self.total_cost, 4),
            'duration_seconds': round(duration, 2),
            'timestamp': datetime.now().isoformat()
        }


if __name__ == "__main__":
    # Test on a single tool
    test_tool = {
        "title": "Cursor",
        "description": "AI-first code editor designed for pair-programming with AI",
        "url": "https://cursor.sh"
    }

    print("Testing Real Sentiment Analysis")
    print("=" * 60)

    agent = RealSentimentAgent()
    result = agent.analyze_tool_sentiment(test_tool, max_discussions=30)

    print("\n" + "=" * 60)
    print("RESULTS:")
    print("=" * 60)
    print(f"Sentiment: {result.get('sentiment')}")
    print(f"Usage Niche: {result.get('usageNiche')}")
    print(f"Active Usage: {result.get('activelyUsed')}")
    print(f"Discussion Count: {result.get('discussionCount')}")
    print(f"Sources: {', '.join(result.get('sources', []))}")
    print("\nKey Discussion Points:")
    for point in result.get('discussions', []):
        print(f"  - {point}")

    print("\n" + "=" * 60)
    print("METRICS:")
    print("=" * 60)
    metrics = result.get('metrics', {})
    print(f"Total Tokens: {metrics.get('total_tokens')}")
    print(f"Total Cost: ${metrics.get('total_cost_usd')}")
    print(f"Duration: {metrics.get('duration_seconds')}s")
