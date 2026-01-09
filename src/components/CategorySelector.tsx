import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shirt, Watch, Palette, Glasses, Crown, Gem } from "lucide-react";
import { toast } from "sonner";

// Import sample product images
import blackTshirt from "@/assets/products/black-tshirt.jpg";
import redDress from "@/assets/products/red-dress.jpg";
import denimJacket from "@/assets/products/denim-jacket.jpg";
import silverWatch from "@/assets/products/silver-watch.jpg";
import leatherHandbag from "@/assets/products/leather-handbag.jpg";
import leatherBelt from "@/assets/products/leather-belt.jpg";
import silkScarf from "@/assets/products/silk-scarf.jpg";
import blackSunglasses from "@/assets/products/black-sunglasses.jpg";
import goldSmartwatch from "@/assets/products/gold-smartwatch.jpg";
import roseGoldSmartwatch from "@/assets/products/rose-gold-smartwatch.jpg";
import diamondRing from "@/assets/products/diamond-ring.jpg";
import goldNecklace from "@/assets/products/gold-necklace.jpg";
import pearlEarrings from "@/assets/products/pearl-earrings.jpg";

const categories = [
  {
    id: "clothing",
    name: "Clothing",
    icon: Shirt,
    description: "Dresses, shirts, pants, and more",
    color: "text-primary",
    bgColor: "bg-primary/10",
    sampleProducts: [
      { name: "Black T-Shirt", image: blackTshirt },
      { name: "Red Dress", image: redDress },
      { name: "Denim Jacket", image: denimJacket },
    ],
  },
  {
    id: "accessories",
    name: "Accessories", 
    icon: Watch,
    description: "Watches, jewelry, bags",
    color: "text-accent",
    bgColor: "bg-accent/10",
    sampleProducts: [
      { name: "Silver Watch", image: silverWatch },
      { name: "Leather Handbag", image: leatherHandbag },
      { name: "Leather Belt", image: leatherBelt },
    ],
  },
  {
    id: "cosmetics",
    name: "Cosmetics",
    icon: Palette,
    description: "Makeup, skincare, beauty",
    color: "text-success",
    bgColor: "bg-success/10",
    sampleProducts: [
      { name: "Silk Scarf", image: silkScarf },
      { name: "Pearl Earrings", image: pearlEarrings },
      { name: "Gold Necklace", image: goldNecklace },
    ],
  },
  {
    id: "eyewear",
    name: "Eyewear",
    icon: Glasses,
    description: "Glasses, sunglasses, contacts",
    color: "text-warning",
    bgColor: "bg-warning/10",
    sampleProducts: [
      { name: "Black Sunglasses", image: blackSunglasses },
      { name: "Black Sunglasses", image: blackSunglasses },
      { name: "Black Sunglasses", image: blackSunglasses },
    ],
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: Crown,
    description: "High-end fashion & accessories",
    color: "text-accent",
    bgColor: "bg-accent/10",
    sampleProducts: [
      { name: "Gold Smartwatch", image: goldSmartwatch },
      { name: "Rose Gold Smartwatch", image: roseGoldSmartwatch },
      { name: "Leather Handbag", image: leatherHandbag },
    ],
  },
  {
    id: "jewelry",
    name: "Jewelry",
    icon: Gem,
    description: "Rings, necklaces, earrings",
    color: "text-primary-glow",
    bgColor: "bg-primary/10",
    sampleProducts: [
      { name: "Diamond Ring", image: diamondRing },
      { name: "Gold Necklace", image: goldNecklace },
      { name: "Pearl Earrings", image: pearlEarrings },
    ],
  },
];

interface CategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  onContinueToTrial?: () => void;
}

export const CategorySelector = ({ selectedCategory, onSelectCategory, onContinueToTrial }: CategorySelectorProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleContinueToTrial = () => {
    if (!selectedCategory) {
      toast.error("Please select a category first!");
      return;
    }
    toast.success("Great choice! Let's start your virtual trial.");
    onContinueToTrial?.();
    document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select what you'd like to try on and discover how our AI technology 
            creates the perfect virtual fitting experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const isHovered = hoveredCategory === category.id;
            
            return (
              <Card 
                key={category.id}
                className={`group relative p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-card bg-gradient-card overflow-visible ${
                  isSelected 
                    ? 'border-accent shadow-accent-glow' 
                    : 'border-border hover:border-accent/50'
                }`}
                onClick={() => onSelectCategory(category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <IconComponent className={`w-8 h-8 ${category.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  
                  <Button 
                    variant={isSelected ? "glow" : "ghost"} 
                    size="sm"
                    className="w-full"
                  >
                    {isSelected ? "Selected" : "Try Now"}
                  </Button>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse-glow">
                    <div className="w-2 h-2 bg-background rounded-full" />
                  </div>
                )}

                {/* Hover Preview */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 z-50 transition-all duration-300 pointer-events-none ${
                    isHovered 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 -translate-y-2'
                  }`}
                >
                  <div className="bg-card border border-border rounded-xl p-3 shadow-lg backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-2 text-center font-medium">
                      Sample Products
                    </p>
                    <div className="flex gap-2">
                      {category.sampleProducts.map((product, index) => (
                        <div 
                          key={index}
                          className="relative group/product"
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted transition-transform duration-200 hover:scale-110">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/product:opacity-100 transition-opacity whitespace-nowrap">
                            <span className="text-[10px] bg-background/90 px-1.5 py-0.5 rounded text-foreground border border-border/50">
                              {product.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="text-center mt-8">
            <Button variant="hero" size="lg" onClick={handleContinueToTrial}>
              Continue to Virtual Trial
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
