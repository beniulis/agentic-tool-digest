/**
 * API client for Agentic Tool Research backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SentimentSource {
  title: string;
  url: string;
}

export interface CommunityDiscussion {
  point: string;
  sources?: SentimentSource[];
}

export interface Tool {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  features: string[];
  stars?: number;  // Deprecated: use githubStars instead
  githubStars?: number;  // Real GitHub stars from API
  githubUrl?: string;  // GitHub repository URL
  githubLastPushed?: string;  // ISO timestamp of last GitHub push
  githubDaysAgo?: number;  // Days since last GitHub push
  version?: string;
  lastUpdated?: string;
  discoveredAt?: string;  // When tool was discovered by agent
  searchTimestamp?: string;  // When the research session was conducted
  publicSentiment?: string;  // Overall public sentiment
  usageNiche?: string;  // Primary usage niche/demographic
  communityDiscussions?: (string | CommunityDiscussion)[];  // Key discussion points from community (can be string for old data or object with sources)
  sentimentAnalyzedAt?: string;  // When sentiment was analyzed
  sentimentSources?: SentimentSource[];  // All source URLs from sentiment analysis
}

export interface ResearchStatus {
  status: string;
  message: string;
  discovered_count?: number;
  added_count?: number;
}

export interface ResearchRequest {
  tags?: string[];
  max_tools?: number;
  update_existing?: boolean;
}

/**
 * Fetch all tools from the database
 */
export async function fetchTools(): Promise<Tool[]> {
  try {
    console.log(`Fetching tools from: ${API_BASE_URL}/tools`);
    const response = await fetch(`${API_BASE_URL}/tools`);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} tools from API`);
    return data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    console.warn('Using fallback data instead');
    // Return fallback data if API is down
    return getFallbackTools();
  }
}

/**
 * Trigger research for new tools
 */
export async function triggerResearch(request: ResearchRequest = {}): Promise<ResearchStatus> {
  const response = await fetch(`${API_BASE_URL}/tools/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Research trigger failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get current research status
 */
export async function getResearchStatus(): Promise<ResearchStatus> {
  const response = await fetch(`${API_BASE_URL}/tools/research/status`);

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get research activity logs
 */
export async function getResearchLogs(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/tools/research/logs`);

  if (!response.ok) {
    throw new Error(`Logs fetch failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get available research tags
 */
export async function getResearchTags(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/tools/research/tags`);

  if (!response.ok) {
    throw new Error(`Tags fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tags;
}

/**
 * Refresh sentiment analysis for a specific tool
 */
export async function refreshToolSentiment(toolId: number): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/tools/${toolId}/refresh-sentiment`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Sentiment refresh failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fallback tools data (used when API is unavailable)
 */
function getFallbackTools(): Tool[] {
  return [
    {
      id: 1,
      title: "GitHub Copilot",
      description: "AI pair programmer that helps you write code faster with intelligent suggestions and autocomplete.",
      category: "Code Completion",
      lastUpdated: "2 days ago",
      stars: 50000,
      version: "1.156.0",
      url: "https://github.com/features/copilot",
      features: ["Autocomplete", "Code Generation", "Multiple Languages"]
    },
    {
      id: 2,
      title: "Cursor",
      description: "AI-first code editor designed for pair-programming with AI. Built for developers who want to build fast.",
      category: "IDE/Editor",
      lastUpdated: "1 week ago",
      stars: 15000,
      version: "0.23.7",
      url: "https://cursor.sh",
      features: ["AI Chat", "Code Generation", "Refactoring"]
    },
    {
      id: 3,
      title: "Aider",
      description: "AI pair programming in your terminal. Chat with GPT about your code and make coordinated changes.",
      category: "Terminal Tools",
      lastUpdated: "3 days ago",
      stars: 8500,
      version: "0.29.2",
      url: "https://aider.chat",
      features: ["Git Integration", "Multiple Models", "Code Refactoring"]
    },
  ];
}
