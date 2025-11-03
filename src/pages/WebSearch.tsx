import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Sparkles, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface WebSearchResult {
  query: string;
  timestamp: string;
  summary: string;
  model: string;
  used_web_search: boolean;
  usage?: {
    total_tokens: number;
  };
  error?: string;
}

interface ResearchResult {
  topic: string;
  timestamp: string;
  research: string;
  model: string;
  used_web_search: boolean;
  usage?: {
    total_tokens: number;
  };
  error?: string;
}

const WebSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<WebSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [researchTopic, setResearchTopic] = useState("");
  const [researchAspects, setResearchAspects] = useState("");
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);

  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setSearchResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/websearch/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          max_results: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResult(data);

      toast({
        title: "Search Complete",
        description: `Found results for: ${searchQuery}`,
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResearch = async () => {
    if (!researchTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a research topic",
        variant: "destructive",
      });
      return;
    }

    setResearchLoading(true);
    setResearchResult(null);

    try {
      const aspects = researchAspects
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const response = await fetch(`${API_BASE_URL}/websearch/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: researchTopic,
          aspects: aspects.length > 0 ? aspects : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResearchResult(data);

      toast({
        title: "Research Complete",
        description: `Completed research on: ${researchTopic}`,
      });
    } catch (error) {
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setResearchLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">Powered by OpenAI Web Search</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Web Search & Research
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Leverage OpenAI's native web search capabilities for real-time information gathering and comprehensive research
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Web Search
            </CardTitle>
            <CardDescription>
              Search the web and get AI-powered summaries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="e.g., latest AI coding tools 2025"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searchLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {searchLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Now
                </>
              )}
            </Button>

            {searchResult && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={searchResult.used_web_search ? "default" : "secondary"}>
                    {searchResult.used_web_search ? "Web Search Used" : "No Web Search"}
                  </Badge>
                  {searchResult.usage && (
                    <span className="text-xs text-muted-foreground">
                      {searchResult.usage.total_tokens} tokens
                    </span>
                  )}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Query: {searchResult.query}</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{searchResult.summary}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Research */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Comprehensive Research
            </CardTitle>
            <CardDescription>
              Conduct in-depth research on any topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Research topic..."
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Specific aspects to focus on (one per line)&#10;Example:&#10;Latest tools&#10;Key features&#10;Market trends"
                value={researchAspects}
                onChange={(e) => setResearchAspects(e.target.value)}
                rows={5}
              />
            </div>
            <Button
              onClick={handleResearch}
              disabled={researchLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {researchLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Research Topic
                </>
              )}
            </Button>

            {researchResult && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={researchResult.used_web_search ? "default" : "secondary"}>
                    {researchResult.used_web_search ? "Web Search Used" : "No Web Search"}
                  </Badge>
                  {researchResult.usage && (
                    <span className="text-xs text-muted-foreground">
                      {researchResult.usage.total_tokens} tokens
                    </span>
                  )}
                </div>
                <div className="p-4 bg-muted rounded-lg max-h-[500px] overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-2">Topic: {researchResult.topic}</p>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{researchResult.research}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebSearch;
