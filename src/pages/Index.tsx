import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ToolsSection from "@/components/ToolsSection";
import WebSearch from "./WebSearch";
import AgenticResearch from "./AgenticResearch";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Search, Sparkles } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tools");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />

        {/* Navigation Tabs */}
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Tools Directory
              </TabsTrigger>
              <TabsTrigger value="websearch" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                AI Web Search
              </TabsTrigger>
              <TabsTrigger value="agentic" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Agentic Researcher
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-6">
              <ToolsSection />
            </TabsContent>

            <TabsContent value="websearch" className="mt-6">
              <WebSearch />
            </TabsContent>

            <TabsContent value="agentic" className="mt-6">
              <AgenticResearch />
            </TabsContent>
          </Tabs>
        </div>
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
      <Toaster />
    </div>
  );
};

export default Index;
