import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Heart,
  ArrowRight,
  Zap,
  Star,
  Shuffle
} from "lucide-react";
import { toast } from "sonner";

interface StyleRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  reason: string;
  products: string[];
  category: 'trending' | 'personalized' | 'seasonal' | 'occasion';
  image: string;
  likes: number;
}

const recommendations: StyleRecommendation[] = [
  {
    id: "1",
    title: "Casual Chic Ensemble",
    description: "Perfect balance of comfort and style for everyday wear",
    confidence: 95,
    reason: "Based on your body type and style preferences",
    products: ["Classic Tee", "Denim Jacket", "Sneakers"],
    category: 'personalized',
    image: "casual-chic",
    likes: 847,
  },
  {
    id: "2", 
    title: "Business Professional",
    description: "Sophisticated look for important meetings and presentations",
    confidence: 88,
    reason: "Trending among professionals in your age group",
    products: ["Blazer", "Dress Shirt", "Formal Pants"],
    category: 'trending',
    image: "business-pro",
    likes: 1203,
  },
  {
    id: "3",
    title: "Weekend Vibes",
    description: "Relaxed and comfortable style for leisure time",
    confidence: 92,
    reason: "Popular choice for weekend activities",
    products: ["Hoodie", "Joggers", "Casual Sneakers"],
    category: 'seasonal',
    image: "weekend",
    likes: 632,
  },
  {
    id: "4",
    title: "Evening Elegance",
    description: "Sophisticated attire for dinner dates and special occasions",
    confidence: 87,
    reason: "Matches your occasion preferences",
    products: ["Elegant Dress", "Heels", "Statement Jewelry"],
    category: 'occasion',
    image: "evening",
    likes: 976,
  },
];

const categoryConfig = {
  personalized: {
    icon: Sparkles,
    color: "text-accent",
    bgColor: "bg-accent/10",
    label: "Personalized"
  },
  trending: {
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10", 
    label: "Trending"
  },
  seasonal: {
    icon: Users,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Popular"
  },
  occasion: {
    icon: Star,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Occasion"
  },
};

export const StyleRecommendations = () => {
  const [likedRecommendations, setLikedRecommendations] = useState<string[]>([]);

  const handleTryStyle = (styleName: string) => {
    toast.success(`Starting virtual try-on for "${styleName}"`);
    // Navigate to virtual try-on with this style preset
    document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleLikeRecommendation = (recId: string) => {
    const isLiked = likedRecommendations.includes(recId);
    if (isLiked) {
      setLikedRecommendations(prev => prev.filter(id => id !== recId));
      toast.info("Removed from favorites");
    } else {
      setLikedRecommendations(prev => [...prev, recId]);
      toast.success("Added to favorites!");
    }
  };

  const handleShuffleStyle = (styleName: string) => {
    toast.info(`Generating variations for "${styleName}"...`);
    // Generate new variations of this style
  };

  const handleGetMoreRecommendations = () => {
    toast.success("Loading more personalized recommendations...");
    // Load more recommendations from AI
  };
  return (
    <section className="py-16 px-6 bg-gradient-hero">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-md border border-accent/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-sm font-medium text-foreground">AI-Powered Styling</span>
          </div>
          
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Style Recommendations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your preferences, body type, and current trends to suggest 
            the perfect styles just for you.
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {recommendations.map((rec) => {
            const categoryInfo = categoryConfig[rec.category];
            const IconComponent = categoryInfo.icon;
            
            return (
              <Card 
                key={rec.id}
                className="group bg-gradient-card border-border overflow-hidden hover:shadow-card hover:scale-[1.02] transition-all duration-300"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoryInfo.bgColor}`}>
                        <IconComponent className={`w-5 h-5 ${categoryInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {rec.title}
                        </h3>
                        <Badge variant="outline" className="mt-1">
                          {categoryInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        {rec.likes}
                      </div>
                    </div>
                  </div>

                  {/* Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-accent/20 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gradient-accent/30 transition-colors">
                    <div className="text-center">
                      <IconComponent className="w-12 h-12 text-accent mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{rec.image}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4">
                    {rec.description}
                  </p>

                  {/* AI Confidence */}
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm text-foreground font-medium">
                      {rec.confidence}% Match
                    </span>
                    <div className="flex-1 bg-muted/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-accent h-2 rounded-full transition-all duration-700"
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-muted/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Why this works:</strong> {rec.reason}
                    </p>
                  </div>

                  {/* Products */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-foreground mb-2">Includes:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.products.map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      variant="hero" 
                      className="flex-1 group"
                      onClick={() => handleTryStyle(rec.title)}
                    >
                      Try This Style
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button 
                      variant="glass" 
                      size="icon"
                      onClick={() => handleLikeRecommendation(rec.id)}
                    >
                      <Heart className={`w-4 h-4 ${
                        likedRecommendations.includes(rec.id) ? 'fill-destructive text-destructive' : ''
                      }`} />
                    </Button>
                    <Button 
                      variant="glass" 
                      size="icon"
                      onClick={() => handleShuffleStyle(rec.title)}
                    >
                      <Shuffle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-card border-accent/30 p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-accent animate-pulse" />
              <h3 className="text-2xl font-bold text-foreground">AI Style Intelligence</h3>
            </div>
            
            <p className="text-lg text-muted-foreground mb-6">
              Our advanced AI continuously learns from your preferences, body measurements, 
              and global fashion trends to deliver increasingly personalized recommendations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">10M+</div>
                <div className="text-sm text-muted-foreground">Style Combinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">AI Learning</div>
              </div>
            </div>
            
            <Button variant="glow" size="lg" onClick={handleGetMoreRecommendations}>
              <Sparkles className="w-5 h-5" />
              Get More Recommendations
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};