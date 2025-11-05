"""
OpenAI Tools WebSearch Agent
Uses the Responses API with the native web_search tool and optional MCP servers.
Based on: https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional

from openai import OpenAI


class OpenAIToolsWebSearchAgent:
    """
    Agent that orchestrates agentic research with the Responses API, combining
    OpenAI's native web_search tool with optional MCP servers/connectors.
    """

    DEFAULT_MODEL = "gpt-4.1-mini"
    DEFAULT_MAX_OUTPUT_TOKENS = 2000
    WEB_SEARCH_TOOL_VERSION = os.getenv("OPENAI_WEBSEARCH_TOOL_VERSION", "web_search")

    MCP_ENV_KEY = "OPENAI_MCP_SERVERS"
    MCP_ENV_PATH_KEY = "OPENAI_MCP_SERVERS_PATH"

    WEB_SEARCH_CONTEXT_KEY = "OPENAI_WEBSEARCH_CONTEXT_SIZE"
    WEB_SEARCH_ALLOWED_DOMAINS_KEY = "OPENAI_WEBSEARCH_ALLOWED_DOMAINS"

    def __init__(
        self,
        api_key: Optional[str] = None,
        *,
        model: Optional[str] = None,
        max_output_tokens: Optional[int] = None,
        mcp_servers: Optional[Iterable[Dict[str, Any]]] = None,
    ) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required")

        self.client = OpenAI(api_key=self.api_key)

        self.model = model or os.getenv("OPENAI_WEBSEARCH_MODEL", self.DEFAULT_MODEL)

        configured_max_tokens = os.getenv("OPENAI_WEBSEARCH_MAX_TOKENS")
        if max_output_tokens is not None:
            self.max_output_tokens = max_output_tokens
        elif configured_max_tokens and configured_max_tokens.isdigit():
            self.max_output_tokens = int(configured_max_tokens)
        else:
            self.max_output_tokens = self.DEFAULT_MAX_OUTPUT_TOKENS

        # Build the tool list once – includes builtin web search and optional MCP servers.
        self.web_search_tool = self._build_web_search_tool()
        self.mcp_tools = self._normalise_mcp_servers(
            mcp_servers if mcp_servers is not None else self._load_mcp_servers_from_env()
        )
        self.tools: List[Dict[str, Any]] = [self.web_search_tool, *self.mcp_tools]

    def run_agentic_research(
        self,
        *,
        topic: Optional[str],
        search_terms: List[str],
        user_instructions: Optional[str] = None,
        focus_questions: Optional[List[str]] = None,
        max_output_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Execute agentic research for the provided topic/search terms.

        Args:
            topic: Optional topic headline for the research session.
            search_terms: Explicit search terms the agent must investigate.
            user_instructions: Additional guidance for tone/formatting.
            focus_questions: Optional sub-questions to address.
            max_output_tokens: Optional override for output tokens.

        Returns:
            Dict containing the summarised findings plus telemetry about tool usage.
        """
        cleaned_terms = [term.strip() for term in search_terms if term and term.strip()]
        if not cleaned_terms:
            raise ValueError("At least one search term is required for agentic research")

        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(
            topic=topic,
            search_terms=cleaned_terms,
            user_instructions=user_instructions,
            focus_questions=focus_questions,
        )

        # Respect per-call max tokens override when provided.
        output_tokens = max_output_tokens or self.max_output_tokens

        try:
            response = self.client.responses.create(
                model=self.model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                tools=self.tools,
                include=["web_search_call.action.sources"],
                max_output_tokens=output_tokens,
                parallel_tool_calls=True,
                metadata={
                    "agent": "openai_tools_websearch",
                    "topic": (topic or "ad-hoc").strip()[:128],
                },
            )
        except Exception as exc:
            raise RuntimeError(f"Failed to complete agentic research: {exc}") from exc

        return self._serialise_response(
            response=response,
            topic=topic,
            search_terms=cleaned_terms,
            user_instructions=user_instructions,
            focus_questions=focus_questions,
        )

    # ---------------------------------------------------------------------
    # Internal helpers
    # ---------------------------------------------------------------------

    def _build_system_prompt(self) -> str:
        return (
            "You are an autonomous research analyst. "
            "You have access to the OpenAI web_search tool and any connected MCP servers. "
            "For every provided search term, you MUST perform at least one web_search call "
            "before drafting your report. "
            "Consolidate the findings into a concise briefing targeted at software leaders. "
            "Use markdown headings, bullet points, and cite key sources inline using the "
            "format [label](url). "
            "Prefer high-quality, recent sources."
        )

    def _build_user_prompt(
        self,
        *,
        topic: Optional[str],
        search_terms: List[str],
        user_instructions: Optional[str],
        focus_questions: Optional[List[str]],
    ) -> str:
        prompt_lines = []

        if topic:
            prompt_lines.append(f"Primary topic: {topic.strip()}")

        prompt_lines.append("Search terms to investigate (one per line):")
        prompt_lines.extend([f"- {term}" for term in search_terms])

        if focus_questions:
            prompt_lines.append("\nFocus questions to address:")
            prompt_lines.extend([f"1. {question}" if idx == 0 else f"{idx + 1}. {question}"
                                 for idx, question in enumerate(focus_questions)])

        prompt_lines.append(
            "\nDeliverable:\n"
            "- Executive summary (3-4 bullet points)\n"
            "- Key findings with supporting evidence\n"
            "- Emerging trends / opportunities\n"
            "- Actionable recommendations\n"
            "- Source list (use markdown links)"
        )

        if user_instructions:
            prompt_lines.append("\nAdditional instructions:\n")
            prompt_lines.append(user_instructions.strip())

        return "\n".join(prompt_lines)

    def _build_web_search_tool(self) -> Dict[str, Any]:
        tool: Dict[str, Any] = {"type": self.WEB_SEARCH_TOOL_VERSION}

        context_size = os.getenv(self.WEB_SEARCH_CONTEXT_KEY, "").lower()
        if context_size in {"low", "medium", "high"}:
            tool["search_context_size"] = context_size

        allowed_domains_raw = os.getenv(self.WEB_SEARCH_ALLOWED_DOMAINS_KEY, "")
        allowed_domains = [
            domain.strip()
            for domain in allowed_domains_raw.split(",")
            if domain.strip()
        ]
        if allowed_domains:
            tool["filters"] = {"allowed_domains": allowed_domains}

        return tool

    def _load_mcp_servers_from_env(self) -> List[Dict[str, Any]]:
        """
        Load MCP server definitions from either a JSON file path or JSON string.
        Environment precedence: file path, then raw JSON.
        """
        # First try explicit file path.
        path = os.getenv(self.MCP_ENV_PATH_KEY)
        if path:
            try:
                with open(path, "r", encoding="utf-8") as fh:
                    return json.load(fh)
            except FileNotFoundError:
                raise FileNotFoundError(f"MCP server config file not found: {path}") from None
            except json.JSONDecodeError as exc:
                raise ValueError(f"MCP server config file is not valid JSON: {exc}") from exc

        # Fallback to raw JSON in environment variable.
        raw_json = os.getenv(self.MCP_ENV_KEY)
        if raw_json:
            try:
                data = json.loads(raw_json)
                if isinstance(data, dict):
                    # Support single server objects by wrapping into a list.
                    return [data]
                return data
            except json.JSONDecodeError as exc:
                raise ValueError("OPENAI_MCP_SERVERS must contain valid JSON") from exc

        return []

    def _normalise_mcp_servers(
        self,
        servers: Iterable[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Ensure MCP server definitions match the Responses API schema.
        """
        normalised: List[Dict[str, Any]] = []
        allowed_keys = {
            "type",
            "server_label",
            "server_url",
            "connector_id",
            "authorization",
            "headers",
            "allowed_tools",
            "require_approval",
            "server_description",
        }

        for server in servers or []:
            if not isinstance(server, dict):
                continue

            server_label = server.get("server_label")
            if not server_label:
                continue

            normalised_server = {"type": "mcp", "server_label": server_label}
            for key in allowed_keys:
                if key in {"type", "server_label"}:
                    continue
                if key in server and server[key] is not None:
                    normalised_server[key] = server[key]

            normalised.append(normalised_server)

        return normalised

    def _serialise_response(
        self,
        *,
        response: Any,
        topic: Optional[str],
        search_terms: List[str],
        user_instructions: Optional[str],
        focus_questions: Optional[List[str]],
    ) -> Dict[str, Any]:
        summary = self._extract_summary(response)
        web_search_actions = self._extract_web_search_actions(response)
        mcp_calls = self._extract_mcp_calls(response)

        usage = getattr(response, "usage", None)
        usage_payload = usage.model_dump() if usage is not None else None

        result: Dict[str, Any] = {
            "response_id": getattr(response, "id", None),
            "topic": topic,
            "search_terms": search_terms,
            "instructions": user_instructions,
            "focus_questions": focus_questions,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "summary": summary,
            "model": getattr(response, "model", None),
            "used_tools": {
                "web_search": bool(web_search_actions),
                "mcp": bool(mcp_calls),
            },
            "actions": {
                "web_search": web_search_actions,
                "mcp_calls": mcp_calls,
            },
            "usage": usage_payload,
            "parallel_tool_calls": getattr(response, "parallel_tool_calls", None),
        }

        return result

    def _extract_summary(self, response: Any) -> str:
        text_chunks: List[str] = []

        for item in getattr(response, "output", []) or []:
            item_type = getattr(item, "type", None)
            if item_type != "message":
                continue

            for content in getattr(item, "content", []) or []:
                if getattr(content, "type", None) == "output_text":
                    text = getattr(content, "text", "")
                    if text:
                        text_chunks.append(text)

        return "\n\n".join(text_chunks).strip()

    def _extract_web_search_actions(self, response: Any) -> List[Dict[str, Any]]:
        actions: List[Dict[str, Any]] = []

        for item in getattr(response, "output", []) or []:
            if getattr(item, "type", None) != "web_search_call":
                continue

            action = getattr(item, "action", None)
            status = getattr(item, "status", None)

            action_payload: Dict[str, Any] = {
                "id": getattr(item, "id", None),
                "status": status,
                "action_type": getattr(action, "type", None),
            }

            if action and getattr(action, "type", None) == "search":
                action_payload["query"] = getattr(action, "query", None)
                sources = getattr(action, "sources", None) or []
                action_payload["sources"] = [
                    {"url": getattr(source, "url", None)}
                    for source in sources
                    if getattr(source, "url", None)
                ]
            elif action and getattr(action, "type", None) == "open_page":
                action_payload["url"] = getattr(action, "url", None)
            elif action and getattr(action, "type", None) == "find":
                action_payload["url"] = getattr(action, "url", None)
                action_payload["pattern"] = getattr(action, "pattern", None)

            actions.append(action_payload)

        return actions

    def _extract_mcp_calls(self, response: Any) -> List[Dict[str, Any]]:
        calls: List[Dict[str, Any]] = []

        for item in getattr(response, "output", []) or []:
            if getattr(item, "type", None) != "mcp_call":
                continue

            call_payload: Dict[str, Any] = {
                "id": getattr(item, "id", None),
                "server_label": getattr(item, "server_label", None),
                "tool_name": getattr(item, "name", None),
                "status": getattr(item, "status", None),
                "output": getattr(item, "output", None),
            }

            arguments = getattr(item, "arguments", None)
            if arguments:
                parsed_args = self._safe_parse_json(arguments)
                call_payload["arguments"] = parsed_args if parsed_args is not None else arguments

            calls.append(call_payload)

        return calls

    @staticmethod
    def _safe_parse_json(payload: str) -> Optional[Any]:
        try:
            return json.loads(payload)
        except (TypeError, json.JSONDecodeError):
            return None


def test_agentic_research() -> None:
    """Manual test hook for local debugging."""
    agent = OpenAIToolsWebSearchAgent()
    result = agent.run_agentic_research(
        topic="Agentic coding platforms",
        search_terms=[
            "latest OpenAI MCP tooling 2025",
            "agentic coding assistants enterprise adoption",
        ],
        focus_questions=[
            "What search connectors are available through MCP servers?",
            "How are developers using agentic workflows in production?",
        ],
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    test_agentic_research()
