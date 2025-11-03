import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAgenticTools, fetchToolSentiment, type AgenticToolSearchItem, type AgenticToolSearchResponse, type SentimentResponse } from "@/lib/researchAgentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Loader2, MessageCircle, RefreshCcw, Search, TrendingUp } from "lucide-react";

const DEFAULT_QUERY = "agentic coding systems and tools";

const skeletonItems = new Array(3).fill(null);

const SentimentBadge = ({ rating }: { rating: SentimentResponse["summary"]["rating"] }) => {
  const toneMap = {
    positive: "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30",
    neutral: "text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-900/30",
    negative: "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30",
    unknown: "text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30"
  } as const;

  const labelMap = {
    positive: "Positive outlook",
    neutral: "Mixed sentiment",
    negative: "Critical feedback",
    unknown: "Not enough data"
  } as const;

  return (
    <Badge className={toneMap[rating] ?? toneMap.neutral}>
      {labelMap[rating] ?? labelMap.neutral}
    </Badge>
  );
};

const ResultCard = ({
  result,
  onSentiment,
  loading
}: {
  result: AgenticToolSearchItem;
  onSentiment: (toolName: string) => void;
  loading: boolean;
}) => (
  <Card className="h-full flex flex-col">
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-semibold leading-tight">
            {result.title}
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {result.snippet || "No description available from the search provider."}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="mt-auto space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {result.source && <Badge variant="outline">{result.source}</Badge>}
        {result.publishedAt && (
          <span>Updated {new Date(result.publishedAt).toLocaleDateString()}</span>
        )}
        {typeof result.score === "number" && (
          <span>Relevance score: {result.score.toFixed(2)}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <Globe className="mr-2 h-4 w-4" /> Visit source
          </a>
        </Button>
        <Button
          size="sm"
          onClick={() => onSentiment(result.title)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analysing...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" /> Analyse sentiment
            </>
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);

const SentimentBreakdown = ({ sentiment }: { sentiment: SentimentResponse }) => {
  const { summary, mentions } = sentiment;

  const totalMentions = mentions.filter(mention => !mention.error).length;
  const distribution = summary.distribution;

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Sentiment pulse for {sentiment.toolName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <SentimentBadge rating={summary.rating} />
          <div className="text-sm text-muted-foreground">
            Based on {totalMentions} analysed mentions ({sentiment.analyzedCount} of {sentiment.totalResults} fetched results).
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Average score</p>
            <p className="text-2xl font-semibold mt-2">
              {summary.averageNormalizedScore.toFixed(3)}
            </p>
            <p className="text-xs text-muted-foreground">(Normalized sentiment)</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Positive signals</p>
            <p className="text-2xl font-semibold mt-2">{distribution.positive}</p>
            <p className="text-xs text-muted-foreground">Occurrences in latest coverage</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium text-muted-foreground">Negative signals</p>
            <p className="text-2xl font-semibold mt-2">{distribution.negative}</p>
            <p className="text-xs text-muted-foreground">Pain points being discussed</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Recent mentions
          </h4>
          <div className="space-y-3">
            {mentions.map((mention, index) => (
              <div key={`${mention.url}-${index}`} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-primary hover:underline"
                    >
                      {mention.title}
                    </a>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {mention.source ?? "Unknown source"}
                      {mention.publishedAt && ` • ${new Date(mention.publishedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                  {mention.sentiment && (
                    <Badge variant="outline" className="capitalize">
                      {mention.sentiment.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {mention.error
                    ? `Could not analyse sentiment: ${mention.error}`
                    : mention.snippet ?? "No excerpt available."}
                </p>
                {mention.sentiment && mention.sentiment.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {mention.sentiment.highlights.slice(0, 6).map((highlight, highlightIndex) => (
                      <Badge
                        key={`${highlight.token}-${highlightIndex}`}
                        variant={highlight.polarity === "positive" ? "secondary" : "destructive"}
                      >
                        {highlight.token}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Generated at {new Date(sentiment.generatedAt).toLocaleString()}. Sentiment is estimated using keyword analysis of the fetched articles and may not reflect the complete context of each source.
        </p>
      </CardContent>
    </Card>
  );
};

const ResearchAgentSection = () => {
  const [searchTerm, setSearchTerm] = useState(DEFAULT_QUERY);
  const [inputValue, setInputValue] = useState(DEFAULT_QUERY);

  const toolsQuery = useQuery<AgenticToolSearchResponse, Error>({
    queryKey: ["research-agent-tools", searchTerm],
    queryFn: () => fetchAgenticTools(searchTerm, 6),
    enabled: Boolean(searchTerm)
  });

  const sentimentMutation = useMutation<SentimentResponse, Error, string>({
    mutationFn: toolName => fetchToolSentiment(toolName, { maxResults: 6, maxArticles: 3 })
  });

  const hasResults = Boolean(toolsQuery.data?.results.length);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }
    setSearchTerm(trimmed);
  };

  const lastUpdated = useMemo(() => {
    if (!toolsQuery.data?.fetchedAt) {
      return null;
    }
    return new Date(toolsQuery.data.fetchedAt).toLocaleString();
  }, [toolsQuery.data?.fetchedAt]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="secondary" className="uppercase tracking-wide text-xs">
            Research agent
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Real-time discovery of agentic coding systems
          </h2>
          <p className="text-muted-foreground text-lg">
            Powered by a live MCP server using the websearch tool to surface the latest agentic tools and sentiment from across the web.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-3 md:flex-row">
          <Input
            value={inputValue}
            onChange={event => setInputValue(event.target.value)}
            placeholder="Search for agentic coding tools, frameworks, or platforms"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={toolsQuery.isFetching} className="whitespace-nowrap">
              {toolsQuery.isFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> Search web
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toolsQuery.refetch()}
              disabled={toolsQuery.isFetching}
              className="whitespace-nowrap"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </form>

        {toolsQuery.isError && (
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertTitle>Unable to reach the research server</AlertTitle>
            <AlertDescription>
              {toolsQuery.error?.message ?? "An unexpected error occurred while contacting the MCP server."}
            </AlertDescription>
          </Alert>
        )}

        {toolsQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {skeletonItems.map((_, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : hasResults ? (
          <div className="space-y-10">
            <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3">
              <span>Showing {toolsQuery.data?.results.length ?? 0} live search results</span>
              {lastUpdated && <span>• Last updated {lastUpdated}</span>}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {toolsQuery.data?.results.map(result => (
                <ResultCard
                  key={result.url}
                  result={result}
                  onSentiment={toolName => sentimentMutation.mutate(toolName)}
                  loading={sentimentMutation.isPending && sentimentMutation.variables === result.title}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No search results yet. Try refining your query to something like “autonomous coding agents” or “AI IDE assistants”.
          </div>
        )}

        {sentimentMutation.isError && (
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertTitle>Sentiment analysis failed</AlertTitle>
            <AlertDescription>
              {sentimentMutation.error?.message ?? "Unable to gather public sentiment for the selected tool."}
            </AlertDescription>
          </Alert>
        )}

        {sentimentMutation.isPending && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Gathering sentiment from recent sources...
          </div>
        )}

        {sentimentMutation.data && <SentimentBreakdown sentiment={sentimentMutation.data} />}
      </div>
    </section>
  );
};

export default ResearchAgentSection;
