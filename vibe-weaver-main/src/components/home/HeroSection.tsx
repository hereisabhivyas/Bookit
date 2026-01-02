import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  searchQuery: string;
  locationQuery: string;
  onSearchQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSubmit: () => void;
  onTagSelect?: (tag: string) => void;
}

const HeroSection = ({
  searchQuery,
  locationQuery,
  onSearchQueryChange,
  onLocationChange,
  onSubmit,
  onTagSelect,
}: HeroSectionProps) => {

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary) / 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Trusted by 50,000+ event lovers
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in-up stagger-1">
            <span className="text-foreground">Discover & Book</span>
            <br />
            <span className="gradient-text">Epic Experiences</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            Find the hottest events, venues, and communities. Your next unforgettable moment is just a click away ✨
          </p>

          {/* Search Bar */}
          <div className="glass-card p-3 max-w-3xl mx-auto animate-fade-in-up stagger-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Search className="w-5 h-5 text-primary/70" />
                </span>
                <Input
                  type="text"
                  placeholder="Search events, venues, or communities..."
                  className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSubmit();
                  }}
                />
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 md:w-40">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                    <MapPin className="w-5 h-5 text-primary/70" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Location"
                    className="pl-12 h-12 bg-muted/50 border-border/50 focus:border-primary"
                    value={locationQuery}
                    onChange={(e) => onLocationChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSubmit();
                    }}
                  />
                </div>
                <Button variant="gradient" size="lg" className="h-12 px-8" onClick={onSubmit}>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up stagger-4">
            <span className="text-muted-foreground text-sm">Trending:</span>
            {["🎵 Concerts", "🏀 Sports", "🎨 Art Shows", "🍔 Food Fest", "💻 Tech Meetups"].map((tag) => (
              <button
                key={tag}
                className="text-sm px-4 py-2 rounded-full bg-muted/50 text-foreground hover:bg-primary/20 hover:text-primary transition-all border border-border/50"
                onClick={() => onTagSelect?.(tag.replace(/^[^ ]+\s?/, ""))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
