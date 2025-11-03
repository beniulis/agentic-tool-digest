import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools-section');
    if (toolsSection) {
      const targetPosition = toolsSection.offsetTop - 80;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // 1 second duration
      let start: number;

      // Easing function for smooth animation
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      };

      const animation = (currentTime: number) => {
        if (start === undefined) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    }
  };

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

          {/* Featured Project Card */}
          <div className="animate-slide-up">
            <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 max-w-2xl mx-auto mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-wide">Featured Project</span>
              </div>
              <h3 className="text-2xl font-bold text-primary-foreground mb-2">Migration Agent UI v1</h3>
              <p className="text-primary-foreground/80 mb-4">
                Comprehensive LLM-powered tooling suite for automating SOAP-to-REST migrations with multi-agent systems, batch processing, and visual analytics.
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => navigate('/agents')}
              >
                Explore Migration Agent UI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={scrollToTools}>
              Explore All Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
              Submit a Tool
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;