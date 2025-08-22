import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Zap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-virtual-tryon.jpg";

export const VirtualTryOnHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-30">
        <img 
          src={heroImage} 
          alt="Virtual Try-On Experience" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero/80" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-pulse-glow opacity-60" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-accent rounded-full animate-float opacity-40" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-success rounded-full animate-pulse opacity-80" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-warning rounded-full animate-float opacity-50" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-md border border-accent/30 rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI-Powered Virtual Trials</span>
          <Zap className="w-4 h-4 text-warning animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary-glow to-accent bg-clip-text text-transparent mb-6 animate-float">
          Try Before You Buy
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-8">
          Experience the future of shopping with{" "}
          <span className="text-accent font-bold">Smart Virtual Trials</span>
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Use cutting-edge AI and AR technology to try clothes, accessories, and cosmetics 
          virtually. Get personalized fit recommendations and style suggestions in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="xl" 
            className="group"
          >
            <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Start Virtual Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="glass" 
            size="xl"
            className="group"
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            See How It Works
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">2M+</div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-success mb-2">50K+</div>
            <div className="text-sm text-muted-foreground">Products</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};