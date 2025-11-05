import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Star, Activity, AlertTriangle, Users, MessageSquare, TrendingUp, RefreshCw, Link as LinkIcon } from "lucide-react";
import { CommunityDiscussion, SentimentSource, refreshToolSentiment } from "@/lib/api";
import { toast } from "sonner";

interface ToolCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  lastUpdated: string;
  stars?: number;  // Deprecated
  githubStars?: number;  // Real GitHub stars
  githubUrl?: string;
  githubLastPushed?: string;  // ISO timestamp of last GitHub push
  githubDaysAgo?: number;  // Days since last GitHub push
  version?: string;
  url?: string;
  features?: string[];
  discoveredAt?: string;
  searchTimestamp?: string;
  publicSentiment?: string;
  usageNiche?: string;
  communityDiscussions?: (string | CommunityDiscussion)[];
  sentimentAnalyzedAt?: string;
  sentimentSources?: SentimentSource[];
  onRefresh?: () => void;
}

const ToolCard = ({
  id,
  title,
  description,
  category,
  lastUpdated,
  stars,
  githubStars,
  githubUrl,
  githubLastPushed,
  githubDaysAgo,
  version,
  url,
  features = [],
  discoveredAt,
  searchTimestamp,
  publicSentiment,
  usageNiche,
  communityDiscussions = [],
  sentimentAnalyzedAt,
  sentimentSources = [],
  onRefresh
}: ToolCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use GitHub stars if available, otherwise fall back to stars
  const displayStars = githubStars !== undefined ? githubStars : stars;
  const isGitHubStars = githubStars !== undefined;

  // Determine project status based on GitHub activity
  // Active: < 90 days, Maintained: 90-180 days, Stale: 180-365 days, Deprecated: > 365 days
  const getProjectStatus = () => {
    if (githubDaysAgo === undefined) return null;

    if (githubDaysAgo < 90) {
      return { label: "Active", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Activity };
    } else if (githubDaysAgo < 180) {
      return { label: "Maintained", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Activity };
    } else if (githubDaysAgo < 365) {
      return { label: "Stale", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: AlertTriangle };
    } else {
      return { label: "Deprecated", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertTriangle };
    }
  };

  const projectStatus = getProjectStatus();

  // Handle sentiment refresh
  const handleRefreshSentiment = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    setIsRefreshing(true);

    try {
      const result = await refreshToolSentiment(id);
      toast.success(`Sentiment refresh started for ${title}`, {
        description: "This may take a minute. The page will update automatically when complete."
      });

      // Call parent's onRefresh if provided
      if (onRefresh) {
        setTimeout(() => onRefresh(), 30000); // Refresh after 30 seconds
      }
    } catch (error) {
      toast.error("Failed to refresh sentiment", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get sentiment badge color
  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return null;
    const lower = sentiment.toLowerCase();
    if (lower.includes("very positive")) {
      return "bg-green-500/10 text-green-600 border-green-500/20";
    } else if (lower.includes("positive")) {
      return "bg-green-500/10 text-green-600 border-green-500/20";
    } else if (lower.includes("mixed")) {
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    } else if (lower.includes("neutral")) {
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    } else if (lower.includes("negative")) {
      return "bg-red-500/10 text-red-600 border-red-500/20";
    } else if (lower.includes("not widely discussed")) {
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
    return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  };

  return (
    <>
      <Card
        className="group hover:shadow-lg transition-smooth gradient-card border animate-fade-in cursor-pointer flex flex-col"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="space-y-0 py-2 pb-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base group-hover:text-primary transition-smooth truncate">
                {title}
              </CardTitle>
              <div className="flex flex-wrap gap-1 mt-1">
                {features.slice(0, 2).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {publicSentiment && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${getSentimentColor(publicSentiment)}`}
                    title="Community sentiment analyzed - click to view details"
                  >
                    {publicSentiment}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {displayStars !== undefined && displayStars > 0 && (
                <div className="flex items-center space-x-1 text-muted-foreground" title={isGitHubStars ? "GitHub Stars" : "Estimated Stars"}>
                  <Star className={`w-4 h-4 ${isGitHubStars ? 'fill-current text-warning' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{displayStars.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <div className="flex items-center space-x-2 flex-wrap pt-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {version && (
                <Badge variant="outline" className="text-xs">
                  v{version}
                </Badge>
              )}
              {projectStatus && (
                <Badge variant="outline" className={`text-xs flex items-center gap-1 ${projectStatus.color}`}>
                  <projectStatus.icon className="w-3 h-3" />
                  {projectStatus.label}
                </Badge>
              )}
              {displayStars !== undefined && displayStars > 0 && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Star className={`w-3 h-3 ${isGitHubStars ? 'fill-current text-warning' : 'text-muted-foreground'}`} />
                  {displayStars.toLocaleString()} {isGitHubStars ? 'stars' : 'est.'}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <DialogDescription className="text-base leading-relaxed pt-2">
            {description}
          </DialogDescription>

          <div className="space-y-4 pt-4">
            {/* Features */}
            {features.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Public Sentiment Section */}
            {publicSentiment && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Public Sentiment & Community Discussion</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefreshSentiment}
                    disabled={isRefreshing}
                    className="h-8"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Sentiment Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Overall Sentiment:</span>
                    <Badge variant="outline" className={`text-xs ${getSentimentColor(publicSentiment)}`}>
                      {publicSentiment}
                    </Badge>
                  </div>

                  {/* Usage Niche */}
                  {usageNiche && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Primary Use Case</p>
                          <p className="text-sm">{usageNiche}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Community Discussions */}
                  {communityDiscussions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground">Key Discussion Points</p>
                      </div>
                      <ul className="space-y-3 ml-6">
                        {communityDiscussions.map((discussion, index) => {
                          // Handle both old format (string) and new format (object with sources)
                          const isObject = typeof discussion === 'object' && discussion !== null;
                          const point = isObject ? (discussion as CommunityDiscussion).point : discussion;
                          const sources = isObject ? (discussion as CommunityDiscussion).sources : undefined;

                          return (
                            <li key={index} className="text-sm list-disc">
                              <div className="space-y-1">
                                <p>{point}</p>
                                {sources && sources.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {sources.map((source, sourceIndex) => (
                                      <a
                                        key={sourceIndex}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <LinkIcon className="w-3 h-3" />
                                        Source {sourceIndex + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Analysis timestamp */}
                  {sentimentAnalyzedAt && (
                    <p className="text-xs text-muted-foreground italic">
                      Sentiment analyzed on {new Date(sentimentAnalyzedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No Sentiment - Add Sentiment Button */}
            {!publicSentiment && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No sentiment analysis yet</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSentiment}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Analyzing...' : 'Analyze Sentiment'}
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-4 space-y-3 text-sm">
              {githubLastPushed && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">GitHub Last Push:</span>
                  <span>{new Date(githubLastPushed).toLocaleDateString()} ({githubDaysAgo} days ago)</span>
                </div>
              )}
              {githubUrl && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">GitHub Repository:</span>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
              )}
              {discoveredAt && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Added to Database:</span>
                  <span>{new Date(discoveredAt).toLocaleDateString()}</span>
                </div>
              )}
              {searchTimestamp && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Research Session:</span>
                  <span>{new Date(searchTimestamp).toLocaleDateString()}</span>
                </div>
              )}
              {lastUpdated && !githubLastPushed && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">Tool Last Updated:</span>
                  <span>{lastUpdated}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {url && (
              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ToolCard;