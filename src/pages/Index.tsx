import { useState } from "react";
import { VirtualTryOnHero } from "@/components/VirtualTryOnHero";
import { CategorySelector } from "@/components/CategorySelector";
import { VirtualTryOnInterface } from "@/components/VirtualTryOnInterface";
import { ProductGallery } from "@/components/ProductGallery";
import { StyleRecommendations } from "@/components/StyleRecommendations";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <VirtualTryOnHero />
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <VirtualTryOnInterface />
      <ProductGallery selectedCategory={selectedCategory || undefined} />
      <StyleRecommendations />
    </div>
  );
};

export default Index;
