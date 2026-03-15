import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Trash2,
  Eye,
  ShoppingCart,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Tag,
  Sparkles,
  Package,
} from "lucide-react";
import { useWishlist, WishlistItem } from "@/hooks/useWishlist";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc";

export const Wishlist = ({ onTryOn, onAddToCart }: WishlistProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  const categories = useMemo(() => {
    const cats = new Set(wishlistItems.map((i) => i.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [wishlistItems]);

  const filteredItems = useMemo(() => {
    let items = [...wishlistItems];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.product_name.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      items = items.filter((i) => i.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name-asc":
        items.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case "name-desc":
        items.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
    }

    return items;
  }, [wishlistItems, searchQuery, sortBy, selectedCategory]);

  const handleTryOn = (item: WishlistItem) => {
    onTryOn?.(item.product_name, item.product_image);
    setIsOpen(false);
  };

  const handleRemove = async (item: WishlistItem) => {
    await removeFromWishlist(item.id);
  };

  const handleClearAll = async () => {
    for (const item of wishlistItems) {
      await removeFromWishlist(item.id);
    }
    toast.success("Wishlist cleared");
  };

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    "name-asc": "Name A-Z",
    "name-desc": "Name Z-A",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
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
      <SheetContent className="w-full sm:max-w-lg bg-background border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Heart className="h-5 w-5 text-destructive fill-destructive" />
            My Wishlist
            {wishlistItems.length > 0 && (
              <Badge variant="secondary">{wishlistItems.length} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tap the heart icon on products you love
            </p>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Browse Products
            </Button>
          </div>
        ) : (
          <>
            {/* Search & Controls */}
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-sm"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5">
                      {sortBy.startsWith("name-desc") || sortBy === "oldest" ? (
                        <SortDesc className="h-3.5 w-3.5" />
                      ) : (
                        <SortAsc className="h-3.5 w-3.5" />
                      )}
                      <span className="text-xs hidden sm:inline">{sortLabels[sortBy]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={sortBy === key ? "bg-accent/20 text-accent" : ""}
                      >
                        {sortLabels[key]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Category filters */}
              {categories.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      !selectedCategory
                        ? "bg-accent/20 border-accent/40 text-accent"
                        : "border-border text-muted-foreground hover:border-accent/30"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selectedCategory === cat
                          ? "bg-accent/20 border-accent/40 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/30"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results count */}
            {searchQuery || selectedCategory ? (
              <p className="text-xs text-muted-foreground mt-1">
                {filteredItems.length} of {wishlistItems.length} items
              </p>
            ) : null}

            <ScrollArea className="flex-1 -mx-6 px-6 mt-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No matching items</p>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50 group hover:border-accent/30 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/20 flex-shrink-0 relative">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {item.category}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {timeAgo(item.created_at)}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1 truncate italic">
                            "{item.notes}"
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[10px] px-2 gap-1"
                            onClick={() => handleTryOn(item)}
                          >
                            <Eye className="h-3 w-3" />
                            Try On
                          </Button>
                          {onAddToCart && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-[10px] px-2 gap-1 text-accent border-accent/30 hover:bg-accent/10"
                              onClick={() => {
                                onAddToCart({
                                  id: item.id,
                                  name: item.product_name,
                                  brand: item.category || "Fashion",
                                  price: 2999,
                                  image: item.product_image,
                                });
                                toast.success(`${item.product_name} added to cart!`);
                              }}
                            >
                              <ShoppingCart className="h-3 w-3" />
                              Add to Cart
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(item)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-accent" />
                  {wishlistItems.length} saved items
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-accent" />
                  {categories.length} categories
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsOpen(false)}
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
