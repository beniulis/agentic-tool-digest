import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ListChecks, Globe, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface WebSearchAction {
  id?: string;
  status?: string;
  action_type?: string;
  query?: string;
  sources?: { url: string }[];
  url?: string;
  pattern?: string;
}

interface McpCall {
  id?: string;
  server_label?: string;
  tool_name?: string;
  status?: string;
  output?: string;
  arguments?: unknown;
}

interface AgenticResearchResult {
  response_id?: string;
  topic?: string;
  search_terms: string[];
  instructions?: string;
  focus_questions?: string[];
  timestamp: string;
  summary: string;
  model?: string;
  used_tools?: {
    web_search?: boolean;
    mcp?: boolean;
  };
  actions?: {
    web_search?: WebSearchAction[];
    mcp_calls?: McpCall[];
  };
  usage?: {
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
  };
  parallel_tool_calls?: boolean;
}

const AgenticResearch = () => {
  const [topic, setTopic] = useState("");
  const [searchTermsInput, setSearchTermsInput] = useState("");
  const [instructions, setInstructions] = useState("");
  const [focusInput, setFocusInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AgenticResearchResult | null>(null);

  const { toast } = useToast();

  const parseMultilineInput = (raw: string): string[] =>
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

  const handleRunResearch = async () => {
    const searchTerms = parseMultilineInput(searchTermsInput);

    if (searchTerms.length === 0) {
      toast({
        title: "Missing search terms",
        description: "Provide at least one search term before launching research.",
        variant: "destructive",
      });
      return;
    }

    const focusQuestions = parseMultilineInput(focusInput);

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/websearch/agentic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim() || undefined,
          search_terms: searchTerms,
          instructions: instructions.trim() || undefined,
          focus_questions: focusQuestions.length > 0 ? focusQuestions : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Agentic research failed");
      }

      const data = (await response.json()) as AgenticResearchResult;
      setResult(data);

      toast({
        title: "Agentic research complete",
        description: "Summary generated using OpenAI web_search and MCP tooling.",
      });
    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = (summary: string) => {
    if (!summary) {
      return <p className="text-sm text-muted-foreground">No summary returned.</p>;
    }

    const paragraphs = summary
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0);

    return paragraphs.map((paragraph, idx) => (
      <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="flex flex-col gap-3 p-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                OpenAI Tools Researcher
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Agentic Web Search with MCP Connectors
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Launch an agentic research run that leverages the OpenAI Responses API, the native
              web_search tool, and any configured MCP servers. Provide explicit search terms and
              optional guidance to receive a curated, citation-ready briefing.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              Research Inputs
            </CardTitle>
            <CardDescription>
              Choose search terms, add context, and let the agent orchestrate the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Research topic (optional)
              </label>
              <Input
                placeholder="e.g., Enterprise adoption of agentic coding platforms"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Search terms (one per line)
              </label>
              <Textarea
                placeholder={"e.g.\nOpenAI MCP connectors roadmap\nAgentic coding tools market size"}
                value={searchTermsInput}
                onChange={(e) => setSearchTermsInput(e.target.value)}
                rows={6}
              />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Focus questions (optional, one per line)
              </label>
              <Textarea
                placeholder={"e.g.\nWhich MCP connectors cover SharePoint?\nWhat benchmarks exist for agentic IDEs?"}
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-3">
              <label className="text-sm font-medium text-muted-foreground">
                Additional instructions (optional)
              </label>
              <Textarea
                placeholder="Tone, formatting, or emphasis instructions for the analyst."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleRunResearch}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running agentic research...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run Agentic Research
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Tooling Notes
            </CardTitle>
            <CardDescription>
              Configure MCP connectors or domain filters without touching the UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This agent calls the OpenAI <code>web_search</code> tool through the Responses API
              and automatically fans out across every search term you provide. It supports parallel
              tool calls for faster aggregation.
            </p>
            <p>
              Add MCP connectors via the <code>OPENAI_MCP_SERVERS</code> environment variable
              (JSON) or <code>OPENAI_MCP_SERVERS_PATH</code> pointing to a file. The request payload
              and results will confirm whenever MCP tools were used.
            </p>
            <p>
              Restrict web domains or tweak context usage with{" "}
              <code>OPENAI_WEBSEARCH_ALLOWED_DOMAINS</code> and{" "}
              <code>OPENAI_WEBSEARCH_CONTEXT_SIZE</code>.
            </p>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="border-primary/40 shadow-lg">
          <CardHeader className="space-y-3">
            <CardTitle className="flex flex-wrap items-center gap-3">
              Agentic Research Briefing
              <div className="flex flex-wrap items-center gap-2">
                {result.used_tools?.web_search && (
                  <Badge variant="default">Web Search Activated</Badge>
                )}
                {result.used_tools?.mcp && <Badge variant="secondary">MCP Tools Used</Badge>}
              </div>
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
              {result.model && <span>Model: {result.model}</span>}
              {typeof result.parallel_tool_calls === "boolean" && (
                <span>
                  Parallel tool calls: {result.parallel_tool_calls ? "enabled" : "disabled"}
                </span>
              )}
              {result.usage?.total_tokens && <span>{result.usage.total_tokens} tokens</span>}
              <span className="text-muted-foreground/80">
                Generated at {new Date(result.timestamp).toLocaleString()}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Summary</h3>
              <div className="space-y-3 text-muted-foreground">{renderSummary(result.summary)}</div>
            </div>

            {result.actions?.web_search && result.actions.web_search.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Web Search Activity</h3>
                <div className="space-y-4">
                  {result.actions.web_search.map((action, idx) => (
                    <div key={`${action.id || idx}`} className="rounded-md border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-foreground">
                          {action.query || action.url || "Web action"}
                        </span>
                        {action.status && (
                          <Badge variant="outline" className="capitalize">
                            {action.status.toLowerCase()}
                          </Badge>
                        )}
                      </div>
                      {action.sources && action.sources.length > 0 && (
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          <p className="font-semibold uppercase tracking-wide text-[11px]">
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {action.sources.map((source, sourceIdx) => (
                              <a
                                key={`${source.url}-${sourceIdx}`}
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] hover:bg-muted"
                              >
                                <Link2 className="h-3 w-3" />
                                {source.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {action.pattern && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Pattern searched: <span className="font-mono">{action.pattern}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.actions?.mcp_calls && result.actions.mcp_calls.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">MCP Tool Calls</h3>
                <div className="space-y-4">
                  {result.actions.mcp_calls.map((call, idx) => (
                    <div key={`${call.id || idx}`} className="rounded-md border border-dashed p-4">
                      <div className="text-sm font-medium text-foreground">
                        {call.tool_name || "MCP tool"}{" "}
                        {call.server_label && (
                          <span className="text-xs text-muted-foreground">
                            ({call.server_label})
                          </span>
                        )}
                      </div>
                      {call.status && (
                        <Badge variant="outline" className="mt-2 capitalize">
                          {call.status.toLowerCase()}
                        </Badge>
                      )}
                      {call.output && (
                        <p className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap">
                          {call.output}
                        </p>
                      )}
                      {call.arguments && (
                        <pre className="mt-3 max-h-40 overflow-auto rounded-md bg-muted p-3 text-[11px] text-muted-foreground">
                          {JSON.stringify(call.arguments, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgenticResearch;
