import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shirt, Watch, Palette, Glasses, Crown, Gem } from "lucide-react";

const categories = [
  {
    id: "clothing",
    name: "Clothing",
    icon: Shirt,
    description: "Dresses, shirts, pants, and more",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "accessories",
    name: "Accessories", 
    icon: Watch,
    description: "Watches, jewelry, bags",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "cosmetics",
    name: "Cosmetics",
    icon: Palette,
    description: "Makeup, skincare, beauty",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "eyewear",
    name: "Eyewear",
    icon: Glasses,
    description: "Glasses, sunglasses, contacts",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: Crown,
    description: "High-end fashion & accessories",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "jewelry",
    name: "Jewelry",
    icon: Gem,
    description: "Rings, necklaces, earrings",
    color: "text-primary-glow",
    bgColor: "bg-primary/10",
  },
];

interface CategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const CategorySelector = ({ selectedCategory, onSelectCategory }: CategorySelectorProps) => {
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
            
            return (
              <Card 
                key={category.id}
                className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-card ${
                  isSelected 
                    ? 'bg-gradient-card border-accent shadow-accent-glow' 
                    : 'bg-gradient-card border-border hover:border-accent/50'
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="p-6">
                  <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
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

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-pulse-glow">
                    <div className="w-2 h-2 bg-background rounded-full" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="text-center mt-8">
            <Button variant="hero" size="lg">
              Continue to Virtual Trial
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};