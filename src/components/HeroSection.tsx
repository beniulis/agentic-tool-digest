import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const HeroSection = () => {

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
    <section className="relative py-12 lg:py-16 overflow-hidden">
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
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Main Heading */}
          <div className="space-y-3 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
              AI Coding Tools
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Discover and compare AI-powered development tools
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-slide-up">
            <Button size="default" variant="secondary" className="px-6" onClick={scrollToTools}>
              Explore Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;