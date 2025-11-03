interface McpJsonContent<T> {
  type: "json" | "text";
  json?: T;
  text?: string;
}

interface McpToolCallResponse<T> {
  result?: {
    content?: McpJsonContent<T>[];
  };
  error?: {
    message?: string;
  };
}

export interface AgenticToolSearchItem {
  title: string;
  url: string;
  snippet: string;
  score?: number | null;
  source?: string | null;
  publishedAt?: string | null;
}

export interface AgenticToolSearchResponse {
  provider: string;
  query: string;
  fetchedAt: string;
  results: AgenticToolSearchItem[];
}

export interface SentimentHighlight {
  token: string;
  polarity: "positive" | "negative";
}

export interface SentimentDetails {
  score: number;
  normalizedScore: number;
  label: "positive" | "neutral" | "negative";
  positive: number;
  negative: number;
  total: number;
  highlights: SentimentHighlight[];
}

export interface SentimentMention {
  title: string;
  url: string;
  snippet?: string;
  sentiment?: SentimentDetails;
  source?: string | null;
  publishedAt?: string | null;
  error?: string;
}

export interface SentimentSummary {
  averageScore: number;
  averageNormalizedScore: number;
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  rating: "positive" | "neutral" | "negative" | "unknown";
}

export interface SentimentResponse {
  toolName: string;
  query: string;
  generatedAt: string;
  totalResults: number;
  analyzedCount: number;
  summary: SentimentSummary;
  mentions: SentimentMention[];
}

function resolveMcpEndpoint(): string {
  const base = (import.meta.env.VITE_RESEARCH_AGENT_API ?? "").replace(/\/$/, "");
  if (!base) {
    return "/mcp";
  }
  return `${base}/mcp`;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(16).slice(2);
}

async function callMcpTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const endpoint = resolveMcpEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: createRequestId(),
      method: "tools/call",
      params: {
        name,
        arguments: args
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`MCP request failed (${response.status}): ${message}`);
  }

  const payload = (await response.json()) as McpToolCallResponse<T>;
  if (payload.error) {
    throw new Error(payload.error.message ?? "MCP tool call failed");
  }

  const content = payload.result?.content?.[0];
  if (!content) {
    throw new Error("MCP response did not include any content");
  }

  if (content.type === "json" && content.json !== undefined) {
    return content.json;
  }

  if (content.type === "text" && content.text) {
    try {
      return JSON.parse(content.text) as T;
    } catch (error) {
      throw new Error("Failed to parse JSON text returned by MCP tool");
    }
  }

  throw new Error("Unsupported MCP content type");
}

export async function fetchAgenticTools(query: string, maxResults = 6): Promise<AgenticToolSearchResponse> {
  return await callMcpTool<AgenticToolSearchResponse>("websearch_agentic_tools", {
    query,
    maxResults
  });
}

export interface SentimentOptions {
  maxResults?: number;
  maxArticles?: number;
}

export async function fetchToolSentiment(toolName: string, options: SentimentOptions = {}): Promise<SentimentResponse> {
  return await callMcpTool<SentimentResponse>("websearch_public_sentiment", {
    toolName,
    maxResults: options.maxResults,
    maxArticles: options.maxArticles
  });
}

export async function listAvailableTools(): Promise<string[]> {
  const endpoint = resolveMcpEndpoint();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: createRequestId(),
      method: "tools/list"
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`MCP list request failed (${response.status}): ${message}`);
  }

  const payload = await response.json();
  return (payload?.result?.tools ?? []).map((tool: { name: string }) => tool.name);
}
