import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  ShoppingCart, 
  Eye, 
  Star,
  Filter,
  Search,
  Shirt,
  Watch,
  Palette
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: 'clothing' | 'accessories' | 'cosmetics';
  image: string;
  colors: string[];
  sizes?: string[];
  isNew?: boolean;
  isOnSale?: boolean;
}

const products: Product[] = [
  {
    id: "1",
    name: "Classic Cotton T-Shirt",
    brand: "StyleCorp",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.5,
    reviews: 128,
    category: 'clothing',
    image: "shirt",
    colors: ["#000000", "#FFFFFF", "#FF6B6B", "#4ECDC4"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: "2", 
    name: "Smart Fitness Watch",
    brand: "TechWear",
    price: 199.99,
    rating: 4.8,
    reviews: 256,
    category: 'accessories',
    image: "watch",
    colors: ["#000000", "#C0C0C0", "#FFD700"],
    isNew: true,
  },
  {
    id: "3",
    name: "Luxury Lipstick Set",
    brand: "BeautyLux",
    price: 45.00,
    rating: 4.6,
    reviews: 89,
    category: 'cosmetics',
    image: "cosmetics",
    colors: ["#FF6B9D", "#C44569", "#F8B500"],
  },
  {
    id: "4",
    name: "Denim Jacket",
    brand: "UrbanStyle",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.4,
    reviews: 67,
    category: 'clothing',
    image: "jacket",
    colors: ["#1E3A8A", "#374151", "#000000"],
    sizes: ["S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: "5",
    name: "Designer Sunglasses",
    brand: "LuxVision",
    price: 159.99,
    rating: 4.7,
    reviews: 143,
    category: 'accessories',
    image: "sunglasses",
    colors: ["#000000", "#8B4513", "#FFD700"],
  },
  {
    id: "6",
    name: "Foundation Palette",
    brand: "GlowCosmetics",
    price: 38.50,
    rating: 4.3,
    reviews: 201,
    category: 'cosmetics',
    image: "foundation",
    colors: ["#F5DEB3", "#DEB887", "#CD853F", "#8B4513"],
  },
];

const categoryIcons = {
  clothing: Shirt,
  accessories: Watch,
  cosmetics: Palette,
};

interface ProductGalleryProps {
  selectedCategory?: string;
}

export const ProductGallery = ({ selectedCategory }: ProductGalleryProps) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<string[]>([]);

  const handleFilter = () => {
    toast.info("Opening filter options...");
    // Open filter modal or sidebar
  };

  const handleSearch = () => {
    toast.info("Opening search...");
    // Open search modal or focus search input
  };

  const handleTryOn = (productName: string) => {
    toast.success(`Starting virtual try-on for ${productName}`);
    // Navigate to virtual try-on interface with this product
    document.querySelector('#virtual-trial-interface')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleAddToCart = (productId: string, productName: string) => {
    setCart(prev => [...prev, productId]);
    toast.success(`${productName} added to cart!`);
  };

  const handleLoadMore = () => {
    toast.info("Loading more products...");
    // Load more products from API
  };

  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getProductIcon = (category: Product['category']) => {
    const IconComponent = categoryIcons[category];
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <section id="product-gallery" className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Product Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our curated collection and try them on virtually with our AI technology.
            </p>
          </div>
          
          <div className="flex gap-4 mt-6 lg:mt-0">
            <Button variant="glass" size="sm" onClick={handleFilter}>
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="glass" size="sm" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id}
              className="group bg-gradient-card border-border overflow-hidden hover:shadow-card hover:scale-105 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="aspect-square bg-muted/20 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-accent/10">
                  {getProductIcon(product.category)}
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.isNew && (
                    <Badge className="bg-success text-success-foreground">New</Badge>
                  )}
                  {product.isOnSale && (
                    <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
                  )}
                </div>

                {/* Favorite Button */}
                <Button
                  variant="glass" 
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart 
                    className={`w-4 h-4 transition-colors ${
                      favorites.includes(product.id) ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                    }`} 
                  />
                </Button>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="glow" size="sm" onClick={() => handleTryOn(product.name)}>
                    <Eye className="w-4 h-4" />
                    Try On
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium text-foreground ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <div className="flex gap-1">
                    {product.colors.map((color, index) => (
                      <div 
                        key={index}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                {product.sizes && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">Sizes:</span>
                    <div className="flex gap-1">
                      {product.sizes.slice(0, 3).map((size, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                          {size}
                        </Badge>
                      ))}
                      {product.sizes.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{product.sizes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    variant="hero" 
                    size="sm" 
                    onClick={() => handleAddToCart(product.id, product.name)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="glass" size="lg" onClick={handleLoadMore}>
            Load More Products
          </Button>
        </div>
      </div>
    </section>
  );
};