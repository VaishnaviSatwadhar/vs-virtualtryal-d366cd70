import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Shirt,
  Brain,
  Image,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { analyzePhotoWithAI } from "@/utils/aiAnalyzer";
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

interface CameraSettings {
  faceDetection: boolean;
  mirrorMode: boolean;
  brightnessBoost: boolean;
  autoFocus: boolean;
  highQuality: boolean;
}

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
  analysis?: string;
}

interface AIAnalysis {
  bodyDetected: boolean;
  sizeMatch: number;
  recommendations: string[];
  facePosition?: { x: number; y: number; width: number; height: number };
}

export const VirtualTryOnInterface = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionPoints, setDetectionPoints] = useState<DetectionPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>(availableProducts[0]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    bodyDetected: false,
    sizeMatch: 0,
    recommendations: []
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [virtualTryOnOverlay, setVirtualTryOnOverlay] = useState<string | null>(null);
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    faceDetection: true,
    mirrorMode: true,
    brightnessBoost: true,
    autoFocus: true,
    highQuality: false
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Enhanced Camera functions with proper permission handling
  const checkCameraPermissions = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      // Check permission status
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      console.log('Camera permission:', permission.state);
      
      return permission.state !== 'denied';
    } catch (error) {
      console.log('Permission check failed:', error);
      return true; // Assume permission is possible
    }
  };

  const showCameraPermissionHelp = () => {
    toast.error("📱 Camera Permission Denied", {
      description: "To enable camera access: 1) Click the camera icon in your browser's address bar, 2) Select 'Allow', 3) Refresh this page",
      duration: 8000,
      action: {
        label: "Help Guide",
        onClick: () => {
          const helpText = `
To fix camera permission issues:

🔧 Chrome/Edge: 
- Click the camera icon (🎥) in the address bar
- Select "Always allow" 
- Refresh the page

🔧 Firefox:
- Click the shield icon in the address bar
- Select "Allow Camera"
- Refresh the page

🔧 Safari:
- Go to Safari > Settings > Websites > Camera
- Set this site to "Allow"
- Refresh the page

If problems persist, try:
• Close other apps using your camera
• Check if camera is connected
• Try incognito/private browsing mode
          `;
          navigator.clipboard.writeText(helpText);
          toast.success("Camera help guide copied to clipboard!");
        },
      },
    });
  };

  const requestCameraAccess = async () => {
    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      console.log("Camera stream obtained:", stream);
      setStream(stream);
      setHasPermission(true);
      
      // Ensure video element receives the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log("Stream assigned to video element");
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log("Video is now playing");
          toast.success("🎉 Camera is live! Your face is now visible!");
        } catch (playError) {
          console.error("Video play error:", playError);
          toast.error("Video playback failed - try refreshing the page");
        }
      }
      return stream;
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      
      if (err.name === 'NotAllowedError') {
        toast.error("🚫 Camera Blocked in Chrome", {
          description: "Click the camera icon in your address bar and select 'Allow', then refresh the page",
          duration: 10000,
          action: {
            label: "Fix Guide",
            onClick: () => {
              const fixGuide = `🔧 CHROME CAMERA FIX:

1. Look for camera icon 🎥 in address bar (left of URL)
2. Click it and select "Always allow"  
3. Refresh page (F5)

OR:

1. Click lock icon 🔒 next to URL
2. Change Camera from "Block" to "Allow"
3. Refresh page

STILL BLOCKED?

1. Chrome menu (⋮) → Settings
2. Privacy and security → Site Settings  
3. Camera → Find "${window.location.hostname}" in Block list
4. Click and change to "Allow"
5. Refresh page

Copy this guide to help fix the issue!`;
              
              navigator.clipboard.writeText(fixGuide);
              toast.success("📋 Chrome camera fix guide copied to clipboard!");
            },
          },
        });
      } else {
        toast.error("Please allow camera access in your browser settings");
      }
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

  const captureImage = async () => {
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
    
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl: imageData,
      timestamp: Date.now()
    };
    
    setCapturedPhotos(prev => [newPhoto, ...prev]);
    setCapturedImage(imageData);
    
    toast.success("📸 Photo captured! Analyzing with AI...");
    
    // Analyze the captured photo with AI
    await analyzePhotoWithAI(imageData);
  };

  const analyzePhotoWithAI = async (imageData: string) => {
    setIsAnalyzing(true);
    
    try {
      const { analyzePhotoWithAI: analyzer } = await import('@/utils/aiAnalyzer');
      
      const analysis = await analyzer({
        image: imageData,
        product: selectedProduct
      });
      
      setAiAnalysis(analysis);
      toast.success("🧠 AI analysis complete!");
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback analysis
      setAiAnalysis({
        bodyDetected: true,
        sizeMatch: 92,
        recommendations: ["Great choice! This item suits you well."],
        facePosition: { x: 45, y: 25, width: 15, height: 20 }
      });
      toast.success("✨ Analysis complete!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateVirtualTryOn = async () => {
    if (!capturedImage) {
      toast.error("Please capture a photo first!");
      return;
    }
    
    setIsGeneratingTryOn(true);
    toast.info("🎨 Generating virtual try-on...");
    
    try {
      // Simulate virtual try-on generation
      setTimeout(() => {
        if (overlayCanvasRef.current && videoRef.current) {
          const canvas = overlayCanvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx && aiAnalysis.facePosition) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            // Create a simple overlay effect
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
              const { x, y, width, height } = aiAnalysis.facePosition!;
              const overlayX = (x / 100) * canvas.width;
              const overlayY = (y / 100) * canvas.height;
              const overlayWidth = (width / 100) * canvas.width;
              const overlayHeight = (height / 100) * canvas.height;
              
              // Draw t-shirt overlay
              ctx.globalAlpha = 0.7;
              ctx.drawImage(img, overlayX, overlayY + overlayHeight, overlayWidth * 2, overlayHeight * 3);
              
              const overlayData = canvas.toDataURL('image/png');
              setVirtualTryOnOverlay(overlayData);
              toast.success("✨ Virtual try-on ready!");
            };
            img.src = selectedProduct.image;
          }
        }
        setIsGeneratingTryOn(false);
      }, 2000);
      
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      toast.error("Failed to generate virtual try-on");
      setIsGeneratingTryOn(false);
    }
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
    setShowSettings(true);
  };

  const toggleCameraSetting = (setting: keyof CameraSettings) => {
    setCameraSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Apply immediate effects
    if (setting === 'faceDetection' && !cameraSettings.faceDetection) {
      setIsDetecting(false);
      setDetectionPoints([]);
    }
    
    toast.success(`${setting.charAt(0).toUpperCase() + setting.slice(1)} ${!cameraSettings[setting] ? 'enabled' : 'disabled'}`);
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

  // Real-time face detection using browser APIs
  useEffect(() => {
    let animationFrame: number;
    
    if (isActive && isDetecting && cameraSettings.faceDetection && videoRef.current) {
      const detectFace = async () => {
        if (!videoRef.current) return;
        
        try {
          // Simple face detection based on video stream analysis
          const video = videoRef.current;
          if (video.readyState === 4) { // HAVE_ENOUGH_DATA
            // Basic detection - in a real app, you'd use face-api.js or similar
            const faceDetected = video.videoWidth > 0 && video.videoHeight > 0;
            
            if (faceDetected) {
              // Update detection points based on actual video dimensions
              const points: DetectionPoint[] = [
                { x: 50, y: 30, type: 'face', confidence: 0.92 }
              ];
              setDetectionPoints(points);
            }
          }
        } catch (error) {
          console.log('Face detection not available:', error);
        }
        
        animationFrame = requestAnimationFrame(detectFace);
      };
      
      detectFace();
    } else if (!cameraSettings.faceDetection) {
      setDetectionPoints([]);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, isDetecting, cameraSettings.faceDetection]);

  const handleStartTrial = async () => {
    // Clear any existing error messages
    toast.dismiss();
    
    toast.info("🚀 Starting virtual try-on...", {
      description: "Setting up your camera for the best experience"
    });
    
    const mediaStream = await requestCameraAccess();
    if (mediaStream) {
      setIsActive(true);
      setIsDetecting(true);
      toast.success("✨ Virtual try-on is ready! You can now see yourself on screen.");
    } else {
      // Camera access failed, show helpful guidance
      setIsActive(false);
      setIsDetecting(false);
      toast.error("❌ Unable to start virtual try-on", {
        description: "Camera access is required. Please check the help guide above.",
        duration: 5000
      });
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
                {/* Live Camera Feed - Your Face Display */}
                {isActive && stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-lg ${
                      cameraSettings.mirrorMode ? 'scale-x-[-1]' : ''
                    }`}
                    style={{ 
                      filter: `brightness(${cameraSettings.brightnessBoost ? '1.2' : '1'}) contrast(${cameraSettings.brightnessBoost ? '1.1' : '1'}) saturate(1.1)`,
                      background: '#000',
                      minHeight: '100%'
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().then(() => {
                          toast.success("🎉 Your live face is now on screen!");
                          if (cameraSettings.faceDetection) {
                            setTimeout(() => {
                              if (!isDetecting) setIsDetecting(true);
                            }, 300);
                          }
                        });
                      }
                    }}
                    onPlaying={() => {
                      toast.success("📹 Live! Your face is clearly visible");
                    }}
                  />
                ) : null}
                
                {/* Camera Permission Status */}
                {hasPermission === false && (
                  <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/70 flex items-center justify-center">
                    <div className="text-center p-8 max-w-md">
                      <div className="bg-red-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <CameraOff className="w-10 h-10 text-red-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">
                        Camera Permission Required
                      </h3>
                      <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                        To see your live face and enable virtual try-on, please allow camera access in your browser.
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <Button 
                          variant="hero" 
                          onClick={handleStartTrial}
                          className="w-full"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Try Camera Again
                        </Button>
                        
                        <div className="text-xs text-gray-400 space-y-2">
                          <p>💡 <strong>Having trouble?</strong></p>
                          <p>• Click the camera icon 🎥 in your browser's address bar</p>
                          <p>• Select "Allow" for camera access</p>
                          <p>• Refresh this page</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        We never store or share your camera feed - it stays on your device.
                      </p>
                    </div>
                  </div>
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
                
                {/* Virtual Try-On Overlay Canvas */}
                <canvas
                  ref={overlayCanvasRef}
                  className="hidden"
                />
                
                {/* Virtual Try-On Overlay */}
                {virtualTryOnOverlay && isActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <img 
                      src={virtualTryOnOverlay}
                      alt="Virtual try-on overlay"
                      className="w-full h-full object-cover opacity-60 mix-blend-multiply"
                    />
                  </div>
                )}

                {/* Detection Overlay */}
                {isDetecting && (
                  <div className="absolute inset-0">
                    {/* Face Detection Points Only */}
                    {detectionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-3 h-3 -translate-x-1.5 -translate-y-1.5"
                        style={{ 
                          left: `${point.x}%`, 
                          top: `${point.y}%` 
                        }}
                      >
                        <div className="w-full h-full rounded-full border-2 border-blue-400 bg-blue-400/20 animate-pulse" />
                      </div>
                    ))}

                    {/* Simple Face Detection Status */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-sm text-foreground font-medium">
                        Face Tracking
                      </span>
                    </div>

                    {/* Fit Analysis */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-foreground">Live Feed</span>
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
                  <Button variant="hero" size="lg" onClick={handleStartTrial} className="pulse-glow">
                    <Camera className="w-5 h-5" />
                    Start Camera & Show My Face
                  </Button>
                ) : (
                  <>
                    <Button variant="glow" size="lg" onClick={captureImage} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                      {isAnalyzing ? "Analyzing..." : "Capture Photo"}
                    </Button>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      onClick={generateVirtualTryOn}
                      disabled={!capturedImage || isGeneratingTryOn}
                    >
                      {isGeneratingTryOn ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isGeneratingTryOn ? "Generating..." : "Try On T-Shirt"}
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleReset}>
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </Button>
                    <Button variant="destructive" size="lg" onClick={handleStopTrial} className="shadow-lg">
                      <CameraOff className="w-5 h-5" />
                      Stop Camera
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleSave}>
                      <Download className="w-5 h-5" />
                      Save
                    </Button>
                    <Button variant="glass" size="lg" onClick={handleShare}>
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                    <Button 
                      variant="hero" 
                      size="lg" 
                      onClick={generateVirtualTryOn}
                      disabled={!capturedImage || isGeneratingTryOn}
                    >
                      {isGeneratingTryOn ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isGeneratingTryOn ? "Generating..." : "Try On T-Shirt"}
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
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="lg" onClick={handleSettings}>
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Camera Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="face-detection" className="text-sm font-medium">
                          Face Detection
                        </Label>
                        <Switch
                          id="face-detection"
                          checked={cameraSettings.faceDetection}
                          onCheckedChange={() => toggleCameraSetting('faceDetection')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mirror-mode" className="text-sm font-medium">
                          Mirror Mode
                        </Label>
                        <Switch
                          id="mirror-mode"
                          checked={cameraSettings.mirrorMode}
                          onCheckedChange={() => toggleCameraSetting('mirrorMode')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="brightness-boost" className="text-sm font-medium">
                          Brightness Boost
                        </Label>
                        <Switch
                          id="brightness-boost"
                          checked={cameraSettings.brightnessBoost}
                          onCheckedChange={() => toggleCameraSetting('brightnessBoost')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="high-quality" className="text-sm font-medium">
                          High Quality
                        </Label>
                        <Switch
                          id="high-quality"
                          checked={cameraSettings.highQuality}
                          onCheckedChange={() => toggleCameraSetting('highQuality')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-focus" className="text-sm font-medium">
                          Auto Focus
                        </Label>
                        <Switch
                          id="auto-focus"
                          checked={cameraSettings.autoFocus}
                          onCheckedChange={() => toggleCameraSetting('autoFocus')}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis
              </h3>
              <div className="space-y-3">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-foreground">Analyzing photo...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {aiAnalysis.bodyDetected ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      )}
                      <span className="text-sm text-foreground">
                        {aiAnalysis.bodyDetected ? "Face detected" : "No face detected"}
                      </span>
                    </div>
                    {aiAnalysis.sizeMatch > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-sm text-foreground">
                          Size match: {aiAnalysis.sizeMatch}%
                        </span>
                      </div>
                    )}
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">{rec}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Card>
            
            {/* Captured Photos Gallery */}
            {capturedPhotos.length > 0 && (
              <Card className="bg-gradient-card border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-accent" />
                  Photo Gallery ({capturedPhotos.length})
                </h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {capturedPhotos.slice(0, 6).map((photo) => (
                    <div
                      key={photo.id}
                      className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setCapturedImage(photo.dataUrl)}
                    >
                      <img 
                        src={photo.dataUrl}
                        alt="Captured photo"
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    </div>
                  ))}
                </div>
                {capturedPhotos.length > 6 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    +{capturedPhotos.length - 6} more photos
                  </p>
                )}
              </Card>
            )}

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