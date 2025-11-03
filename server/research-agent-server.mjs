import { createServer } from "node:http";

const SERVER_INFO = {
  name: "agentic-research-server",
  version: "1.0.0"
};

const DEFAULT_QUERY = "agentic coding systems and tools";
const DEFAULT_MAX_RESULTS = 6;
const DEFAULT_MAX_ARTICLES = 3;
const MAX_RESULTS_CAP = 10;
const USER_AGENT = process.env.RESEARCH_AGENT_USER_AGENT ?? "AgenticToolDigestResearchBot/1.0 (+https://agentic.tools)";
const SEARCH_PROVIDER = process.env.RESEARCH_SEARCH_PROVIDER ?? "tavily";

const positiveWords = new Set([
  "accessible",
  "accurate",
  "amazing",
  "awesome",
  "beneficial",
  "best",
  "breakthrough",
  "clean",
  "comprehensive",
  "convenient",
  "effective",
  "efficient",
  "empowering",
  "excellent",
  "fast",
  "flexible",
  "great",
  "helpful",
  "impressive",
  "innovative",
  "intuitive",
  "love",
  "productive",
  "progress",
  "reliable",
  "recommend",
  "robust",
  "solid",
  "streamlined",
  "success",
  "supportive",
  "transformative",
  "useful",
  "valuable",
  "well-designed"
]);

const negativeWords = new Set([
  "annoying",
  "broken",
  "bug",
  "buggy",
  "confusing",
  "crash",
  "difficult",
  "disappointed",
  "expensive",
  "fail",
  "frustrating",
  "hard",
  "hate",
  "inaccurate",
  "issue",
  "lag",
  "laggy",
  "lacking",
  "limited",
  "negative",
  "outdated",
  "overpriced",
  "poor",
  "problem",
  "slow",
  "terrible",
  "unreliable",
  "unsatisfied",
  "unusable",
  "worse"
]);

const tools = new Map();

function normalizeNumber(value, fallback, { min = 1, max = MAX_RESULTS_CAP } = {}) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  const intValue = Math.floor(numericValue);
  if (intValue < min) {
    return min;
  }
  if (intValue > max) {
    return max;
  }
  return intValue;
}

function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[\s\S]*?>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function analyzeSentiment(text) {
  const tokens = tokenize(text);
  let positive = 0;
  let negative = 0;
  const highlights = [];

  for (const token of tokens) {
    if (positiveWords.has(token)) {
      positive += 1;
      highlights.push({ token, polarity: "positive" });
    } else if (negativeWords.has(token)) {
      negative += 1;
      highlights.push({ token, polarity: "negative" });
    }
  }

  const total = tokens.length || 1;
  const score = positive - negative;
  const normalizedScore = score / total;
  let label = "neutral";
  if (normalizedScore > 0.02) {
    label = "positive";
  } else if (normalizedScore < -0.02) {
    label = "negative";
  }

  return {
    score,
    normalizedScore,
    label,
    positive,
    negative,
    total,
    highlights
  };
}

function summariseSentiment(entries) {
  const validEntries = entries.filter(entry => entry && !entry.error);
  if (validEntries.length === 0) {
    return {
      averageScore: 0,
      averageNormalizedScore: 0,
      distribution: { positive: 0, neutral: 0, negative: 0 },
      rating: "unknown"
    };
  }

  const totals = validEntries.reduce(
    (acc, entry) => {
      acc.score += entry.sentiment.score;
      acc.normalized += entry.sentiment.normalizedScore;
      acc[entry.sentiment.label] += 1;
      return acc;
    },
    { score: 0, normalized: 0, positive: 0, neutral: 0, negative: 0 }
  );

  const averageScore = totals.score / validEntries.length;
  const averageNormalizedScore = totals.normalized / validEntries.length;

  let rating = "neutral";
  if (averageNormalizedScore > 0.02) {
    rating = "positive";
  } else if (averageNormalizedScore < -0.02) {
    rating = "negative";
  }

  return {
    averageScore,
    averageNormalizedScore,
    distribution: {
      positive: totals.positive,
      neutral: totals.neutral,
      negative: totals.negative
    },
    rating
  };
}

async function tavilySearch(query, maxResults) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("TAVILY_API_KEY environment variable must be provided to use Tavily search.");
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: maxResults,
      include_images: false,
      include_answer: false
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Tavily search failed (${response.status}): ${message}`);
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results.slice(0, maxResults).map(item => ({
    title: item.title ?? item.url ?? "Untitled result",
    url: item.url,
    snippet: item.content ?? item.snippet ?? "",
    score: typeof item.score === "number" ? item.score : null,
    publishedAt: item.published_date ?? item.date ?? null,
    source: item.source ?? item.author ?? extractHostname(item.url)
  }));
}

async function performSearch(query, maxResults) {
  switch (SEARCH_PROVIDER) {
    case "tavily":
      return tavilySearch(query, maxResults);
    default:
      throw new Error(`Unsupported search provider \"${SEARCH_PROVIDER}\". Set RESEARCH_SEARCH_PROVIDER to a supported provider.`);
  }
}

async function searchAgenticTools(query, maxResults) {
  const results = await performSearch(query, maxResults);
  return {
    provider: SEARCH_PROVIDER,
    query,
    fetchedAt: new Date().toISOString(),
    results
  };
}

async function gatherPublicSentiment(toolName, maxResults, maxArticles) {
  const sentimentQuery = `${toolName} developer feedback reviews ${new Date().getFullYear()}`;
  const searchResults = await performSearch(sentimentQuery, maxResults);
  const mentions = [];

  for (const result of searchResults) {
    if (mentions.length >= maxArticles) {
      break;
    }

    try {
      const controller = AbortSignal.timeout(12000);
      const response = await fetch(result.url, {
        headers: {
          "User-Agent": USER_AGENT
        },
        signal: controller
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch article (${response.status}).`);
      }

      const html = await response.text();
      const text = stripHtml(html).slice(0, 1500);
      if (!text) {
        throw new Error("No readable content found in article.");
      }

      const sentiment = analyzeSentiment(text);

      mentions.push({
        title: result.title,
        url: result.url,
        snippet: text.slice(0, 320),
        sentiment,
        source: result.source ?? extractHostname(result.url),
        publishedAt: result.publishedAt
      });
    } catch (error) {
      mentions.push({
        title: result.title,
        url: result.url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    toolName,
    query: sentimentQuery,
    generatedAt: new Date().toISOString(),
    totalResults: searchResults.length,
    analyzedCount: mentions.filter(mention => !mention.error).length,
    summary: summariseSentiment(mentions),
    mentions
  };
}

function registerTool(name, definition, handler) {
  tools.set(name, { definition, handler });
}

registerTool("websearch_agentic_tools", {
  name: "websearch_agentic_tools",
  description: "Search the live web for agentic coding systems and developer tooling using a configurable MCP-compatible tool.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query describing the agentic coding systems or tools to find.",
        default: DEFAULT_QUERY
      },
      maxResults: {
        type: "integer",
        description: "Maximum number of search results to retrieve (1-10).",
        minimum: 1,
        maximum: MAX_RESULTS_CAP,
        default: DEFAULT_MAX_RESULTS
      }
    }
  }
}, async args => {
  const query = typeof args?.query === "string" && args.query.trim().length > 0 ? args.query.trim() : DEFAULT_QUERY;
  const maxResults = normalizeNumber(args?.maxResults ?? args?.max_results, DEFAULT_MAX_RESULTS);
  const payload = await searchAgenticTools(query, maxResults);
  return {
    content: [
      {
        type: "json",
        json: payload
      }
    ]
  };
});

registerTool("websearch_public_sentiment", {
  name: "websearch_public_sentiment",
  description: "Scrape and summarise recent public sentiment for a given agentic tool based on live web search results.",
  input_schema: {
    type: "object",
    properties: {
      toolName: {
        type: "string",
        description: "Name of the agentic coding tool to analyse for public sentiment."
      },
      maxResults: {
        type: "integer",
        description: "Maximum number of search results to gather before scraping (1-10).",
        minimum: 1,
        maximum: MAX_RESULTS_CAP,
        default: DEFAULT_MAX_RESULTS
      },
      maxArticles: {
        type: "integer",
        description: "Maximum number of result pages to fetch and analyse for sentiment (1-5).",
        minimum: 1,
        maximum: 5,
        default: DEFAULT_MAX_ARTICLES
      }
    },
    required: ["toolName"]
  }
}, async args => {
  const toolName = typeof args?.toolName === "string" && args.toolName.trim().length > 0 ? args.toolName.trim() : null;
  if (!toolName) {
    throw new Error("toolName is required to gather public sentiment.");
  }

  const maxResults = normalizeNumber(args?.maxResults ?? args?.max_results, DEFAULT_MAX_RESULTS);
  const maxArticles = normalizeNumber(args?.maxArticles ?? args?.max_articles, DEFAULT_MAX_ARTICLES, { min: 1, max: 5 });
  const payload = await gatherPublicSentiment(toolName, maxResults, maxArticles);
  return {
    content: [
      {
        type: "json",
        json: payload
      }
    ]
  };
});

async function readBody(request) {
  return await new Promise((resolve, reject) => {
    let data = "";
    request.on("data", chunk => {
      data += chunk;
    });
    request.on("end", () => resolve(data));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  response.end(body);
}

async function handleMcpCall(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocol_version: "2024-11-05",
        server_info: SERVER_INFO,
        capabilities: {
          tools: {
            available: true
          }
        }
      }
    };
  }

  if (method === "ping") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        ok: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  if (method === "tools/list") {
    const toolDefinitions = Array.from(tools.values()).map(tool => tool.definition);
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: toolDefinitions
      }
    };
  }

  if (method === "tools/call") {
    const toolName = params?.name ?? params?.toolName;
    const args = params?.arguments ?? {};
    const tool = tools.get(toolName);
    if (!tool) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: 404,
          message: `Unknown tool: ${toolName}`
        }
      };
    }

    try {
      const result = await tool.handler(args);
      return {
        jsonrpc: "2.0",
        id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Unsupported MCP method: ${method}`
    }
  };
}

async function handleApiRequest(pathname, searchParams, response) {
  if (pathname === "/api/research/agentic-tools") {
    const queryParam = searchParams.get("query");
    const maxResultsParam = searchParams.get("maxResults") ?? searchParams.get("max_results");
    const query = queryParam && queryParam.trim().length > 0 ? queryParam.trim() : DEFAULT_QUERY;
    const maxResults = normalizeNumber(maxResultsParam, DEFAULT_MAX_RESULTS);

    try {
      const payload = await searchAgenticTools(query, maxResults);
      sendJson(response, 200, payload);
    } catch (error) {
      sendJson(response, 502, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return true;
  }

  if (pathname === "/api/research/sentiment") {
    const toolName = searchParams.get("tool") ?? searchParams.get("toolName");
    const maxResultsParam = searchParams.get("maxResults") ?? searchParams.get("max_results");
    const maxArticlesParam = searchParams.get("maxArticles") ?? searchParams.get("max_articles");

    if (!toolName) {
      sendJson(response, 400, { error: "tool query parameter is required" });
      return true;
    }

    try {
      const payload = await gatherPublicSentiment(
        toolName,
        normalizeNumber(maxResultsParam, DEFAULT_MAX_RESULTS),
        normalizeNumber(maxArticlesParam, DEFAULT_MAX_ARTICLES, { min: 1, max: 5 })
      );
      sendJson(response, 200, payload);
    } catch (error) {
      sendJson(response, 502, {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    return true;
  }

  return false;
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  const requestUrl = request.url ? new URL(request.url, `http://${request.headers.host ?? "localhost"}`) : null;
  const pathname = requestUrl?.pathname ?? "";

  if (pathname === "/health") {
    sendJson(response, 200, { status: "ok", server: SERVER_INFO });
    return;
  }

  if (pathname.startsWith("/api/")) {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed" });
      return;
    }

    const handled = await handleApiRequest(pathname, requestUrl.searchParams, response);
    if (!handled) {
      sendJson(response, 404, { error: "Not found" });
    }
    return;
  }

  if (pathname === "/mcp" && request.method === "POST") {
    try {
      const body = await readBody(request);
      const message = JSON.parse(body);
      const responsePayload = await handleMcpCall(message);
      sendJson(response, 200, responsePayload);
    } catch (error) {
      sendJson(response, 400, {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: error instanceof Error ? error.message : String(error)
        },
        id: null
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const port = Number(process.env.PORT ?? process.env.RESEARCH_AGENT_PORT ?? 4000);
  server.listen(port, () => {
    console.log(`\n${SERVER_INFO.name} running on http://localhost:${port}`);
    console.log("Registered MCP tools:");
    for (const tool of tools.values()) {
      console.log(` • ${tool.definition.name}: ${tool.definition.description}`);
    }
    console.log("\nUse POST /mcp with MCP JSON-RPC messages to interact with the server.\n");
  });
}

export { server, tools, searchAgenticTools, gatherPublicSentiment };
