import { useState } from "react";
import ToolCard from "./ToolCard";
import CategoryFilter from "./CategoryFilter";

// Sample data - will be replaced with real data from PDF content
const sampleTools = [
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
  {
    id: 4,
    title: "CodeT5+",
    description: "Open-source large language models for code understanding and generation.",
    category: "Language Models",
    lastUpdated: "1 month ago",
    stars: 2100,
    version: "0.1.0",
    url: "https://github.com/salesforce/CodeT5",
    features: ["Code Understanding", "Open Source", "Multiple Tasks"]
  },
  {
    id: 5,
    title: "Tabnine",
    description: "AI assistant for software development that provides code completions based on your code patterns.",
    category: "Code Completion",
    lastUpdated: "1 week ago",
    stars: 12000,
    version: "4.4.223",
    url: "https://tabnine.com",
    features: ["Privacy First", "Team Learning", "Multiple IDEs"]
  },
  {
    id: 6,
    title: "Codeium",
    description: "Free AI-powered code acceleration toolkit. Autocomplete, chat, and search across your codebase.",
    category: "Code Completion",
    lastUpdated: "5 days ago",
    stars: 3200,
    version: "1.6.12",
    url: "https://codeium.com",
    features: ["Free Tier", "70+ Languages", "Fast Suggestions"]
  }
];

const ToolsSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Get unique categories
  const categories = Array.from(new Set(sampleTools.map(tool => tool.category)));
  
  // Filter tools based on active category
  const filteredTools = activeCategory === "all" 
    ? sampleTools 
    : sampleTools.filter(tool => tool.category === activeCategory);

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
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool, index) => (
            <div
              key={tool.id}
              style={{ 
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <ToolCard
                title={tool.title}
                description={tool.description}
                category={tool.category}
                lastUpdated={tool.lastUpdated}
                stars={tool.stars}
                version={tool.version}
                url={tool.url}
                features={tool.features}
              />
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Showing {filteredTools.length} of {sampleTools.length} tools
          </p>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;