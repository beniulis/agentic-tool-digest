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
      <footer className="border-t bg-muted/20 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AT</span>
            </div>
            <span className="font-semibold">AgenticTools</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
