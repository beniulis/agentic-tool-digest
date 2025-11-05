import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Loader2, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ProgressUpdate {
  type: 'progress' | 'complete';
  message: string;
  timestamp: string;
}

interface ClaudeStatus {
  status: 'idle' | 'running' | 'completed';
  message: string;
  discovered_count?: number;
  added_count?: number;
  progress?: Array<{ message: string; timestamp: string }>;
}

interface ClaudeResearchControlsProps {
  onResearchComplete?: () => void;
}

const ClaudeResearchControls = ({ onResearchComplete }: ClaudeResearchControlsProps) => {
  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ClaudeStatus | null>(null);
  const [focusAreas, setFocusAreas] = useState("");
  const [maxTools, setMaxTools] = useState(10);
  const [progressLog, setProgressLog] = useState<ProgressUpdate[]>([]);
  const [isConnectedToStream, setIsConnectedToStream] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new progress arrives
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [progressLog]);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  // Clean up event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/research/claude/status`);
      if (!response.ok) throw new Error("Failed to check status");

      const currentStatus: ClaudeStatus = await response.json();
      setStatus(currentStatus);

      // If research was running and is now complete
      if (isResearching && currentStatus.status === "completed") {
        setIsResearching(false);
        setIsConnectedToStream(false);

        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        if (onResearchComplete) {
          onResearchComplete();
        }

        toast({
          title: "✨ Claude Research Complete!",
          description: `Discovered ${currentStatus.discovered_count} tools, added ${currentStatus.added_count} new ones.`,
        });
      }

      // Load existing progress if available
      if (currentStatus.progress && currentStatus.progress.length > 0) {
        const existingProgress: ProgressUpdate[] = currentStatus.progress.map(p => ({
          type: 'progress',
          message: p.message,
          timestamp: p.timestamp
        }));
        setProgressLog(existingProgress);
      }

    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const connectToProgressStream = () => {
    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource for SSE
    const eventSource = new EventSource(`${API_BASE_URL}/tools/research/claude/progress`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("Connected to progress stream");
      setIsConnectedToStream(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressUpdate = JSON.parse(event.data);

        setProgressLog(prev => [...prev, data]);

        // If complete, close connection
        if (data.type === 'complete') {
          eventSource.close();
          setIsConnectedToStream(false);
          checkStatus();
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setIsConnectedToStream(false);

      // Re-check status to see if research completed
      checkStatus();
    };
  };

  const handleStartResearch = async () => {
    try {
      // Clear previous progress
      setProgressLog([]);
      setIsResearching(true);

      // Parse focus areas (one per line)
      const focus_areas = focusAreas
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      // Start research
      const response = await fetch(`${API_BASE_URL}/tools/research/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus_areas: focus_areas.length > 0 ? focus_areas : undefined,
          max_tools: maxTools,
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const result = await response.json();

      toast({
        title: "🤖 Claude Agent Started",
        description: "Autonomous research in progress...",
      });

      // Connect to progress stream
      connectToProgressStream();

      // Also poll status periodically as backup
      const statusInterval = setInterval(() => {
        checkStatus();

        // Stop polling when research completes
        if (!isResearching) {
          clearInterval(statusInterval);
        }
      }, 5000);

    } catch (error) {
      setIsResearching(false);
      toast({
        title: "❌ Research Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;

    switch (status.status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return "secondary";

    switch (status.status) {
      case "running":
        return "default";
      case "completed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Claude Autonomous Research
              <Badge variant="outline" className="text-xs">
                Powered by Claude Sonnet 4.5
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Let Claude autonomously discover, validate, and analyze agentic coding tools with real web search
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Focus Areas (optional, one per line)
            </label>
            <Textarea
              placeholder="AI code editors&#10;Terminal tools&#10;Code completion"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              disabled={isResearching}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to let Claude decide what to research
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maximum Tools to Discover
              </label>
              <Input
                type="number"
                min="1"
                max="50"
                value={maxTools}
                onChange={(e) => setMaxTools(Number(e.target.value))}
                disabled={isResearching}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center gap-2">
                {status && (
                  <Badge variant={getStatusColor()} className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-xs">{status.message}</span>
                  </Badge>
                )}
                {isConnectedToStream && (
                  <Badge variant="outline" className="text-xs">
                    🔴 Live
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStartResearch}
            disabled={isResearching}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
          >
            {isResearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Start Autonomous Research
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={checkStatus}
            disabled={isResearching}
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Log */}
        {progressLog.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Agent Activity Log
              </label>
              <Badge variant="secondary" className="text-xs">
                {progressLog.length} updates
              </Badge>
            </div>

            <ScrollArea
              className="h-[300px] rounded-md border bg-muted/30 p-4"
              ref={scrollAreaRef}
            >
              <div className="space-y-2">
                {progressLog.map((update, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex-1">{update.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Results Summary */}
        {status?.status === 'completed' && status.discovered_count !== undefined && (
          <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Research Complete!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Discovered {status.discovered_count} tools, added {status.added_count} new ones to the database
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Highlight */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-3">What Makes This Special:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Autonomous Planning:</strong> Claude creates its own research strategy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Real Web Search:</strong> Uses Tavily/DuckDuckGo to find current information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Sentiment Analysis:</strong> Searches for public opinions and reviews with timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span><strong>Quality Validation:</strong> Claude validates each tool before adding it</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaudeResearchControls;
