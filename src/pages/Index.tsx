import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { VirtualTryOnHero } from "@/components/VirtualTryOnHero";
import { CategorySelector } from "@/components/CategorySelector";
import { VirtualTryOnInterface } from "@/components/VirtualTryOnInterface";
import { ProductGallery } from "@/components/ProductGallery";
import { StyleRecommendations } from "@/components/StyleRecommendations";
import { UserMeasurementsForm } from "@/components/UserMeasurementsForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProductForTryOn, setSelectedProductForTryOn] = useState<{ name: string; image: string } | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  const handleProductTryOn = (productName: string, productImage: string) => {
    setSelectedProductForTryOn({ name: productName, image: productImage });
    setTimeout(() => {
      document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="glass" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              My Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <UserMeasurementsForm onSuccess={() => setProfileDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="glass"
          size="sm"
          onClick={signOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <VirtualTryOnHero onStartTrial={handleStartTrial} />
      <CategorySelector 
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onContinueToTrial={handleContinueToTrial}
      />
      <VirtualTryOnInterface selectedProduct={selectedProductForTryOn} />
      <ProductGallery 
        selectedCategory={selectedCategory || undefined}
        onProductTryOn={handleProductTryOn}
      />
      <StyleRecommendations />
      <Toaster />
    </div>
  );
};

export default Index;
