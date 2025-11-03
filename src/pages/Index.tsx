import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import ResearchAgentSection from "@/components/ResearchAgentSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ToolsSection />
        <ResearchAgentSection />
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/20 py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AT</span>
              </div>
              <span className="font-semibold">AgenticTools</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Curated collection of agentic coding tools for modern developers
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Updated daily</span>
              <span>•</span>
              <span>Community driven</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
