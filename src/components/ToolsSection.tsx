import { useState, useEffect } from "react";
import ToolCard from "./ToolCard";
import CategoryFilter from "./CategoryFilter";
import SortControl, { SortOption } from "./SortControl";
import ResearchControls from "./ResearchControls";
import ClaudeResearchControls from "./ClaudeResearchControls";
import { fetchTools, Tool } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ToolsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSort, setActiveSort] = useState<SortOption>("discoveredAt");
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

  // Filter tools based on active category
  const filteredTools = activeCategory === "all"
    ? tools
    : tools.filter(tool => tool.category === activeCategory);

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
      <section id="tools-section" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg text-muted-foreground">Loading tools...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tools-section" className="py-16 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Latest Agentic Tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover cutting-edge AI-powered development tools that enhance productivity and transform your coding workflow.
          </p>
          {error && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Research Controls - Choose between Claude and OpenAI */}
        <Tabs defaultValue="claude" className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="claude">
              🤖 Claude Agent (Recommended)
            </TabsTrigger>
            <TabsTrigger value="openai">
              🔧 OpenAI Research (Legacy)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claude" className="mt-6">
            <ClaudeResearchControls onResearchComplete={handleResearchComplete} />
          </TabsContent>

          <TabsContent value="openai" className="mt-6">
            <ResearchControls onResearchComplete={handleResearchComplete} />
          </TabsContent>
        </Tabs>

        {/* Category Filter */}
        <div className="mb-4">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Sort Control */}
        <div className="mb-8">
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

        {/* View More */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Showing {sortedTools.length} of {tools.length} tools
          </p>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;