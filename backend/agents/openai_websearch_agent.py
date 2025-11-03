"""
OpenAI WebSearch Agent
Uses OpenAI's native web search tool for agentic research
Based on: https://platform.openai.com/docs/guides/tools-web-search
"""

import os
from typing import Dict, List, Optional
from openai import OpenAI
from datetime import datetime


class OpenAIWebSearchAgent:
    """Agent that uses OpenAI's web search tool for research"""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI WebSearch agent"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required")

        self.client = OpenAI(api_key=self.api_key)

    def search(self, query: str, max_results: int = 10) -> Dict:
        """
        Perform web search using OpenAI's web search tool

        Args:
            query: Search query string
            max_results: Maximum number of results to return

        Returns:
            Dictionary with search results and analysis
        """
        print(f"[OpenAI WebSearch] Searching for: {query}")

        try:
            # Create a chat completion with web search enabled
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Model that supports web search
                messages=[
                    {
                        "role": "user",
                        "content": f"""Search the web for: {query}

Please provide:
1. A comprehensive summary of the findings
2. Key insights and important information discovered
3. List of relevant sources with URLs
4. Any notable trends or patterns

Focus on recent and authoritative sources."""
                    }
                ],
                tools=[
                    {
                        "type": "web_search"
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )

            # Extract the response
            message = response.choices[0].message

            # Get the content
            content = message.content or ""

            # Check if web search was used
            tool_calls = message.tool_calls if hasattr(message, 'tool_calls') else None

            result = {
                "query": query,
                "timestamp": datetime.now().isoformat(),
                "summary": content,
                "model": response.model,
                "used_web_search": tool_calls is not None,
                "tool_calls": str(tool_calls) if tool_calls else None,
                "finish_reason": response.choices[0].finish_reason,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }

            print(f"[OpenAI WebSearch] Search completed. Used web search: {result['used_web_search']}")

            return result

        except Exception as e:
            print(f"[OpenAI WebSearch] Error: {e}")
            return {
                "query": query,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "summary": f"Error performing search: {str(e)}"
            }

    def research_topic(self, topic: str, aspects: Optional[List[str]] = None) -> Dict:
        """
        Conduct comprehensive research on a topic

        Args:
            topic: Main topic to research
            aspects: Specific aspects to focus on (optional)

        Returns:
            Dictionary with comprehensive research results
        """
        print(f"[OpenAI WebSearch] Researching topic: {topic}")

        # Build the research prompt
        prompt = f"Research the following topic comprehensively: {topic}\n\n"

        if aspects:
            prompt += "Focus on these specific aspects:\n"
            for i, aspect in enumerate(aspects, 1):
                prompt += f"{i}. {aspect}\n"
            prompt += "\n"

        prompt += """Please provide:
1. Overview and background
2. Current state and recent developments
3. Key players, tools, or technologies
4. Trends and future outlook
5. Notable resources and references

Use web search to find the most current and accurate information."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                tools=[
                    {
                        "type": "web_search"
                    }
                ],
                temperature=0.7,
                max_tokens=3000
            )

            message = response.choices[0].message
            content = message.content or ""
            tool_calls = message.tool_calls if hasattr(message, 'tool_calls') else None

            result = {
                "topic": topic,
                "aspects": aspects,
                "timestamp": datetime.now().isoformat(),
                "research": content,
                "model": response.model,
                "used_web_search": tool_calls is not None,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }

            print(f"[OpenAI WebSearch] Research completed. Token usage: {result['usage']['total_tokens']}")

            return result

        except Exception as e:
            print(f"[OpenAI WebSearch] Error: {e}")
            return {
                "topic": topic,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "research": f"Error conducting research: {str(e)}"
            }


def test_agent():
    """Test the OpenAI WebSearch agent"""
    agent = OpenAIWebSearchAgent()

    # Test simple search
    print("\n=== Testing Simple Search ===")
    result = agent.search("latest AI coding tools 2025")
    print(f"Query: {result['query']}")
    print(f"Used web search: {result.get('used_web_search')}")
    print(f"Summary:\n{result['summary'][:500]}...")

    # Test topic research
    print("\n\n=== Testing Topic Research ===")
    result = agent.research_topic(
        topic="Agentic AI coding assistants",
        aspects=[
            "Latest tools and platforms",
            "Key features and capabilities",
            "Market trends"
        ]
    )
    print(f"Topic: {result['topic']}")
    print(f"Used web search: {result.get('used_web_search')}")
    print(f"Research:\n{result['research'][:500]}...")


if __name__ == "__main__":
    test_agent()
