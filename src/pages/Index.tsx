import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { VirtualTryOnHero } from "@/components/VirtualTryOnHero";
import { CategorySelector } from "@/components/CategorySelector";
import { VirtualTryOnInterface } from "@/components/VirtualTryOnInterface";
import { ProductGallery } from "@/components/ProductGallery";
import { StyleRecommendations } from "@/components/StyleRecommendations";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleStartTrial = () => {
    // Auto-scroll to virtual trial interface
    setTimeout(() => {
      document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleContinueToTrial = () => {
    // Additional logic when continuing from category selector
    setTimeout(() => {
      document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <VirtualTryOnHero onStartTrial={handleStartTrial} />
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onContinueToTrial={handleContinueToTrial}
      />
      <VirtualTryOnInterface />
      <ProductGallery selectedCategory={selectedCategory || undefined} />
      <StyleRecommendations />
      <Toaster />
    </div>
  );
};

export default Index;
