import { Button } from "@/components/ui/button";
import { Camera, Sparkles, Zap, ArrowRight, Upload, ShoppingBag, Download, Star, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-virtual-tryon.jpg";
import { useState } from "react";

interface VirtualTryOnHeroProps {
  onStartTrial?: () => void;
}

export const VirtualTryOnHero = ({ onStartTrial }: VirtualTryOnHeroProps) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleStartTrial = () => {
    toast.success("Starting virtual trial experience...");
    onStartTrial?.();
    document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleSeeHowItWorks = () => {
    setShowHowItWorks(!showHowItWorks);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={heroImage} 
          alt="Virtual Try-On Experience" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero/80" />
      </div>

      {/* Animated Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-[60%] right-[5%] w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[10%] left-[30%] w-48 h-48 bg-success/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary rounded-full animate-pulse-glow opacity-60" />
        <div className="absolute top-40 right-32 w-3 h-3 bg-accent rounded-full animate-float opacity-40" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-success rounded-full animate-pulse opacity-80" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-warning rounded-full animate-float opacity-50" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-card/30 backdrop-blur-xl border border-accent/20 rounded-full px-5 py-2.5 mb-8 shadow-[0_0_20px_hsl(var(--accent)/0.15)]">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-foreground uppercase">AI-Based Virtual Try-On</span>
          <Zap className="w-4 h-4 text-warning animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-4">
          <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-float drop-shadow-lg">
            Try Before
          </span>
          <br />
          <span className="bg-gradient-to-r from-accent via-primary-glow to-foreground bg-clip-text text-transparent">
            You Buy
          </span>
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium text-muted-foreground mb-8 tracking-wide">
          Experience the future of shopping with{" "}
          <span className="relative inline-block">
            <span className="text-accent font-bold">Smart Virtual Trials</span>
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </span>
        </h2>

        {/* Description */}
        <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
          Use cutting-edge AI and AR technology to try clothes, accessories, and cosmetics 
          virtually. Get personalized fit recommendations and style suggestions in real-time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="hero" 
            size="xl" 
            className="group shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] transition-all duration-300"
            onClick={handleStartTrial}
          >
            <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Start Virtual Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="glass" 
            size="xl"
            className="group"
            onClick={handleSeeHowItWorks}
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {showHowItWorks ? "Hide Steps" : "See How It Works"}
          </Button>
        </div>

        {/* How It Works Steps */}
        {showHowItWorks && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-bold mb-2 text-foreground">1. Upload Your Photo</h4>
                <p className="text-sm text-muted-foreground">Take a photo or upload an image showing your upper body for best results</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_hsl(var(--accent)/0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-success/20 text-accent flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-bold mb-2 text-foreground">2. Select Product</h4>
                <p className="text-sm text-muted-foreground">Choose any clothing, accessory, or jewelry from our gallery to try on</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_hsl(var(--success)/0.15)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 text-success flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Download className="w-7 h-7" />
                </div>
                <h4 className="font-bold mb-2 text-foreground">3. Generate & Download</h4>
                <p className="text-sm text-muted-foreground">Our AI creates a realistic try-on image that you can save and share</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Redesigned as glass cards */}
        <div className="grid grid-cols-3 gap-4 md:gap-6 mt-16 max-w-3xl mx-auto">
          <div className="relative group p-5 md:p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <Star className="w-5 h-5 text-primary mx-auto mb-2 opacity-60" />
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-primary to-primary-glow bg-clip-text text-transparent mb-1">95%</div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium tracking-wide">Accuracy Rate</div>
            </div>
          </div>
          <div className="relative group p-5 md:p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_hsl(var(--accent)/0.2)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent" />
            <div className="relative">
              <Shield className="w-5 h-5 text-accent mx-auto mb-2 opacity-60" />
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-accent to-accent/70 bg-clip-text text-transparent mb-1">2M+</div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium tracking-wide">Happy Users</div>
            </div>
          </div>
          <div className="relative group p-5 md:p-6 rounded-2xl bg-card/40 backdrop-blur-xl border border-success/20 hover:border-success/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_hsl(var(--success)/0.2)]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success/5 to-transparent" />
            <div className="relative">
              <TrendingUp className="w-5 h-5 text-success mx-auto mb-2 opacity-60" />
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-success to-success/70 bg-clip-text text-transparent mb-1">50K+</div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium tracking-wide">Products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex justify-center backdrop-blur-sm">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-hero">
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
          <span className="text-sm font-medium text-foreground">AI-Based Virtual Try-On</span>
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
            onClick={handleStartTrial}
          >
            <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Start Virtual Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="glass" 
            size="xl"
            className="group"
            onClick={handleSeeHowItWorks}
          >
            <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {showHowItWorks ? "Hide Steps" : "See How It Works"}
          </Button>
        </div>

        {/* How It Works Steps */}
        {showHowItWorks && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">1. Upload Your Photo</h4>
                <p className="text-sm text-muted-foreground">Take a photo or upload an image showing your upper body for best results</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">2. Select Product</h4>
                <p className="text-sm text-muted-foreground">Choose any clothing, accessory, or jewelry from our gallery to try on</p>
              </div>
              
              <div className="text-center p-6 rounded-xl bg-card/80 backdrop-blur-sm border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">3. Generate & Download</h4>
                <p className="text-sm text-muted-foreground">Our AI creates a realistic try-on image that you can save and share</p>
              </div>
            </div>
          </div>
        )}

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