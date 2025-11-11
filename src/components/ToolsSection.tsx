import { useState, useEffect } from "react";
import ToolCard from "./ToolCard";
import CategoryFilter from "./CategoryFilter";
import SortControl, { SortOption } from "./SortControl";
import { fetchTools, Tool } from "@/lib/api";
import { Loader2 } from "lucide-react";

const ToolsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState<SortOption>("discoveredAt");
  const [showFullyAnalyzedOnly, setShowFullyAnalyzedOnly] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tools on mount
  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTools();
      setTools(data);
    } catch (err) {
      setError('Failed to load tools. Using fallback data.');
      console.error('Error loading tools:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh tools (called after research completes)
  const handleResearchComplete = () => {
    loadTools();
  };

  // Get unique categories
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  // Helper function to check if tool is fully analyzed (has new sentiment format with sources)
  const isFullyAnalyzed = (tool: Tool) => {
    if (!tool.communityDiscussions || tool.communityDiscussions.length === 0) return false;
    const firstDiscussion = tool.communityDiscussions[0];
    return typeof firstDiscussion === 'object' && firstDiscussion !== null && 'point' in firstDiscussion;
  };

  // Filter tools based on active category and analysis status
  let filteredTools = activeCategory === "all"
    ? tools
    : tools.filter(tool => tool.category === activeCategory);

  // Apply "fully analyzed only" filter if enabled
  if (showFullyAnalyzedOnly) {
    filteredTools = filteredTools.filter(isFullyAnalyzed);
  }

  // Sort tools based on active sort option
  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (activeSort) {
      case "stars":
        return (b.stars || 0) - (a.stars || 0);
      case "discoveredAt":
        // Most recently discovered first
        if (!a.discoveredAt) return 1;
        if (!b.discoveredAt) return -1;
        return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
      case "name":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <section id="tools-section" className="py-8 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading tools...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tools-section" className="py-8 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {error && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
            ⚠️ {error}
          </p>
        )}

        {/* Category Filter */}
        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="fully-analyzed-filter"
              checked={showFullyAnalyzedOnly}
              onChange={(e) => setShowFullyAnalyzedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="fully-analyzed-filter"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Show only fully analyzed tools with sources
            </label>
          </div>
          <SortControl
            activeSort={activeSort}
            onSortChange={setActiveSort}
          />
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sortedTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              title={tool.title}
              description={tool.description}
              category={tool.category}
              lastUpdated={tool.lastUpdated}
              stars={tool.stars}
              githubStars={tool.githubStars}
              githubUrl={tool.githubUrl}
              githubLastPushed={tool.githubLastPushed}
              githubDaysAgo={tool.githubDaysAgo}
              version={tool.version}
              url={tool.url}
              features={tool.features}
              discoveredAt={tool.discoveredAt}
              searchTimestamp={tool.searchTimestamp}
              publicSentiment={tool.publicSentiment}
              usageNiche={tool.usageNiche}
              communityDiscussions={tool.communityDiscussions}
              sentimentAnalyzedAt={tool.sentimentAnalyzedAt}
              sentimentSources={tool.sentimentSources}
              onRefresh={loadTools}
            />
          ))}
        </div>

        {/* Stats */}
        {sortedTools.length < tools.length && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {sortedTools.length} of {tools.length} tools
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToolsSection;