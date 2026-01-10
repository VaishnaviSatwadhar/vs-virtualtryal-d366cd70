import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Heart, Trash2, Eye, ShoppingCart, X } from "lucide-react";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WishlistProps {
  onTryOn?: (productName: string, productImage: string) => void;
  onAddToCart?: (product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
  }) => void;
}

export const Wishlist = ({ onTryOn, onAddToCart }: WishlistProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  const handleTryOn = (item: WishlistItem) => {
    if (onTryOn) {
      onTryOn(item.product_name, item.product_image);
    }
    setIsOpen(false);
  };

  const handleRemove = async (item: WishlistItem) => {
    await removeFromWishlist(item.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2 relative">
          <Heart className="h-4 w-4" />
          Wishlist
          {wishlistItems.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
              {wishlistItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg bg-background border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Heart className="h-5 w-5 text-destructive" />
            My Wishlist
            {wishlistItems.length > 0 && (
              <Badge variant="secondary">{wishlistItems.length} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-muted-foreground text-sm">
                Start adding items you love by clicking the heart icon on products
              </p>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {wishlistItems.map((item) => (
                <Card
                  key={item.id}
                  className="bg-card/50 border-border overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {item.product_name}
                      </h4>
                      {item.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {item.category}
                        </Badge>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {item.notes}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTryOn(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
