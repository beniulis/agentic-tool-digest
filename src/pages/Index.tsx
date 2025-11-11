import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import ClaudeResearchControls from "@/components/ClaudeResearchControls";
import SoapMigrationGuide from "@/components/SoapMigrationGuide";
import { Toaster } from "@/components/ui/toaster";
import { Bot, Code2, ChevronDown } from "lucide-react";

const Index = () => {
  const [showResearch, setShowResearch] = useState(false);
  const [showSoap, setShowSoap] = useState(false);

  const handleResearchComplete = () => {
    setShowResearch(false);
    // Optionally scroll to tools section
    setTimeout(() => {
      const toolsSection = document.getElementById('tools-section');
      if (toolsSection) {
        toolsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />

        {/* Expandable Sections */}
        <section className="py-6 border-b bg-muted/10">
          <div className="container mx-auto px-4 lg:px-8 space-y-3">
            {/* Tool Discovery */}
            <div className="border rounded-lg bg-background">
              <button
                onClick={() => {
                  setShowResearch(!showResearch);
                  if (showSoap && !showResearch) setShowSoap(false);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">Tool Discovery</h3>
                    <p className="text-xs text-muted-foreground">
                      Launch Claude agent to discover and analyze new AI coding tools
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${showResearch ? 'rotate-180' : ''}`}
                />
              </button>

              {showResearch && (
                <div className="border-t p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <ClaudeResearchControls onResearchComplete={handleResearchComplete} />
                </div>
              )}
            </div>

            {/* SOAP Migration */}
            <div className="border rounded-lg bg-background">
              <button
                onClick={() => {
                  setShowSoap(!showSoap);
                  if (showResearch && !showSoap) setShowResearch(false);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <h3 className="font-semibold">SOAP Migration</h3>
                    <p className="text-xs text-muted-foreground">
                      Learn about SOAP to REST API migration with AI agents
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${showSoap ? 'rotate-180' : ''}`}
                />
              </button>

              {showSoap && (
                <div className="border-t p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SoapMigrationGuide />
                </div>
              )}
            </div>
          </div>
        </section>

        <ToolsSection />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 gradient-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AT</span>
            </div>
            <span className="font-semibold">AgenticTools</span>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Index;
