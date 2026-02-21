import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Download, Sparkles, Loader2, Link as LinkIcon, Plus, X, ShoppingBag, RotateCcw, Settings, Ruler } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
}

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]); // User's selected products
  const [showGallery, setShowGallery] = useState(false);
  const [backgroundType, setBackgroundType] = useState<string>("original");
  
  const [productFit, setProductFit] = useState<number[]>([50]);
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
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // All available products for try-on
  const products: Product[] = [
    // Clothing
    { name: "Black T-Shirt", image: blackTshirt, brand: "StyleCorp", price: 29.99 },
    { name: "White Hoodie", image: whiteHoodie, brand: "ComfortWear", price: 49.99 },
    { name: "Denim Jacket", image: denimJacket, brand: "UrbanStyle", price: 79.99 },
    { name: "Red Dress", image: redDress, brand: "ChicStyle", price: 89.99 },
    { name: "Blue Jeans", image: blueJeans, brand: "DenimCo", price: 59.99 },
    { name: "Green Jacket", image: greenJacket, brand: "UrbanStyle", price: 149.99 },
    { name: "Yellow Dress", image: yellowDress, brand: "SummerVibes", price: 79.99 },
    
    // Accessories & Jewelry
    { name: "Silver Watch", image: silverWatch, brand: "TechWear", price: 199.99 },
    { name: "Gold Smartwatch", image: goldSmartwatch, brand: "DigitalLux", price: 299.99 },
    { name: "Gold Necklace", image: goldNecklace, brand: "JewelCraft", price: 79.99 },
    { name: "Pearl Earrings", image: pearlEarrings, brand: "EleganceJewels", price: 45.99 },
    { name: "Diamond Ring", image: diamondRing, brand: "LuxeJewelry", price: 299.99 },
    { name: "Silver Bracelet", image: silverBracelet, brand: "EleganceJewels", price: 49.99 },
    { name: "Black Sunglasses", image: blackSunglasses, brand: "SunStyle", price: 59.99 },
    { name: "Baseball Cap", image: baseballCap, brand: "UrbanCap", price: 24.99 },
    { name: "Silk Scarf", image: silkScarf, brand: "LuxeAccessories", price: 32.99 },
    { name: "Leather Belt", image: leatherBelt, brand: "ClassicWear", price: 39.99 },
    { name: "Leather Handbag", image: leatherHandbag, brand: "LuxeBags", price: 149.99 },
    { name: "Gray Cardigan", image: grayCardigan, brand: "ComfortKnits", price: 129.99 },
    { name: "Crossbody Bag", image: crossbodyBag, brand: "UrbanStyle", price: 69.99 },
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
      // Add to user's products if not already there
      setMyProducts(prev => {
        const exists = prev.some(p => p.name === product.name);
        if (!exists) {
          return [...prev, product];
        }
        return prev;
      });
      setSelectedProduct(product);
      setTryonResult(null);
      toast.success(`${selectedProductProp.name} added to your selection!`);
    }
  }, [selectedProductProp]);

  const addProductToMyList = (product: Product) => {
    const exists = myProducts.some(p => p.name === product.name);
    if (exists) {
      toast.info(`${product.name} is already in your selection`);
      return;
    }
    setMyProducts(prev => [...prev, product]);
    toast.success(`${product.name} added to your selection!`);
  };

  const removeProductFromMyList = (productName: string) => {
    setMyProducts(prev => prev.filter(p => p.name !== productName));
    if (selectedProduct?.name === productName) {
      setSelectedProduct(null);
      setTryonResult(null);
    }
    toast.success(`Product removed from your selection`);
  };

  const startCamera = useCallback(async (mode?: FacingMode) => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
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
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          toast.success(`Camera ready! (${resolution.label})`);
        };
      }
      
      streamRef.current = stream;
      setShowCamera(true);
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error("Camera access denied. Please allow camera permissions.");
      } else if (error.name === 'NotFoundError') {
        toast.error("No camera found on your device.");
      } else if (error.name === 'OverconstrainedError') {
        // Fallback to lower resolution if requested is not supported
        toast.info("Requested resolution not available, using default.");
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: currentFacingMode } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
            toast.success("Camera ready!");
          };
        }
        streamRef.current = fallbackStream;
        setShowCamera(true);
      } else {
        toast.error("Failed to access camera. Please try again.");
      }
    }
  }, [facingMode, cameraResolution]);

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
    if (!userImage || !selectedProduct) {
      toast.error("Please upload/capture your photo and select a clothing item!");
      return;
    }

    setIsProcessing(true);
    toast.info("🎨 AI is creating your virtual try-on...", { duration: 5000 });

    try {
      // Convert product image to base64 if it's a module import
      let clothingImageData = selectedProduct.image;
      if (typeof selectedProduct.image === 'string' && !selectedProduct.image.startsWith('data:')) {
        const response = await fetch(selectedProduct.image);
        const blob = await response.blob();
        clothingImageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const { data, error } = await supabase.functions.invoke('virtual-tryon', {
        body: {
          userImage,
          clothingImage: clothingImageData,
          clothingName: selectedProduct.name,
          backgroundType
        }
      });

      if (error) {
        throw error;
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
        toast.success("✨ Virtual try-on complete! Looking great!", { duration: 5000 });
        toast.info("💡 Tip: Try changing the background or trying different items!", { duration: 4000 });
      } else {
        throw new Error("No image generated");
      }
    } catch (error: any) {
      console.error('Virtual try-on error:', error);
      if (error.message?.includes("Rate limit") || error.message?.includes("429")) {
        toast.error("Too many requests. Please wait a moment and try again.", { duration: 5000 });
      } else if (error.message?.includes("credits") || error.message?.includes("402")) {
        toast.error("AI credits required. Please add credits to continue.", { duration: 5000 });
      } else if (error.message?.includes("person detected")) {
        toast.error("Please upload a clearer photo with your full face and upper body visible.", { duration: 6000 });
        setUserImage(null);
        setTryonResult(null);
      } else {
        toast.error("Failed to generate try-on. Ensure your photo clearly shows a person facing the camera.", { duration: 5000 });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!tryonResult) {
      toast.error("No image to download");
      return;
    }

    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `tryon_${selectedProduct?.name.replace(/\s+/g, '_')}_${timestamp}.png`;
    link.href = tryonResult;
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
                <h3 className="text-xl font-semibold">My Products</h3>
              </div>
              <Button
                onClick={() => setShowGallery(!showGallery)}
                variant={showGallery ? "default" : "outline"}
                size="sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {showGallery ? 'Hide Gallery' : 'Browse Gallery'}
              </Button>
            </div>
            
            {/* Gallery View */}
            {showGallery && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                <h4 className="text-sm font-semibold mb-3">Product Gallery</h4>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                  {products.map((product) => {
                    const isAdded = myProducts.some(p => p.name === product.name);
                    return (
                      <div
                        key={product.name}
                        className="relative p-2 rounded-lg border bg-background"
                      >
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">${product.price}</p>
                        <Button
                          onClick={() => addProductToMyList(product)}
                          disabled={isAdded}
                          size="sm"
                          className="w-full"
                          variant={isAdded ? "outline" : "default"}
                        >
                          {isAdded ? (
                            <>Added</>
                          ) : (
                            <><Plus className="h-3 w-3 mr-1" /> Add</>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User's Selected Products */}
            <div className="space-y-4">
              {myProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No products selected yet</p>
                  <p className="text-xs mt-1">Click "Browse Gallery" to add products</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {myProducts.map((product) => (
                    <div
                      key={product.name}
                      className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedProduct?.name === product.name
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedProduct(product);
                        setTryonResult(null);
                        toast.success(`Selected: ${product.name}`);
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProductFromMyList(product.name);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">${product.price}</p>
                      {selectedProduct?.name === product.name && (
                        <Badge className="mt-1 w-full justify-center" variant="default">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 mt-4">
              {/* Fit Slider */}
              {selectedProduct && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Fit</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-muted-foreground">Fit</label>
                      <span className="text-xs font-medium text-primary">
                        {productFit[0] <= 25 ? 'Slim' : productFit[0] <= 50 ? 'Regular' : productFit[0] <= 75 ? 'Relaxed' : 'Oversized'}
                      </span>
                    </div>
                    <Slider
                      value={productFit}
                      onValueChange={setProductFit}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Slim</span><span>Regular</span><span>Relaxed</span><span>Oversized</span>
                    </div>
                  </div>
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
                disabled={isProcessing || !selectedProduct || !userImage}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Try On Now
                  </>
                )}
              </Button>
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
                  <img 
                    src={tryonResult} 
                    alt="Virtual try-on result" 
                    className="w-full rounded-lg shadow-lg"
                  />
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
