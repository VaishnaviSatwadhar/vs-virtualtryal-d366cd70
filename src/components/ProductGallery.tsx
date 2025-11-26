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

// Import product images
import blackTshirt from "@/assets/products/black-tshirt.jpg";
import denimJacket from "@/assets/products/denim-jacket.jpg";
import redDress from "@/assets/products/red-dress.jpg";
import silverWatch from "@/assets/products/silver-watch.jpg";
import goldSmartwatch from "@/assets/products/gold-smartwatch.jpg";
import whiteHoodie from "@/assets/products/white-hoodie.jpg";
import leatherHandbag from "@/assets/products/leather-handbag.jpg";
import goldNecklace from "@/assets/products/gold-necklace.jpg";
import blackSunglasses from "@/assets/products/black-sunglasses.jpg";
import leatherBelt from "@/assets/products/leather-belt.jpg";
import baseballCap from "@/assets/products/baseball-cap.jpg";
import pearlEarrings from "@/assets/products/pearl-earrings.jpg";
import silkScarf from "@/assets/products/silk-scarf.jpg";
import blueJeans from "@/assets/products/blue-jeans.jpg";
import greenJacket from "@/assets/products/green-jacket.jpg";
import diamondRing from "@/assets/products/diamond-ring.jpg";
import silverBracelet from "@/assets/products/silver-bracelet.jpg";
import yellowDress from "@/assets/products/yellow-dress.jpg";
import bluePolo from "@/assets/products/blue-polo.jpg";
import roseGoldSmartwatch from "@/assets/products/rose-gold-smartwatch.jpg";
import grayCardigan from "@/assets/products/gray-cardigan.jpg";
import crossbodyBag from "@/assets/products/crossbody-bag.jpg";

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
    name: "Classic Black T-Shirt",
    brand: "StyleCorp",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.5,
    reviews: 128,
    category: 'clothing',
    image: blackTshirt,
    colors: ["#000000", "#FFFFFF", "#FF6B6B", "#4ECDC4"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: "2", 
    name: "Premium Silver Watch",
    brand: "TechWear",
    price: 199.99,
    rating: 4.8,
    reviews: 256,
    category: 'accessories',
    image: silverWatch,
    colors: ["#C0C0C0", "#000000", "#FFD700"],
    isNew: true,
  },
  {
    id: "3",
    name: "Gold Smartwatch",
    brand: "DigitalLux",
    price: 299.99,
    rating: 4.7,
    reviews: 189,
    category: 'accessories',
    image: goldSmartwatch,
    colors: ["#FFD700", "#000000", "#C0C0C0"],
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
    image: denimJacket,
    colors: ["#1E3A8A", "#374151", "#000000"],
    sizes: ["S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: "5",
    name: "Elegant Red Dress",
    brand: "ChicStyle",
    price: 89.99,
    rating: 4.6,
    reviews: 143,
    category: 'clothing',
    image: redDress,
    colors: ["#DC2626", "#000000", "#FFFFFF"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "6",
    name: "Casual White Hoodie",
    brand: "ComfortWear",
    price: 49.99,
    rating: 4.3,
    reviews: 201,
    category: 'clothing',
    image: whiteHoodie,
    colors: ["#FFFFFF", "#000000", "#374151"],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "7",
    name: "Luxury Leather Handbag",
    brand: "LuxeBags",
    price: 149.99,
    rating: 4.9,
    reviews: 92,
    category: 'accessories',
    image: leatherHandbag,
    colors: ["#8B4513", "#000000", "#FFFFFF"],
    isNew: true,
  },
  {
    id: "8",
    name: "Gold Chain Necklace",
    brand: "JewelCraft",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 174,
    category: 'accessories',
    image: goldNecklace,
    colors: ["#FFD700", "#C0C0C0"],
    isOnSale: true,
  },
  {
    id: "9",
    name: "Classic Black Sunglasses",
    brand: "SunStyle",
    price: 59.99,
    rating: 4.4,
    reviews: 238,
    category: 'accessories',
    image: blackSunglasses,
    colors: ["#000000", "#8B4513", "#4169E1"],
  },
  {
    id: "10",
    name: "Vintage Denim Jacket",
    brand: "RetroStyle",
    price: 89.99,
    rating: 4.7,
    reviews: 156,
    category: 'clothing',
    image: denimJacket,
    colors: ["#4169E1", "#1E3A8A", "#000000"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "11",
    name: "Premium Leather Belt",
    brand: "ClassicWear",
    price: 39.99,
    rating: 4.5,
    reviews: 89,
    category: 'accessories',
    image: leatherBelt,
    colors: ["#000000", "#8B4513"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "12",
    name: "Classic Baseball Cap",
    brand: "UrbanCap",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.3,
    reviews: 267,
    category: 'accessories',
    image: baseballCap,
    colors: ["#000000", "#FFFFFF", "#1E3A8A", "#DC2626"],
    isOnSale: true,
  },
  {
    id: "13",
    name: "Pearl Drop Earrings",
    brand: "EleganceJewels",
    price: 45.99,
    rating: 4.8,
    reviews: 134,
    category: 'accessories',
    image: pearlEarrings,
    colors: ["#FFFFFF", "#FFD700"],
    isNew: true,
  },
  {
    id: "14",
    name: "Silk Pattern Scarf",
    brand: "LuxeAccessories",
    price: 32.99,
    rating: 4.6,
    reviews: 98,
    category: 'accessories',
    image: silkScarf,
    colors: ["#FF6B6B", "#4ECDC4", "#FFD700", "#9B59B6"],
  },
  {
    id: "15",
    name: "Classic Blue Jeans",
    brand: "DenimCo",
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.7,
    reviews: 312,
    category: 'clothing',
    image: blueJeans,
    colors: ["#1E3A8A", "#000000"],
    sizes: ["28", "30", "32", "34", "36"],
    isOnSale: true,
  },
  {
    id: "16",
    name: "Green Leather Jacket",
    brand: "UrbanStyle",
    price: 149.99,
    rating: 4.8,
    reviews: 87,
    category: 'clothing',
    image: greenJacket,
    colors: ["#065F46", "#000000", "#8B4513"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
  },
  {
    id: "17",
    name: "Diamond Solitaire Ring",
    brand: "LuxeJewelry",
    price: 299.99,
    rating: 4.9,
    reviews: 156,
    category: 'accessories',
    image: diamondRing,
    colors: ["#C0C0C0", "#FFD700"],
    isNew: true,
  },
  {
    id: "18",
    name: "Silver Chain Bracelet",
    brand: "EleganceJewels",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.6,
    reviews: 203,
    category: 'accessories',
    image: silverBracelet,
    colors: ["#C0C0C0", "#FFD700"],
    isOnSale: true,
  },
  {
    id: "19",
    name: "Sunny Yellow Dress",
    brand: "SummerVibes",
    price: 79.99,
    rating: 4.7,
    reviews: 142,
    category: 'clothing',
    image: yellowDress,
    colors: ["#FCD34D", "#FDE047", "#FBBF24"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "20",
    name: "Elegant Gray Cardigan",
    brand: "ComfortKnits",
    price: 129.99,
    rating: 4.8,
    reviews: 267,
    category: 'clothing',
    image: grayCardigan,
    colors: ["#6B7280", "#374151", "#E5E7EB"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "21",
    name: "Navy Blue Polo Shirt",
    brand: "ClassicPolo",
    price: 44.99,
    rating: 4.6,
    reviews: 189,
    category: 'clothing',
    image: bluePolo,
    colors: ["#1E3A8A", "#FFFFFF", "#000000"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
  },
  {
    id: "22",
    name: "Silver Watch Collection",
    brand: "TimelessElegance",
    price: 119.99,
    originalPrice: 149.99,
    rating: 4.7,
    reviews: 145,
    category: 'accessories',
    image: silverWatch,
    colors: ["#C0C0C0", "#FFD700"],
    isOnSale: true,
  },
  {
    id: "23",
    name: "Rose Gold Smartwatch",
    brand: "TechElegance",
    price: 249.99,
    rating: 4.9,
    reviews: 312,
    category: 'accessories',
    image: roseGoldSmartwatch,
    colors: ["#E0BFB8", "#000000", "#C0C0C0"],
    isNew: true,
  },
  {
    id: "24",
    name: "Premium Gray Cardigan",
    brand: "CozyKnit",
    price: 69.99,
    rating: 4.5,
    reviews: 178,
    category: 'clothing',
    image: grayCardigan,
    colors: ["#6B7280", "#000000", "#FFFFFF"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "25",
    name: "Leather Crossbody Bag",
    brand: "ChicCarry",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.8,
    reviews: 223,
    category: 'accessories',
    image: crossbodyBag,
    colors: ["#8B4513", "#000000", "#DC2626"],
    isOnSale: true,
  },
];

const categoryIcons = {
  clothing: Shirt,
  accessories: Watch,
  cosmetics: Palette,
};

interface ProductGalleryProps {
  selectedCategory?: string;
  onProductTryOn?: (productName: string, productImage: string) => void;
}

export const ProductGallery = ({ selectedCategory, onProductTryOn }: ProductGalleryProps) => {
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

  const handleTryOn = (product: Product) => {
    toast.success(`Starting virtual try-on for ${product.name}`);
    if (onProductTryOn) {
      onProductTryOn(product.name, product.image);
    }
  };

  const handleAddToCart = (productId: string, productName: string) => {
    setCart(prev => [...prev, productId]);
    toast.success(`${productName} added to cart!`);
  };

  const handleBuyNow = (product: Product) => {
    toast.success(`Proceeding to checkout for ${product.name}`);
    // Navigate to checkout page
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
                {typeof product.image === 'string' && product.image.startsWith('http') ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                )}
                
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
                  <Button variant="glow" size="sm" onClick={() => handleTryOn(product)}>
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
                <div className="space-y-3">
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
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="hero" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBuyNow(product)}
                    >
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddToCart(product.id, product.name)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
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