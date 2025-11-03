import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { triggerResearch, getResearchStatus, getResearchTags, ResearchStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import TagSelector from "./TagSelector";

interface ResearchControlsProps {
  onResearchComplete?: () => void;
}

const ResearchControls = ({ onResearchComplete }: ResearchControlsProps) => {
  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ResearchStatus | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [maxTools, setMaxTools] = useState(10);
  const [updateExisting, setUpdateExisting] = useState(false);
  const { toast } = useToast();

  // Load available tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getResearchTags();
        setAvailableTags(tags);
        // Select first 5 tags by default
        setSelectedTags(tags.slice(0, 5));
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    loadTags();
  }, []);

  // Check research status on mount and periodically
  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      if (isResearching) {
        checkStatus();
      }
    }, 5000); // Check every 5 seconds while researching

    return () => clearInterval(interval);
  }, [isResearching]);

  const checkStatus = async () => {
    try {
      const currentStatus = await getResearchStatus();
      setStatus(currentStatus);

      // If research was running and is now complete, notify parent
      if (isResearching && currentStatus.status === "completed") {
        setIsResearching(false);
        if (onResearchComplete) {
          onResearchComplete();
        }

        toast({
          title: "Research Complete!",
          description: `Discovered ${currentStatus.discovered_count} tools, added ${currentStatus.added_count} new ones.`,
        });
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const handleStartResearch = async () => {
    try {
      setIsResearching(true);

      // Use selected tags (both predefined and custom)
      const tags = selectedTags.length > 0 ? selectedTags : undefined;

      const result = await triggerResearch({
        tags,
        max_tools: maxTools,
        update_existing: updateExisting,
      });

      setStatus(result);

      toast({
        title: "Research Started",
        description: "AI agents are discovering new tools...",
      });

      // Start polling for status
      setTimeout(checkStatus, 2000);

    } catch (error) {
      setIsResearching(false);
      toast({
        title: "Research Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;

    switch (status.status) {
      case "running":
      case "started":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "already_running":
        return <Loader2 className="h-4 w-4 animate-spin text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    if (!status) return "secondary";

    switch (status.status) {
      case "running":
      case "started":
        return "default";
      case "completed":
        return "secondary";
      case "already_running":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Left side: Icon and description */}
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Automated Tool Discovery</h3>
              <p className="text-sm text-muted-foreground">
                AI agents can research and discover new agentic coding tools automatically
              </p>
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Status badge */}
            {status && (
              <Badge variant={getStatusColor()} className="flex items-center gap-2 justify-center">
                {getStatusIcon()}
                <span className="text-xs">{status.message}</span>
              </Badge>
            )}

            {/* Trigger button */}
            <Button
              onClick={handleStartResearch}
              disabled={isResearching}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isResearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Discover New Tools
                </>
              )}
            </Button>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="icon"
              onClick={checkStatus}
              disabled={isResearching}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tag Selection (collapsible) */}
        <details className="mt-4" open>
          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-3">
            Research Tags ({selectedTags.length} selected)
          </summary>
          <div className="mt-4 space-y-4">
            <TagSelector
              availableTags={availableTags}
              selectedTags={selectedTags}
              customTags={customTags}
              onSelectedTagsChange={setSelectedTags}
              onCustomTagsChange={setCustomTags}
              disabled={isResearching}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">
                Max Tools:
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={maxTools}
                onChange={(e) => setMaxTools(Number(e.target.value))}
                className="w-24"
                disabled={isResearching}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="update-existing"
                checked={updateExisting}
                onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                disabled={isResearching}
              />
              <label
                htmlFor="update-existing"
                className="text-sm font-medium cursor-pointer"
              >
                Update existing tools with fresh data (includes sentiment analysis)
              </label>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};

export default ResearchControls;
