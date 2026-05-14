import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Download, Sparkles, Loader2, Link as LinkIcon, Plus, X, ShoppingBag, RotateCcw, Settings, Ruler, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";

// Import product images
import blackTshirt from "@/assets/products/black-tshirt.jpg";
import whiteHoodie from "@/assets/products/white-hoodie.jpg";
import denimJacket from "@/assets/products/denim-jacket.jpg";
import redDress from "@/assets/products/red-dress.jpg";
import silverWatch from "@/assets/products/silver-watch.jpg";
import goldSmartwatch from "@/assets/products/gold-smartwatch.jpg";
import leatherHandbag from "@/assets/products/leather-handbag.jpg";
import goldNecklace from "@/assets/products/gold-necklace.jpg";
import blackSunglasses from "@/assets/products/black-sunglasses.jpg";
import grayCardigan from "@/assets/products/gray-cardigan.jpg";
import crossbodyBag from "@/assets/products/crossbody-bag.jpg";
import leatherBelt from "@/assets/products/leather-belt.jpg";
import baseballCap from "@/assets/products/baseball-cap.jpg";
import pearlEarrings from "@/assets/products/pearl-earrings.jpg";
import silkScarf from "@/assets/products/silk-scarf.jpg";
import blueJeans from "@/assets/products/blue-jeans.jpg";
import greenJacket from "@/assets/products/green-jacket.jpg";
import diamondRing from "@/assets/products/diamond-ring.jpg";
import silverBracelet from "@/assets/products/silver-bracelet.jpg";
import yellowDress from "@/assets/products/yellow-dress.jpg";

interface Product {
  name: string;
  image: string;
  brand: string;
  price: number;
  // Optional: when the user picks a swatch we override the image used for try-on
  selectedColor?: string;
  originalImage?: string;
}

// Default color palette shown for any product. Order matters — first is "original".
const DEFAULT_PALETTE: { hex: string; name: string }[] = [
  { hex: "__original", name: "Original" },
  { hex: "#000000", name: "Black" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#1E3A8A", name: "Navy" },
  { hex: "#DC2626", name: "Red" },
  { hex: "#374151", name: "Charcoal" },
  { hex: "#6B7280", name: "Gray" },
  { hex: "#8B4513", name: "Brown" },
];

interface VirtualTryOnInterfaceProps {
  selectedProduct?: { name: string; image: string } | null;
}

type CameraResolution = "720p" | "1080p" | "4k";
type FacingMode = "user" | "environment";

const RESOLUTION_CONFIG: Record<CameraResolution, { width: number; height: number; label: string }> = {
  "720p": { width: 1280, height: 720, label: "HD (720p)" },
  "1080p": { width: 1920, height: 1080, label: "Full HD (1080p)" },
  "4k": { width: 3840, height: 2160, label: "4K Ultra HD" },
};

export const VirtualTryOnInterface = ({ selectedProduct: selectedProductProp }: VirtualTryOnInterfaceProps) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [tryonResult, setTryonResult] = useState<string | null>(null);
  const [resultViews, setResultViews] = useState<Record<"front" | "back" | "side", string | null>>({ front: null, back: null, side: null });
  const [activeResultView, setActiveResultView] = useState<"front" | "back" | "side">("front");
  const [generatingView, setGeneratingView] = useState<"front" | "back" | "side" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [backgroundType, setBackgroundType] = useState<string>("original");
  
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  // New camera settings state
  const [cameraResolution, setCameraResolution] = useState<CameraResolution>("1080p");
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { wishlistItems, loading: wishlistLoading } = useWishlist();

  const [productSource, setProductSource] = useState<"wishlist" | "all">("wishlist");

  // Build product list from user's wishlist
  const wishlistProducts: Product[] = wishlistItems.map((w) => ({
    name: w.product_name,
    image: w.product_image,
    brand: w.category || "Wishlist",
    price: 0,
  }));

  // All available products for try-on
  const products: Product[] = [
    // Clothing
    { name: "Black T-Shirt", image: blackTshirt, brand: "StyleCorp", price: 2499 },
    { name: "White Hoodie", image: whiteHoodie, brand: "ComfortWear", price: 4199 },
    { name: "Denim Jacket", image: denimJacket, brand: "UrbanStyle", price: 6599 },
    { name: "Red Dress", image: redDress, brand: "ChicStyle", price: 7499 },
    { name: "Blue Jeans", image: blueJeans, brand: "DenimCo", price: 4999 },
    { name: "Green Jacket", image: greenJacket, brand: "UrbanStyle", price: 12499 },
    { name: "Yellow Dress", image: yellowDress, brand: "SummerVibes", price: 6599 },
    
    // Accessories & Jewelry
    { name: "Silver Watch", image: silverWatch, brand: "TechWear", price: 16599 },
    { name: "Gold Smartwatch", image: goldSmartwatch, brand: "DigitalLux", price: 24999 },
    { name: "Gold Necklace", image: goldNecklace, brand: "JewelCraft", price: 6599 },
    { name: "Pearl Earrings", image: pearlEarrings, brand: "EleganceJewels", price: 3799 },
    { name: "Diamond Ring", image: diamondRing, brand: "LuxeJewelry", price: 24999 },
    { name: "Silver Bracelet", image: silverBracelet, brand: "EleganceJewels", price: 4199 },
    { name: "Black Sunglasses", image: blackSunglasses, brand: "SunStyle", price: 4999 },
    { name: "Baseball Cap", image: baseballCap, brand: "UrbanCap", price: 1999 },
    { name: "Silk Scarf", image: silkScarf, brand: "LuxeAccessories", price: 2699 },
    { name: "Leather Belt", image: leatherBelt, brand: "ClassicWear", price: 3299 },
    { name: "Leather Handbag", image: leatherHandbag, brand: "LuxeBags", price: 12499 },
    { name: "Gray Cardigan", image: grayCardigan, brand: "ComfortKnits", price: 10999 },
    { name: "Crossbody Bag", image: crossbodyBag, brand: "UrbanStyle", price: 5799 },
  ];

  // Auto-select product when passed from gallery
  useEffect(() => {
    if (selectedProductProp) {
      const product: Product = {
        name: selectedProductProp.name,
        image: selectedProductProp.image,
        brand: "Gallery Item",
        price: 0
      };
      setSelectedProducts((prev) =>
        prev.some((p) => p.name === product.name) ? prev : [...prev, product]
      );
      setSelectedProduct(product);
      setTryonResult(null);
      toast.success(`${selectedProductProp.name} added to your try-on!`);
    }
  }, [selectedProductProp]);

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.name === product.name);
      if (exists) {
        const next = prev.filter((p) => p.name !== product.name);
        if (selectedProduct?.name === product.name) {
          setSelectedProduct(next[0] || null);
        }
        return next;
      }
      setSelectedProduct(product);
      return [...prev, { ...product, originalImage: product.image }];
    });
    setResultViews({ front: null, back: null, side: null });
    setTryonResult(null);
  };

  // Recolor a selected product. Updates that product's image used for try-on.
  const [recoloringName, setRecoloringName] = useState<string | null>(null);
  const [rateLimitUntil, setRateLimitUntil] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Tick the cooldown countdown every second while a rate-limit is active
  useEffect(() => {
    if (!rateLimitUntil) {
      setCooldownRemaining(0);
      return;
    }
    const tick = () => {
      const ms = rateLimitUntil - Date.now();
      if (ms <= 0) {
        setRateLimitUntil(null);
        setCooldownRemaining(0);
      } else {
        setCooldownRemaining(Math.ceil(ms / 1000));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rateLimitUntil]);
  const changeProductColor = async (productName: string, hex: string) => {
    setSelectedProducts((prev) => {
      const target = prev.find((p) => p.name === productName);
      if (!target) return prev;
      // "Original" → reset to original image
      if (hex === "__original") {
        return prev.map((p) =>
          p.name === productName
            ? { ...p, image: p.originalImage || p.image, selectedColor: undefined }
            : p,
        );
      }
      return prev;
    });
    if (hex === "__original") {
      setResultViews({ front: null, back: null, side: null });
      setTryonResult(null);
      return;
    }
    const target = selectedProducts.find((p) => p.name === productName);
    if (!target) return;
    const sourceImage = target.originalImage || target.image;
    setRecoloringName(productName);
    try {
      const absUrl = sourceImage.startsWith("data:")
        ? sourceImage
        : new URL(sourceImage, window.location.origin).href;
      const { data, error } = await supabase.functions.invoke("recolor-product", {
        body: {
          productId: `tryon-${productName.toLowerCase().replace(/\s+/g, "-")}`,
          productName,
          imageUrl: absUrl,
          color: hex,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || data?.error || "Recolor failed");
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.name === productName ? { ...p, image: data.url, selectedColor: hex } : p,
        ),
      );
      setResultViews({ front: null, back: null, side: null });
      setTryonResult(null);
      toast.success(`${productName} recolored — ready to try on`);
    } catch (e: any) {
      console.error("Recolor failed", e);
      toast.error(`Could not recolor ${productName}. Please try another color.`);
    } finally {
      setRecoloringName(null);
    }
  };

  const attachStreamToVideo = useCallback((stream: MediaStream, label?: string) => {
    const tryAttach = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setIsCameraReady(true);
          toast.success(label ? `Camera ready! (${label})` : "Camera ready!");
        };
      }
    };
    // Try immediately, and also after a short delay for when the element just mounted
    tryAttach();
    requestAnimationFrame(() => requestAnimationFrame(tryAttach));
  }, []);

  const startCamera = useCallback(async (mode?: FacingMode) => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCameraReady(false);
    const currentFacingMode = mode || facingMode;
    const resolution = RESOLUTION_CONFIG[cameraResolution];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: currentFacingMode, 
          width: { ideal: resolution.width }, 
          height: { ideal: resolution.height } 
        } 
      });
      
      streamRef.current = stream;
      setShowCamera(true);
      attachStreamToVideo(stream, resolution.label);
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error("Camera access denied. Please allow camera permissions.");
      } else if (error.name === 'NotFoundError') {
        toast.error("No camera found on your device.");
      } else if (error.name === 'OverconstrainedError') {
        toast.info("Requested resolution not available, using default.");
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: currentFacingMode } 
          });
          streamRef.current = fallbackStream;
          setShowCamera(true);
          attachStreamToVideo(fallbackStream);
        } catch {
          toast.error("Failed to access camera. Please try again.");
        }
      } else {
        toast.error("Failed to access camera. Please try again.");
      }
    }
  }, [facingMode, cameraResolution, attachStreamToVideo]);

  const flipCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    setIsCameraReady(false);
    await startCamera(newMode);
    toast.success(newMode === "user" ? "Front camera" : "Rear camera");
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
    setCountdown(null);
  };

  const doCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready. Please try again.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Check if video is actually playing
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      toast.error("Video not ready. Please wait a moment.");
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (imageData && imageData !== 'data:,') {
        setUserImage(imageData);
        setTryonResult(null);
        // Stop camera inline to avoid stale closure
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setShowCamera(false);
        setIsCameraReady(false);
        setCountdown(null);
        toast.success("Photo captured! Now select a clothing item.");
      } else {
        throw new Error("Failed to capture image data");
      }
    } catch (error) {
      console.error('Capture error:', error);
      toast.error("Failed to capture photo. Please try again.");
    }
  }, []);

  const capturePhoto = () => {
    if (!isCameraReady) {
      toast.error("Camera not ready. Please wait.");
      return;
    }
    
    // Start 3 second countdown
    setCountdown(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          // Capture on next tick to ensure state is updated
          setTimeout(() => doCapture(), 50);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Attach stream to video when camera view mounts
  useEffect(() => {
    if (showCamera && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(() => {});
        setIsCameraReady(true);
      };
    }
  }, [showCamera]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setTryonResult(null);
        toast.success("Photo uploaded! Now select a clothing item.");
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImageFromUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }

    setIsLoadingUrl(true);
    try {
      // Validate URL format
      const url = new URL(imageUrl);
      
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();
      
      // Check if it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error("URL does not point to an image");
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setTryonResult(null);
        setShowUrlInput(false);
        setImageUrl("");
        toast.success("Image loaded from URL! Now select a clothing item.");
      };
      reader.readAsDataURL(blob);
    } catch (error: any) {
      console.error('URL load error:', error);
      if (error.message.includes("Failed to fetch")) {
        toast.error("Unable to load image. The URL may be blocked by CORS policy. Try uploading the image instead.");
      } else if (error.message.includes("Invalid URL")) {
        toast.error("Invalid URL format. Please enter a valid image URL.");
      } else if (error.message.includes("not point to an image")) {
        toast.error("The URL doesn't point to an image file.");
      } else {
        toast.error("Failed to load image from URL. Try uploading instead.");
      }
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const processVirtualTryOn = async () => {
    if (!userImage || selectedProducts.length === 0) {
      toast.error("Please upload/capture your photo and select at least one item!");
      return;
    }

    setIsProcessing(true);
    toast.info(`🎨 AI is fitting ${selectedProducts.length} item${selectedProducts.length > 1 ? "s" : ""} on you...`, { duration: 5000 });

    try {
      const clothingImages = await Promise.all(
        selectedProducts.map(async (p) => {
          if (typeof p.image === "string" && p.image.startsWith("data:")) return p.image;
          const r = await fetch(p.image);
          const b = await r.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(b);
          });
        })
      );
      const clothingNames = selectedProducts.map((p) => p.name);

      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          userImage,
          clothingImage: clothingImages[0],
          clothingName: clothingNames.join(", "),
          clothingImages,
          clothingNames,
          backgroundType,
          size: selectedSize,
        }
      });

      if (error) {
        // Try to read the body the edge function returned (functions.invoke wraps non-2xx)
        const ctx: any = (error as any).context;
        let serverMsg: string | undefined;
        try {
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            serverMsg = body?.error;
          } else if (ctx && typeof ctx.text === "function") {
            serverMsg = await ctx.text();
          }
        } catch { /* ignore */ }
        throw new Error(serverMsg || error.message || "Try-on request failed");
      }

      if (data?.error) {
        if (data.requiresNewImage) {
          toast.error(data.error, { duration: 6000 });
          // Clear the current image to prompt user for a new one
          setUserImage(null);
          setTryonResult(null);
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data?.image) {
        setTryonResult(data.image);
        setResultViews({ front: data.image, back: null, side: null });
        setActiveResultView("front");
        toast.success("✨ Virtual try-on complete! Looking great!", { duration: 5000 });
        toast.info("💡 Tip: Try changing the background or trying different items!", { duration: 4000 });
      } else {
        throw new Error("No image generated");
      }
    } catch (error: any) {
      console.error('Virtual try-on error:', error);
      const msg: string = error?.message || "";
      if (msg.toLowerCase().includes("rate") || msg.includes("429") || msg.toLowerCase().includes("busy")) {
        setRateLimitUntil(Date.now() + 30_000);
        toast.error("AI is rate-limited. Auto-retry available in 30s.", { duration: 5000 });
      } else if (msg.includes("credits") || msg.includes("402")) {
        toast.error("AI credits required. Please add credits to continue.", { duration: 5000 });
      } else if (msg.toLowerCase().includes("person detected")) {
        toast.error("Please upload a clearer photo with your full face and upper body visible.", { duration: 6000 });
        setUserImage(null);
        setTryonResult(null);
      } else {
        toast.error(msg || "Failed to generate try-on. Please try again.", { duration: 6000 });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const generateView = useCallback(async (view: "front" | "back" | "side") => {
    if (!userImage || selectedProducts.length === 0) return;
    if (resultViews[view]) {
      setActiveResultView(view);
      return;
    }
    setGeneratingView(view);
    setActiveResultView(view);
    try {
      const clothingImages = await Promise.all(
        selectedProducts.map(async (p) => {
          if (typeof p.image === "string" && p.image.startsWith("data:")) return p.image;
          const r = await fetch(p.image);
          const b = await r.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(b);
          });
        })
      );
      const clothingNames = selectedProducts.map((p) => p.name);
      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          userImage,
          clothingImage: clothingImages[0],
          clothingName: clothingNames.join(", "),
          clothingImages,
          clothingNames,
          backgroundType,
          view,
          size: selectedSize,
        }
      });
      if (error) throw error;
      if (data?.image) {
        setResultViews((prev) => ({ ...prev, [view]: data.image }));
        if (view === "front") setTryonResult(data.image);
      } else {
        throw new Error(data?.error || "No image returned");
      }
    } catch (e: any) {
      console.error("generateView error", e);
      toast.error(`Failed to generate ${view} view`);
    } finally {
      setGeneratingView(null);
    }
  }, [userImage, selectedProducts, backgroundType, resultViews, selectedSize]);

  const cycleView = (dir: 1 | -1) => {
    const order: Array<"front" | "side" | "back"> = ["front", "side", "back"];
    const idx = order.indexOf(activeResultView);
    const next = order[(idx + dir + order.length) % order.length];
    if (resultViews[next]) {
      setActiveResultView(next);
    } else {
      generateView(next);
    }
  };

  const downloadImage = () => {
    const current = resultViews[activeResultView] || tryonResult;
    if (!current) {
      toast.error("No image to download");
      return;
    }

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    const fileLabel = (selectedProducts[0]?.name || "tryon").replace(/\s+/g, '_');
    link.download = `tryon_${fileLabel}_${activeResultView}_${timestamp}.png`;
    link.href = current;
    link.click();
    toast.success("Image downloaded!");
  };

  return (
<section id="virtual-trial-interface" className="py-20 bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Virtual Try-On Studio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience photo-realistic virtual try-on powered by advanced AI
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Step 1: Upload Photo */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <h3 className="text-xl font-semibold">Your Photo</h3>
            </div>
            
            {!showCamera && !userImage && !showUrlInput && (
              <div className="space-y-4">
                <Button 
                  onClick={() => startCamera()}
                  className="w-full"
                  size="lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Start Camera
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setShowUrlInput(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <LinkIcon className="mr-2 h-5 w-5" />
                  Load from URL
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Best results with full-body or upper-body photos
                </p>
              </div>
            )}

            {showUrlInput && !userImage && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadImageFromUrl();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a direct link to an image file (JPG, PNG, etc.)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={loadImageFromUrl}
                    disabled={isLoadingUrl || !imageUrl.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoadingUrl ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-5 w-5" />
                        Load Image
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowUrlInput(false);
                      setImageUrl("");
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showCamera && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg bg-muted aspect-[3/4] object-cover"
                  />
                  
                  {/* Live indicator */}
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    LIVE
                  </div>
                  
                  {/* Camera controls overlay */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Button
                      onClick={flipCamera}
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      title="Flip camera"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setShowCameraSettings(!showCameraSettings)}
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      title="Camera settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                      <span className="text-7xl font-bold text-primary animate-pulse">
                        {countdown}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Camera settings panel */}
                {showCameraSettings && (
                  <div className="p-3 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resolution</span>
                      <Select
                        value={cameraResolution}
                        onValueChange={(value: CameraResolution) => {
                          setCameraResolution(value);
                          toast.info(`Resolution will apply on next camera start`);
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">HD (720p)</SelectItem>
                          <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                          <SelectItem value="4k">4K Ultra HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Camera</span>
                      <Badge variant="secondary" className="capitalize">
                        {facingMode === "user" ? "Front" : "Rear"}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground text-center">
                  Position yourself in frame and click Capture (3s countdown)
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={capturePhoto}
                    disabled={!isCameraReady || countdown !== null}
                    className="flex-1"
                    size="lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {countdown !== null ? `Capturing in ${countdown}...` : isCameraReady ? 'Capture Photo' : 'Loading...'}
                  </Button>
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {userImage && !showCamera && (
              <div className="space-y-4">
                <img 
                  src={userImage} 
                  alt="Your photo" 
                  className="w-full rounded-lg"
                />
                <Button 
                  onClick={() => {
                    setUserImage(null);
                    setTryonResult(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Change Photo
                </Button>
              </div>
            )}
          </Card>

          {/* Step 2: Select Clothing */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold">Selected Products</h3>
              </div>
              {selectedProducts.length > 0 && (
                <Badge variant="secondary">{selectedProducts.length} selected</Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Tap items to layer them on your photo (e.g. shirt + jeans + accessories).
            </p>

            {/* Source toggle: Wishlist vs All Products */}
            <div className="grid grid-cols-2 gap-2 mb-3 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setProductSource("wishlist")}
                className={`text-xs font-medium py-1.5 rounded-md transition-colors ${
                  productSource === "wishlist"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Wishlist {wishlistProducts.length > 0 && `(${wishlistProducts.length})`}
              </button>
              <button
                type="button"
                onClick={() => setProductSource("all")}
                className={`text-xs font-medium py-1.5 rounded-md transition-colors ${
                  productSource === "all"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Products ({products.length})
              </button>
            </div>

            {/* Products — tap to toggle */}
            <div className="space-y-4">
              {productSource === "wishlist" && wishlistLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
                  <p className="text-sm">Loading your wishlist…</p>
                </div>
              ) : productSource === "wishlist" && wishlistProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Your wishlist is empty</p>
                  <p className="text-xs mt-1">Add items from the Product Gallery, or switch to "All Products" above to try anything.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {(productSource === "wishlist" ? wishlistProducts : products).map((product) => {
                    const isSelected = selectedProducts.some((p) => p.name === product.name);
                    return (
                      <div
                        key={product.name}
                        className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-muted hover:border-primary/50"
                        }`}
                        onClick={() => toggleProductSelection(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                        {isSelected && (
                          <Badge className="mt-1 w-full justify-center" variant="default">
                            Selected
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4 mt-4">
              {/* Selected items: details + color swatches */}
              {selectedProducts.length > 0 && (
                <div className="space-y-3">
                  {selectedProducts.map((p) => (
                    <div
                      key={p.name}
                      className="p-3 rounded-lg border border-border/60 bg-muted/20 flex gap-3"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.brand}</p>
                            {p.price > 0 && (
                              <p className="text-xs font-medium text-primary mt-0.5">
                                ₹{p.price.toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleProductSelection(p)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Size Selector */}
              {selectedProducts.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-4 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Size</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="text-xs font-medium text-primary hover:underline">
                          Size Chart
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Size Chart (in inches)</DialogTitle>
                        </DialogHeader>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Size</TableHead>
                              <TableHead>Chest</TableHead>
                              <TableHead>Waist</TableHead>
                              <TableHead>Length</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[
                              { s: "XS", c: "34", w: "28", l: "26" },
                              { s: "S", c: "36", w: "30", l: "27" },
                              { s: "M", c: "38", w: "32", l: "28" },
                              { s: "L", c: "40", w: "34", l: "29" },
                              { s: "XL", c: "42", w: "36", l: "30" },
                              { s: "XXL", c: "44", w: "38", l: "31" },
                            ].map((r) => (
                              <TableRow key={r.s}>
                                <TableCell className="font-medium">{r.s}</TableCell>
                                <TableCell>{r.c}</TableCell>
                                <TableCell>{r.w}</TableCell>
                                <TableCell>{r.l}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <p className="text-xs text-muted-foreground mt-2">
                          Sizes are progressive: each step up adds roughly 2" of chest width and looser fit.
                        </p>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedSize(sz);
                          setResultViews({ front: null, back: null, side: null });
                          setTryonResult(null);
                        }}
                        className={`px-2 py-2 text-xs font-semibold rounded-md border transition-colors ${
                          selectedSize === sz
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:border-primary/50"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Selected size affects how loose or tight the garment appears in the result.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <Select value={backgroundType} onValueChange={setBackgroundType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Keep Original</SelectItem>
                    <SelectItem value="plain">Plain White</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                    <SelectItem value="studio">Studio Setting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={processVirtualTryOn}
                disabled={isProcessing || selectedProducts.length === 0 || !userImage || cooldownRemaining > 0}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Retry in {cooldownRemaining}s
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try On Now
                  </>
                )}
              </Button>

              {cooldownRemaining > 0 && (
                <div className="mt-2 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs flex items-start gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">
                      AI rate-limited — retry in {cooldownRemaining}s
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      Free AI tier is shared. Wait for the timer or add credits in
                      Workspace → Settings → Usage to skip the queue.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Step 3: Result */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
              <h3 className="text-xl font-semibold">Result</h3>
            </div>
            
            <div className="space-y-4">
              {!tryonResult && !isProcessing && (
                <div className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Your AI-generated try-on will appear here
                    </p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-sm font-medium mb-1">Creating your virtual try-on...</p>
                    <p className="text-xs text-muted-foreground">This may take 10-30 seconds</p>
                  </div>
                </div>
              )}

              {tryonResult && (
                <>
                  <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-muted/20">
                    {resultViews[activeResultView] ? (
                      <img
                        src={resultViews[activeResultView]!}
                        alt={`Virtual try-on ${activeResultView} view`}
                        className="w-full"
                      />
                    ) : (
                      <div className="aspect-[3/4] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground capitalize">
                            Generating {activeResultView} view…
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Rotate arrows */}
                    <Button
                      variant="glass"
                      size="icon"
                      aria-label="Previous view"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                      onClick={() => cycleView(-1)}
                      disabled={generatingView !== null}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="glass"
                      size="icon"
                      aria-label="Next view"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full shadow-lg"
                      onClick={() => cycleView(1)}
                      disabled={generatingView !== null}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>

                    {/* View label */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border text-xs font-medium capitalize">
                      {activeResultView} view
                    </div>
                  </div>

                  {/* View tab buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {(["front", "side", "back"] as const).map((v) => (
                      <Button
                        key={v}
                        variant={activeResultView === v ? "default" : "outline"}
                        size="sm"
                        onClick={() => (resultViews[v] ? setActiveResultView(v) : generateView(v))}
                        disabled={generatingView !== null}
                        className="capitalize"
                      >
                        {generatingView === v ? <Loader2 className="h-3 w-3 animate-spin" /> : v}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Save Image
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    High-resolution image • Photo-realistic quality
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
};
