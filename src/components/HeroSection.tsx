import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Database, Cpu } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 gradient-hero opacity-90" />
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-accent-foreground to-primary-foreground bg-clip-text text-transparent">
                Agentic Coding
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              Discover, track, and leverage the latest AI-powered development tools that are transforming how we build software.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Explore Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
              Submit a Tool
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center pt-8 animate-bounce-in">
            {[
              { icon: Zap, text: "AI-Powered" },
              { icon: Database, text: "Always Updated" },
              { icon: Cpu, text: "Developer-First" }
            ].map(({ icon: Icon, text }, index) => (
              <div
                key={text}
                className="flex items-center space-x-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-primary-foreground/90"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;