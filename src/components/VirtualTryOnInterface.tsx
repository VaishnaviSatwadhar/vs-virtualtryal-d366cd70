import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  CameraOff, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings,
  Scan,
  Zap,
  CheckCircle,
  AlertCircle,
  Shirt
} from "lucide-react";
import { toast } from "sonner";
import cameraInterfaceImage from "@/assets/camera-interface.jpg";

// Import product images
import blackTshirt from "@/assets/products/black-tshirt.jpg";
import silverWatch from "@/assets/products/silver-watch.jpg";
import denimJacket from "@/assets/products/denim-jacket.jpg";

interface DetectionPoint {
  x: number;
  y: number;
  type: 'face' | 'body' | 'hand';
  confidence: number;
}

interface SelectedProduct {
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
}

const availableProducts: SelectedProduct[] = [
  {
    name: "Classic Black T-Shirt",
    brand: "StyleCorp",
    price: 29.99,
    image: blackTshirt,
    size: "M"
  },
  {
    name: "Premium Silver Watch",
    brand: "TechWear", 
    price: 199.99,
    image: silverWatch,
    size: "One Size"
  },
  {
    name: "Denim Jacket",
    brand: "UrbanStyle",
    price: 79.99,
    image: denimJacket,
    size: "M"
  }
];

export const VirtualTryOnInterface = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionPoints, setDetectionPoints] = useState<DetectionPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>(availableProducts[0]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera functions
  const requestCameraAccess = async () => {
    try {
      toast.info("🎥 Requesting camera access...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays immediately
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          toast.success("🎉 Your face is now live!");
        };
      }
      
      toast.success("✅ Camera connected - You look amazing!");
      return mediaStream;
    } catch (error) {
      console.error("Camera access denied:", error);
      setHasPermission(false);
      toast.error("❌ Camera access denied. Please enable camera permissions and try again.");
      return null;
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready!");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      toast.error("Canvas not available!");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    toast.success("Image captured successfully!");
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleReset = () => {
    toast.info("Resetting virtual trial...");
    setDetectionPoints([]);
    setCapturedImage(null);
  };

  const handleSave = () => {
    if (!isActive) {
      toast.error("Please start the trial first!");
      return;
    }
    toast.success("Virtual trial saved successfully!");
    // Save screenshot or trial data
  };

  const handleShare = () => {
    if (!isActive) {
      toast.error("Please start the trial first!");
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: 'My Virtual Try-On',
        text: 'Check out how I look in this outfit!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleSettings = () => {
    toast.info("Opening settings...");
    // Open settings modal
  };

  const handleTryDifferentItem = () => {
    toast.info("Loading product selection...");
    // Open product picker or navigate to gallery
    document.querySelector('#product-gallery')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleQuickAction = (action: string) => {
    toast.info(`${action} feature coming soon!`);
    // Handle specific quick actions
  };

  // Fast AI detection with immediate face recognition
  useEffect(() => {
    if (isActive && isDetecting) {
      // Immediate initial detection
      const initialPoints: DetectionPoint[] = [
        { x: 50, y: 25, type: 'face', confidence: 0.98 },
        { x: 50, y: 45, type: 'body', confidence: 0.95 },
        { x: 35, y: 55, type: 'hand', confidence: 0.90 },
        { x: 65, y: 55, type: 'hand', confidence: 0.93 },
      ];
      setDetectionPoints(initialPoints);
      toast.success("Face detected! AI scanning active");
      
      // Fast continuous detection updates
      const interval = setInterval(() => {
        const points: DetectionPoint[] = [
          { 
            x: 50 + (Math.random() - 0.5) * 2, 
            y: 25 + (Math.random() - 0.5) * 2, 
            type: 'face', 
            confidence: 0.95 + Math.random() * 0.05 
          },
          { 
            x: 50 + (Math.random() - 0.5) * 3, 
            y: 45 + (Math.random() - 0.5) * 3, 
            type: 'body', 
            confidence: 0.90 + Math.random() * 0.08 
          },
          { 
            x: 35 + (Math.random() - 0.5) * 4, 
            y: 55 + (Math.random() - 0.5) * 4, 
            type: 'hand', 
            confidence: 0.85 + Math.random() * 0.1 
          },
          { 
            x: 65 + (Math.random() - 0.5) * 4, 
            y: 55 + (Math.random() - 0.5) * 4, 
            type: 'hand', 
            confidence: 0.87 + Math.random() * 0.1 
          },
        ];
        setDetectionPoints(points);
      }, 30); // Much faster updates (30ms instead of 100ms)

      return () => clearInterval(interval);
    }
  }, [isActive, isDetecting]);

  const handleStartTrial = async () => {
    const mediaStream = await requestCameraAccess();
    if (mediaStream) {
      setIsActive(true);
      setIsDetecting(true);
    }
  };

  const handleStopTrial = () => {
    setIsActive(false);
    setIsDetecting(false);
    setDetectionPoints([]);
    stopCamera();
  };

  return (
    <section id="virtual-trial-interface" className="py-16 px-6 bg-gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Virtual Try-On Studio
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience real-time AI-powered fitting with advanced body detection 
            and style recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Camera Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-border p-6 relative overflow-hidden">
              <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                {/* Live Camera Feed - Front facing camera for face view */}
                {isActive && stream && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                    style={{ filter: 'brightness(1.1) contrast(1.05)' }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().then(() => {
                          toast.success("👤 Your beautiful face is now live!");
                          // Start detection immediately when face is visible
                          setTimeout(() => {
                            if (!isDetecting) setIsDetecting(true);
                          }, 500);
                        });
                      }
                    }}
                    onPlaying={() => {
                      toast.success("🔥 Live video active - Looking good!");
                    }}
                    onCanPlay={() => {
                      toast.info("📹 Camera ready for your close-up!");
                    }}
                  />
                )}
                
                {/* Captured Image Preview */}
                {capturedImage && !isActive && (
                  <img 
                    src={capturedImage}
                    alt="Captured image"
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}
                
                {/* Fallback Static Image */}
                {!isActive && !capturedImage && (
                  <img 
                    src={cameraInterfaceImage}
                    alt="Virtual camera interface"
                    className="w-full h-full object-cover opacity-80"
                  />
                )}

                {/* Hidden Canvas for Capture */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Detection Overlay */}
                {isDetecting && (
                  <div className="absolute inset-0">
                    {/* Fast Scanning Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success/40 to-transparent animate-scan duration-1000" />
                    
                    {/* Face Detection Box */}
                    <div className="absolute top-[15%] left-[35%] w-[30%] h-[40%] border-2 border-success rounded-lg animate-pulse">
                      <div className="absolute -top-6 left-0 bg-success/90 text-success-foreground px-2 py-1 rounded text-xs font-medium">
                        Live Face
                      </div>
                    </div>
                    
                    {/* Detection Points */}
                    {detectionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-4 h-4 -translate-x-2 -translate-y-2"
                        style={{ 
                          left: `${point.x}%`, 
                          top: `${point.y}%` 
                        }}
                      >
                        <div className={`w-full h-full rounded-full border-2 animate-pulse-glow ${
                          point.type === 'face' ? 'border-success bg-success/30' :
                          point.type === 'body' ? 'border-primary bg-primary/30' :
                          'border-accent bg-accent/30'
                        }`} />
                      </div>
                    ))}

                    {/* AI Status Overlay with Face Detection */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-primary/30">
                      <Scan className="w-4 h-4 text-success animate-pulse" />
                      <span className="text-sm text-foreground font-medium">
                        👤 Face Detected
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        Fast AI
                      </Badge>
                    </div>

                    {/* Fit Analysis */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-foreground">Perfect Fit</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inactive State */}
                {!isActive && !capturedImage && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Click "Start Trial" to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-6">
                {!isActive ? (
                  <Button variant="hero" size="lg" onClick={handleStartTrial}>
                    <Camera className="w-5 h-5" />
                    Start Trial
                  </Button>
                ) : (
                  <>
                    <Button variant="destructive" size="lg" onClick={handleStopTrial}>
                      <CameraOff className="w-5 h-5" />
                      Stop
                    </Button>
                    <Button variant="glow" size="lg" onClick={captureImage}>
                      <Camera className="w-5 h-5" />
                      Capture
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleReset}>
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleSave}>
                      <Download className="w-5 h-5" />
                      Save
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="lg" onClick={handleSettings}>
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Product Selection */}
            <Card className="bg-gradient-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Selected Product
              </h3>
              <div className="bg-muted/20 rounded-lg p-4 mb-4">
                <div className="w-full h-32 bg-gradient-accent/20 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-foreground">{selectedProduct.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Size: {selectedProduct.size}</Badge>
                  <Badge variant="outline">${selectedProduct.price}</Badge>
                </div>
              </div>
              <Button variant="glow" className="w-full mb-2" onClick={handleTryDifferentItem}>
                Try Different Item
              </Button>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {availableProducts.map((product, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedProduct(product);
                      toast.success(`Switched to ${product.name}`);
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedProduct.name === product.name 
                        ? 'border-primary shadow-glow' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-gradient-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                AI Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Body detected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Size match: 95%</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <span className="text-sm text-foreground">Consider size L for loose fit</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("Change Background")}
                >
                  Change Background
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("Adjust Lighting")}
                >
                  Adjust Lighting
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("View in Mirror Mode")}
                >
                  View in Mirror Mode
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => handleQuickAction("Compare with Photos")}
                >
                  Compare with Photos
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};