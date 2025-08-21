import { Button } from "@/components/ui/button";
import { Search, Plus, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">AT</span>
              </div>
              <span className="text-xl font-bold">AgenticTools</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search agentic tools..." 
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;