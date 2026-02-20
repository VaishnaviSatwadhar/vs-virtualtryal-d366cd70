import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/hooks/useWishlist";
import { 
  Heart,
  ShoppingCart, 
  Eye, 
  Star,
  Filter,
  Search,
  Shirt,
  Watch,
  Palette,
  X,
  SlidersHorizontal,
  Glasses,
  Crown,
  Gem,
  Sparkles,
  TrendingUp,
  Tag,
  ChevronRight,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutModal } from "./CheckoutModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import whiteSneakers from "@/assets/products/white-sneakers.jpg";
import blackBoots from "@/assets/products/black-boots.jpg";
import brownAnkleBoots from "@/assets/products/brown-ankle-boots.jpg";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: 'clothing' | 'accessories' | 'cosmetics' | 'eyewear' | 'luxury' | 'jewelry';
  image: string;
  colors: string[];
  sizes?: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  // Featured Products
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
    isFeatured: true,
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
    isFeatured: true,
    isTrending: true,
  },
  {
    id: "3",
    name: "Gold Smartwatch",
    brand: "DigitalLux",
    price: 299.99,
    rating: 4.7,
    reviews: 189,
    category: 'luxury',
    image: goldSmartwatch,
    colors: ["#FFD700", "#000000", "#C0C0C0"],
    isFeatured: true,
    isTrending: true,
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
    isTrending: true,
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
    price: 349.99,
    rating: 4.9,
    reviews: 92,
    category: 'luxury',
    image: leatherHandbag,
    colors: ["#8B4513", "#000000", "#FFFFFF"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "8",
    name: "Gold Chain Necklace",
    brand: "JewelCraft",
    price: 179.99,
    originalPrice: 229.99,
    rating: 4.6,
    reviews: 174,
    category: 'jewelry',
    image: goldNecklace,
    colors: ["#FFD700", "#C0C0C0"],
    isOnSale: true,
    isTrending: true,
  },
  {
    id: "9",
    name: "Classic Black Sunglasses",
    brand: "SunStyle",
    price: 59.99,
    rating: 4.4,
    reviews: 238,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#000000", "#8B4513", "#4169E1"],
    isFeatured: true,
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
    isTrending: true,
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
    price: 145.99,
    rating: 4.8,
    reviews: 134,
    category: 'jewelry',
    image: pearlEarrings,
    colors: ["#FFFFFF", "#FFD700"],
    isNew: true,
    isFeatured: true,
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
    isTrending: true,
  },
  {
    id: "17",
    name: "Diamond Solitaire Ring",
    brand: "LuxeJewelry",
    price: 499.99,
    rating: 4.9,
    reviews: 156,
    category: 'jewelry',
    image: diamondRing,
    colors: ["#C0C0C0", "#FFD700"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "18",
    name: "Silver Chain Bracelet",
    brand: "EleganceJewels",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.6,
    reviews: 203,
    category: 'jewelry',
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
    isNew: true,
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
    price: 219.99,
    originalPrice: 279.99,
    rating: 4.7,
    reviews: 145,
    category: 'luxury',
    image: silverWatch,
    colors: ["#C0C0C0", "#FFD700"],
    isOnSale: true,
  },
  {
    id: "23",
    name: "Rose Gold Smartwatch",
    brand: "TechElegance",
    price: 349.99,
    rating: 4.9,
    reviews: 312,
    category: 'luxury',
    image: roseGoldSmartwatch,
    colors: ["#E0BFB8", "#000000", "#C0C0C0"],
    isNew: true,
    isFeatured: true,
    isTrending: true,
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
    isTrending: true,
  },
  {
    id: "26",
    name: "White Running Sneakers",
    brand: "SportStyle",
    price: 129.99,
    rating: 4.7,
    reviews: 345,
    category: 'clothing',
    image: whiteSneakers,
    colors: ["#FFFFFF", "#000000", "#DC2626"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isNew: true,
  },
  {
    id: "27",
    name: "Classic Black Boots",
    brand: "UrbanWalk",
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 198,
    category: 'clothing',
    image: blackBoots,
    colors: ["#000000", "#8B4513"],
    sizes: ["6", "7", "8", "9", "10", "11"],
    isOnSale: true,
  },
  {
    id: "28",
    name: "Designer Aviator Sunglasses",
    brand: "LuxeVision",
    price: 189.99,
    rating: 4.8,
    reviews: 276,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#FFD700", "#C0C0C0", "#000000"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "29",
    name: "Luxury Diamond Bracelet",
    brand: "RoyalGems",
    price: 599.99,
    rating: 5.0,
    reviews: 89,
    category: 'luxury',
    image: silverBracelet,
    colors: ["#C0C0C0", "#FFD700"],
    isFeatured: true,
  },
  {
    id: "30",
    name: "Brown Ankle Boots",
    brand: "ClassicSteps",
    price: 139.99,
    rating: 4.5,
    reviews: 167,
    category: 'clothing',
    image: brownAnkleBoots,
    colors: ["#8B4513", "#000000"],
    sizes: ["6", "7", "8", "9", "10"],
  },
  {
    id: "31",
    name: "Sport Sunglasses",
    brand: "ActiveVision",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.4,
    reviews: 234,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#000000", "#DC2626", "#1E3A8A"],
    isOnSale: true,
  },
  {
    id: "32",
    name: "Platinum Wedding Band",
    brand: "ForeverLove",
    price: 799.99,
    rating: 4.9,
    reviews: 56,
    category: 'jewelry',
    image: diamondRing,
    colors: ["#E5E7EB", "#FFD700"],
    isFeatured: true,
  },
  {
    id: "33",
    name: "Vintage Reading Glasses",
    brand: "ClassicVision",
    price: 49.99,
    rating: 4.3,
    reviews: 189,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#8B4513", "#000000", "#FFD700"],
  },
  {
    id: "34",
    name: "Luxury Silk Tie",
    brand: "GentlemanStyle",
    price: 89.99,
    rating: 4.7,
    reviews: 123,
    category: 'luxury',
    image: silkScarf,
    colors: ["#1E3A8A", "#DC2626", "#000000"],
    isNew: true,
  },
  {
    id: "35",
    name: "Emerald Drop Earrings",
    brand: "GemStone",
    price: 349.99,
    rating: 4.8,
    reviews: 78,
    category: 'jewelry',
    image: pearlEarrings,
    colors: ["#065F46", "#FFD700"],
    isNew: true,
    isTrending: true,
  },
  // Additional Products
  {
    id: "36",
    name: "Cashmere Sweater",
    brand: "LuxeKnit",
    price: 189.99,
    rating: 4.9,
    reviews: 234,
    category: 'clothing',
    image: grayCardigan,
    colors: ["#D4C4B0", "#000000", "#FFFFFF"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "37",
    name: "Titanium Sport Watch",
    brand: "ActiveTime",
    price: 279.99,
    rating: 4.8,
    reviews: 189,
    category: 'accessories',
    image: goldSmartwatch,
    colors: ["#374151", "#000000"],
    isNew: true,
    isTrending: true,
  },
  {
    id: "38",
    name: "Designer Tote Bag",
    brand: "ChicCarry",
    price: 249.99,
    originalPrice: 329.99,
    rating: 4.7,
    reviews: 156,
    category: 'luxury',
    image: leatherHandbag,
    colors: ["#000000", "#8B4513", "#DC2626"],
    isOnSale: true,
    isFeatured: true,
  },
  {
    id: "39",
    name: "Sapphire Pendant",
    brand: "RoyalGems",
    price: 399.99,
    rating: 4.9,
    reviews: 67,
    category: 'jewelry',
    image: goldNecklace,
    colors: ["#1E40AF", "#C0C0C0"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "40",
    name: "Retro Cat Eye Glasses",
    brand: "VintageVision",
    price: 89.99,
    rating: 4.6,
    reviews: 145,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#DC2626", "#000000", "#8B4513"],
    isTrending: true,
  },
  {
    id: "41",
    name: "Linen Summer Shirt",
    brand: "BeachWear",
    price: 54.99,
    originalPrice: 74.99,
    rating: 4.5,
    reviews: 267,
    category: 'clothing',
    image: whiteHoodie,
    colors: ["#FFFFFF", "#87CEEB", "#F5DEB3"],
    sizes: ["S", "M", "L", "XL"],
    isOnSale: true,
  },
  {
    id: "42",
    name: "Canvas Backpack",
    brand: "UrbanCarry",
    price: 79.99,
    rating: 4.4,
    reviews: 312,
    category: 'accessories',
    image: crossbodyBag,
    colors: ["#374151", "#8B4513", "#000000"],
    isTrending: true,
  },
  {
    id: "43",
    name: "Crystal Drop Necklace",
    brand: "SparkleJewels",
    price: 129.99,
    rating: 4.7,
    reviews: 98,
    category: 'jewelry',
    image: goldNecklace,
    colors: ["#E5E7EB", "#FFD700"],
    isNew: true,
  },
  {
    id: "44",
    name: "Leather Loafers",
    brand: "ClassicStep",
    price: 179.99,
    rating: 4.8,
    reviews: 156,
    category: 'clothing',
    image: blackBoots,
    colors: ["#8B4513", "#000000"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    isFeatured: true,
  },
  {
    id: "45",
    name: "Smart Fitness Band",
    brand: "FitTech",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.6,
    reviews: 423,
    category: 'accessories',
    image: roseGoldSmartwatch,
    colors: ["#000000", "#DC2626", "#1E3A8A"],
    isOnSale: true,
    isTrending: true,
  },
  {
    id: "46",
    name: "Wool Blend Coat",
    brand: "WinterStyle",
    price: 249.99,
    rating: 4.9,
    reviews: 187,
    category: 'clothing',
    image: greenJacket,
    colors: ["#374151", "#000000", "#8B4513"],
    sizes: ["S", "M", "L", "XL"],
    isNew: true,
    isFeatured: true,
  },
  {
    id: "47",
    name: "Polarized Sport Shades",
    brand: "ActiveVision",
    price: 119.99,
    rating: 4.7,
    reviews: 234,
    category: 'eyewear',
    image: blackSunglasses,
    colors: ["#000000", "#1E3A8A"],
    isNew: true,
  },
  {
    id: "48",
    name: "Ruby Stud Earrings",
    brand: "GemStone",
    price: 279.99,
    originalPrice: 349.99,
    rating: 4.8,
    reviews: 89,
    category: 'jewelry',
    image: pearlEarrings,
    colors: ["#DC2626", "#FFD700"],
    isOnSale: true,
    isFeatured: true,
  },
];

const categoryIcons = {
  clothing: Shirt,
  accessories: Watch,
  cosmetics: Palette,
  eyewear: Glasses,
  luxury: Crown,
  jewelry: Gem,
};

const categoryLabels = {
  clothing: "Clothing",
  accessories: "Accessories",
  cosmetics: "Cosmetics",
  eyewear: "Eyewear",
  luxury: "Luxury",
  jewelry: "Jewelry",
};

const priceRanges = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "Over $500", min: 500, max: Infinity },
];

interface ProductGalleryProps {
  selectedCategory?: string;
  onProductTryOn?: (productName: string, productImage: string) => void;
  onAddToCart?: (product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
  }) => void;
}

// Product Card Component
const ProductCard = ({ 
  product, 
  onTryOn, 
  onAddToCart, 
  onBuyNow,
  onToggleFavorite,
  isWishlisted 
}: { 
  product: Product; 
  onTryOn: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isWishlisted: boolean;
}) => (
  <Card className="group bg-gradient-card border-border overflow-hidden hover:shadow-card hover:scale-[1.02] transition-all duration-300">
    {/* Product Image */}
    <div className="aspect-square bg-muted/20 relative overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {product.isNew && (
          <Badge className="bg-success text-success-foreground">New</Badge>
        )}
        {product.isOnSale && (
          <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
        )}
        {product.isTrending && (
          <Badge className="bg-warning text-warning-foreground">
            <Flame className="w-3 h-3 mr-1" />
            Hot
          </Badge>
        )}
      </div>

      {/* Favorite Button */}
      <Button
        variant="glass" 
        size="icon"
        className={`absolute top-3 right-3 transition-opacity ${
          isWishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={() => onToggleFavorite(product)}
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${
            isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'
          }`} 
        />
      </Button>

      {/* Try On Button */}
      <div className="absolute bottom-3 left-3 right-3">
        <Button variant="glow" size="sm" className="w-full h-7 text-xs px-2 py-0" onClick={() => onTryOn(product)}>
          <Eye className="w-3 h-3" />
          Try On
        </Button>
      </div>
    </div>

    {/* Product Info */}
    <div className="p-4">
      <div className="mb-2">
        <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center">
          <Star className="w-3 h-3 fill-warning text-warning" />
          <span className="text-xs font-medium text-foreground ml-1">
            {product.rating}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          ({product.reviews})
        </span>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1 mb-3">
        {product.colors.slice(0, 4).map((color, index) => (
          <div 
            key={index}
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: color }}
          />
        ))}
        {product.colors.length > 4 && (
          <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
        )}
      </div>

      {/* Price and Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="hero" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onBuyNow(product)}
          >
            Buy Now
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  </Card>
);

// Section Header Component
const SectionHeader = ({ 
  icon: Icon, 
  title, 
  subtitle,
  onViewAll 
}: { 
  icon: React.ElementType; 
  title: string; 
  subtitle?: string;
  onViewAll?: () => void;
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {onViewAll && (
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View All
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    )}
  </div>
);

// Horizontal Scroll Section
const HorizontalProductSection = ({ 
  products, 
  onTryOn, 
  onAddToCart, 
  onBuyNow,
  onToggleFavorite,
  isInWishlist 
}: {
  products: Product[];
  onTryOn: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  isInWishlist: (name: string) => boolean;
}) => (
  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
    {products.map((product) => (
      <div key={product.id} className="flex-shrink-0 w-64">
        <ProductCard
          product={product}
          onTryOn={onTryOn}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onToggleFavorite={onToggleFavorite}
          isWishlisted={isInWishlist(product.name)}
        />
      </div>
    ))}
  </div>
);

export const ProductGallery = ({ selectedCategory, onProductTryOn, onAddToCart }: ProductGalleryProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItemByName } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlySale, setShowOnlySale] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Filtered products based on current filters
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (selectedCategories.length > 0) {
      result = result.filter(product => selectedCategories.includes(product.category));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    if (selectedPriceRanges.length > 0) {
      result = result.filter(product => 
        selectedPriceRanges.some(rangeIndex => {
          const range = priceRanges[rangeIndex];
          return product.price >= range.min && product.price < range.max;
        })
      );
    }

    if (showOnlyNew) {
      result = result.filter(product => product.isNew);
    }
    if (showOnlySale) {
      result = result.filter(product => product.isOnSale);
    }

    return result;
  }, [selectedCategory, selectedCategories, searchQuery, selectedPriceRanges, showOnlyNew, showOnlySale]);

  // Categorized products
  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), []);
  const newArrivals = useMemo(() => products.filter(p => p.isNew), []);
  const trendingProducts = useMemo(() => products.filter(p => p.isTrending), []);
  const saleProducts = useMemo(() => products.filter(p => p.isOnSale), []);
  
  const productsByCategory = useMemo(() => ({
    clothing: products.filter(p => p.category === 'clothing'),
    accessories: products.filter(p => p.category === 'accessories'),
    jewelry: products.filter(p => p.category === 'jewelry'),
    luxury: products.filter(p => p.category === 'luxury'),
    eyewear: products.filter(p => p.category === 'eyewear'),
  }), []);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setShowOnlyNew(false);
    setShowOnlySale(false);
    setSearchQuery("");
    toast.success("Filters cleared");
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0 || showOnlyNew || showOnlySale || searchQuery.trim();

  const handleTryOn = (product: Product) => {
    toast.success(`Starting virtual try-on for ${product.name}`);
    if (onProductTryOn) {
      onProductTryOn(product.name, product.image);
    }
  };

  const handleAddToCartClick = (product: Product) => {
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
      });
    }
  };

  const handleBuyNow = (product: Product) => {
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };

  const toggleFavorite = async (product: Product) => {
    const existingItem = getWishlistItemByName(product.name);
    if (existingItem) {
      await removeFromWishlist(existingItem.id);
    } else {
      await addToWishlist(product.name, product.image, product.category);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriceRange = (index: number) => {
    setSelectedPriceRanges(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="product-gallery" className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Product Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our curated collection and try them on virtually with our AI technology.
            </p>
          </div>
          
          <div className="flex gap-3 mt-6 lg:mt-0 flex-wrap">
            <Button 
              variant={showSearch ? "glow" : "glass"} 
              size="sm" 
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4" />
              Search
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Category
                  {selectedCategories.length > 0 && (
                    <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border-border z-50">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={selectedCategories.includes(key)}
                    onCheckedChange={() => toggleCategory(key)}
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="sm">
                  <Filter className="w-4 h-4" />
                  Price
                  {selectedPriceRanges.length > 0 && (
                    <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
                      {selectedPriceRanges.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-background border-border z-50">
                <DropdownMenuLabel>Price Range</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {priceRanges.map((range, index) => (
                  <DropdownMenuCheckboxItem
                    key={index}
                    checked={selectedPriceRanges.includes(index)}
                    onCheckedChange={() => togglePriceRange(index)}
                  >
                    {range.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              All Products
            </TabsTrigger>
            <TabsTrigger value="sections" className="data-[state=active]:bg-background">
              By Section
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-background">
              By Category
            </TabsTrigger>
          </TabsList>

          {/* All Products Tab */}
          <TabsContent value="all" className="mt-6">
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onTryOn={handleTryOn}
                  onAddToCart={handleAddToCartClick}
                  onBuyNow={handleBuyNow}
                  onToggleFavorite={toggleFavorite}
                  isWishlisted={isInWishlist(product.name)}
                />
              ))}
            </div>
          </TabsContent>

          {/* By Section Tab */}
          <TabsContent value="sections" className="mt-6 space-y-12">
            {/* Featured Section */}
            <div>
              <SectionHeader 
                icon={Sparkles} 
                title="Featured Products" 
                subtitle="Our top picks just for you"
              />
              <HorizontalProductSection
                products={featuredProducts}
                onTryOn={handleTryOn}
                onAddToCart={handleAddToCartClick}
                onBuyNow={handleBuyNow}
                onToggleFavorite={toggleFavorite}
                isInWishlist={isInWishlist}
              />
            </div>

            {/* Trending Section */}
            <div>
              <SectionHeader 
                icon={TrendingUp} 
                title="Trending Now" 
                subtitle="Most popular this week"
              />
              <HorizontalProductSection
                products={trendingProducts}
                onTryOn={handleTryOn}
                onAddToCart={handleAddToCartClick}
                onBuyNow={handleBuyNow}
                onToggleFavorite={toggleFavorite}
                isInWishlist={isInWishlist}
              />
            </div>

            {/* New Arrivals Section */}
            <div>
              <SectionHeader 
                icon={Sparkles} 
                title="New Arrivals" 
                subtitle="Fresh styles just dropped"
              />
              <HorizontalProductSection
                products={newArrivals}
                onTryOn={handleTryOn}
                onAddToCart={handleAddToCartClick}
                onBuyNow={handleBuyNow}
                onToggleFavorite={toggleFavorite}
                isInWishlist={isInWishlist}
              />
            </div>

            {/* On Sale Section */}
            <div>
              <SectionHeader 
                icon={Tag} 
                title="On Sale" 
                subtitle="Great deals you don't want to miss"
              />
              <HorizontalProductSection
                products={saleProducts}
                onTryOn={handleTryOn}
                onAddToCart={handleAddToCartClick}
                onBuyNow={handleBuyNow}
                onToggleFavorite={toggleFavorite}
                isInWishlist={isInWishlist}
              />
            </div>
          </TabsContent>

          {/* By Category Tab */}
          <TabsContent value="categories" className="mt-6 space-y-12">
            {/* Clothing */}
            <div>
              <SectionHeader 
                icon={Shirt} 
                title="Clothing" 
                subtitle={`${productsByCategory.clothing.length} items`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory.clothing.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onTryOn={handleTryOn}
                    onAddToCart={handleAddToCartClick}
                    onBuyNow={handleBuyNow}
                    onToggleFavorite={toggleFavorite}
                    isWishlisted={isInWishlist(product.name)}
                  />
                ))}
              </div>
            </div>

            {/* Accessories */}
            <div>
              <SectionHeader 
                icon={Watch} 
                title="Accessories" 
                subtitle={`${productsByCategory.accessories.length} items`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory.accessories.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onTryOn={handleTryOn}
                    onAddToCart={handleAddToCartClick}
                    onBuyNow={handleBuyNow}
                    onToggleFavorite={toggleFavorite}
                    isWishlisted={isInWishlist(product.name)}
                  />
                ))}
              </div>
            </div>

            {/* Jewelry */}
            <div>
              <SectionHeader 
                icon={Gem} 
                title="Jewelry" 
                subtitle={`${productsByCategory.jewelry.length} items`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory.jewelry.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onTryOn={handleTryOn}
                    onAddToCart={handleAddToCartClick}
                    onBuyNow={handleBuyNow}
                    onToggleFavorite={toggleFavorite}
                    isWishlisted={isInWishlist(product.name)}
                  />
                ))}
              </div>
            </div>

            {/* Luxury */}
            <div>
              <SectionHeader 
                icon={Crown} 
                title="Luxury" 
                subtitle={`${productsByCategory.luxury.length} items`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory.luxury.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onTryOn={handleTryOn}
                    onAddToCart={handleAddToCartClick}
                    onBuyNow={handleBuyNow}
                    onToggleFavorite={toggleFavorite}
                    isWishlisted={isInWishlist(product.name)}
                  />
                ))}
              </div>
            </div>

            {/* Eyewear */}
            <div>
              <SectionHeader 
                icon={Glasses} 
                title="Eyewear" 
                subtitle={`${productsByCategory.eyewear.length} items`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory.eyewear.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onTryOn={handleTryOn}
                    onAddToCart={handleAddToCartClick}
                    onBuyNow={handleBuyNow}
                    onToggleFavorite={toggleFavorite}
                    isWishlisted={isInWishlist(product.name)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Checkout Modal */}
        <CheckoutModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          product={checkoutProduct}
        />
      </div>
    </section>
  );
};
