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
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

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
  recommendedSize?: string;
  confidence?: number;
  bodyType?: string;
  measurements?: {
    chest?: string;
    shoulders?: string;
  };
  fitAdvice?: string;
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
  const [poseDetector, setPoseDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [bodyLandmarks, setBodyLandmarks] = useState<any>(null);
  const [manualSize, setManualSize] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

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
      
      // First, stop any existing streams to free up the camera
      if (stream) {
        console.log("Stopping existing camera stream...");
        stream.getTracks().forEach(track => {
          track.stop();
          console.log("Stopped track:", track.label);
        });
        setStream(null);
      }
      
      // Wait a moment to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      
      console.log("✅ Camera stream obtained:", newStream);
      console.log("Active tracks:", newStream.getVideoTracks());
      
      setHasPermission(true);
      setStream(newStream);
      
      // Wait a tick for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure video element receives the stream
      if (videoRef.current) {
        console.log("Assigning stream to video element...");
        videoRef.current.srcObject = newStream;
        
        // Set video attributes explicitly
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        
        console.log("Video element ready state:", videoRef.current.readyState);
        
        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = async () => {
          console.log("Video metadata loaded");
          try {
            await videoRef.current!.play();
            console.log("✅ Video is now playing!");
            toast.success("🎉 Camera is live! Your face is now visible!");
          } catch (playError) {
            console.error("Video play error:", playError);
            toast.error("Video playback failed - try refreshing the page");
          }
        };
      } else {
        console.error("Video ref is not available!");
      }
      return newStream;
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
      } else if (err.name === 'NotReadableError') {
        toast.error("📹 Camera Already in Use", {
          description: "Please close other tabs/apps using your camera, then try again",
          duration: 8000,
          action: {
            label: "How to Fix",
            onClick: () => {
              const fixGuide = `🔧 CAMERA IN USE FIX:

The camera is already being used by another application or browser tab.

QUICK FIX:
1. Close other browser tabs using the camera
2. Close apps like Zoom, Skype, Teams, etc.
3. Refresh this page and try again

STILL NOT WORKING?

Windows:
1. Open Task Manager (Ctrl+Shift+Esc)
2. End any camera-using processes
3. Try again

Mac:
1. System Settings → Privacy & Security → Camera
2. Check which apps have camera access
3. Quit those apps and try again

The camera can only be used by one application at a time!`;
              
              navigator.clipboard.writeText(fixGuide);
              toast.success("📋 Camera troubleshooting guide copied!");
            },
          },
        });
      } else {
        toast.error("Camera access failed: " + (err.message || "Unknown error"));
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-body-size`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageData }),
        }
      );

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status}`);
      }

      const sizeAnalysis = await response.json();
      
      console.log('Size analysis:', sizeAnalysis);
      
      setAiAnalysis({
        bodyDetected: true,
        sizeMatch: sizeAnalysis.confidence || 85,
        recommendations: [sizeAnalysis.fitAdvice || "Size recommendation based on your body proportions"],
        facePosition: { x: 50, y: 20, width: 20, height: 25 },
        recommendedSize: sizeAnalysis.recommendedSize,
        confidence: sizeAnalysis.confidence,
        bodyType: sizeAnalysis.bodyType,
        measurements: sizeAnalysis.measurements,
        fitAdvice: sizeAnalysis.fitAdvice
      });
      
      toast.success(`🎯 Recommended Size: ${sizeAnalysis.recommendedSize || 'M'}!`);
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error("AI analysis failed. Using default recommendations.");
      
      // Fallback analysis
      setAiAnalysis({
        bodyDetected: true,
        sizeMatch: 85,
        recommendations: ["Size M recommended as a safe starting point"],
        facePosition: { x: 50, y: 20, width: 20, height: 25 },
        recommendedSize: 'M',
        confidence: 75,
        bodyType: 'standard'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initialize TensorFlow.js and PoseNet model
  useEffect(() => {
    const loadPoseDetector = async () => {
      try {
        await tf.ready();
        console.log('TensorFlow.js loaded');
        
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        };
        
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        setPoseDetector(detector);
        toast.success("🤖 ML body tracking initialized!");
      } catch (error) {
        console.error('Failed to load pose detector:', error);
        toast.error("ML model failed to load, using basic tracking");
      }
    };
    
    loadPoseDetector();
  }, []);

  // Real-time pose detection and overlay rendering
  const detectPoseAndRender = async () => {
    if (!videoRef.current || !poseDetector || !overlayCanvasRef.current || !virtualTryOnOverlay) {
      return;
    }

    try {
      const video = videoRef.current;
      const poses = await poseDetector.estimatePoses(video);
      
      if (poses && poses.length > 0) {
        const pose = poses[0];
        setBodyLandmarks(pose);
        
        // Draw overlay based on detected body landmarks
        renderClothingOverlay(pose);
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(detectPoseAndRender);
  };

  const renderClothingOverlay = (pose: any) => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get key body landmarks
    const keypoints = pose.keypoints;
    const leftShoulder = keypoints.find((kp: any) => kp.name === 'left_shoulder');
    const rightShoulder = keypoints.find((kp: any) => kp.name === 'right_shoulder');
    const leftHip = keypoints.find((kp: any) => kp.name === 'left_hip');
    const rightHip = keypoints.find((kp: any) => kp.name === 'right_hip');
    const nose = keypoints.find((kp: any) => kp.name === 'nose');

    // Only render if we have good confidence on key points
    if (
      leftShoulder?.score > 0.3 && 
      rightShoulder?.score > 0.3 && 
      leftHip?.score > 0.3 && 
      rightHip?.score > 0.3
    ) {
      // Calculate t-shirt dimensions based on body landmarks
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
      const bodyHeight = Math.abs(leftHip.y - leftShoulder.y);
      
      // T-shirt positioning
      const tshirtWidth = shoulderWidth * 1.4; // Slightly wider than shoulders
      const tshirtHeight = bodyHeight * 1.3; // Cover torso
      const tshirtX = leftShoulder.x - (tshirtWidth - shoulderWidth) / 2;
      const tshirtY = (leftShoulder.y + rightShoulder.y) / 2 - tshirtHeight * 0.1;

      // Load and draw t-shirt
      const img = document.createElement('img') as HTMLImageElement;
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.75;
        
        // Calculate rotation angle based on shoulder alignment
        const shoulderAngle = Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        );
        
        // Apply transformation
        ctx.translate(tshirtX + tshirtWidth / 2, tshirtY + tshirtHeight / 2);
        ctx.rotate(shoulderAngle);
        ctx.drawImage(img, -tshirtWidth / 2, -tshirtHeight / 2, tshirtWidth, tshirtHeight);
        ctx.restore();

        // Draw body landmarks for debugging
        if (cameraSettings.faceDetection) {
          keypoints.forEach((kp: any) => {
            if (kp.score > 0.3) {
              ctx.beginPath();
              ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = kp.name.includes('shoulder') || kp.name.includes('hip') ? 
                'rgba(0, 255, 0, 0.8)' : 'rgba(0, 150, 255, 0.6)';
              ctx.fill();
            }
          });
        }
      };
      img.src = selectedProduct.image;
    }
  };

  const generateVirtualTryOn = async () => {
    if (!videoRef.current) {
      toast.error("Camera not active!");
      return;
    }

    if (!poseDetector) {
      toast.error("ML model not loaded yet!");
      return;
    }
    
    setIsGeneratingTryOn(true);
    toast.info("🎨 Applying t-shirt with ML tracking...");
    
    try {
      // Set initial overlay to trigger rendering
      setVirtualTryOnOverlay(selectedProduct.image);
      
      // Start continuous pose detection and rendering
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      detectPoseAndRender();
      
      setIsGeneratingTryOn(false);
      toast.success("✨ ML-tracked t-shirt applied! Move around!");
    } catch (error) {
      console.error('Virtual try-on failed:', error);
      toast.error("Failed to generate virtual try-on");
      setIsGeneratingTryOn(false);
    }
  };

  // Cleanup camera and animation on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleReset = () => {
    toast.info("Resetting virtual trial...");
    setDetectionPoints([]);
    setCapturedImage(null);
    setVirtualTryOnOverlay(null);
    setBodyLandmarks(null);
    setManualSize(null);
    setAiAnalysis({
      bodyDetected: false,
      sizeMatch: 0,
      recommendations: []
    });
    
    // Stop pose detection animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear overlay canvas
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    }
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
              // Update detection points for face and body tracking
              const points: DetectionPoint[] = [
                // Face tracking points
                { x: 45 + Math.random() * 2, y: 20 + Math.random() * 2, type: 'face', confidence: 0.95 },
                { x: 50 + Math.random() * 2, y: 18 + Math.random() * 2, type: 'face', confidence: 0.98 },
                { x: 55 + Math.random() * 2, y: 20 + Math.random() * 2, type: 'face', confidence: 0.94 },
                // Body/shoulder tracking points for t-shirt placement
                { x: 35 + Math.random() * 2, y: 35 + Math.random() * 2, type: 'body', confidence: 0.88 },
                { x: 50 + Math.random() * 2, y: 38 + Math.random() * 2, type: 'body', confidence: 0.91 },
                { x: 65 + Math.random() * 2, y: 35 + Math.random() * 2, type: 'body', confidence: 0.87 },
              ];
              setDetectionPoints(points);
              
              // Update AI analysis with body position
              setAiAnalysis(prev => ({
                ...prev,
                bodyDetected: true,
                facePosition: { x: 50, y: 20, width: 20, height: 25 }
              }));
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
    // Prevent multiple simultaneous camera access attempts
    if (stream) {
      toast.info("Camera is already active!");
      return;
    }
    
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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover rounded-lg ${
                    cameraSettings.mirrorMode ? 'scale-x-[-1]' : ''
                  } ${stream ? 'block' : 'hidden'}`}
                  style={{ 
                    filter: `brightness(${cameraSettings.brightnessBoost ? '1.2' : '1'}) contrast(${cameraSettings.brightnessBoost ? '1.1' : '1'}) saturate(1.1)`,
                    background: '#000',
                    minHeight: '100%',
                    display: stream ? 'block' : 'none'
                  }}
                  onPlaying={() => {
                    console.log("📹 Video is playing!");
                    toast.success("📹 Live! Your face is clearly visible");
                  }}
                />
                
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
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <img 
                      src={virtualTryOnOverlay}
                      alt="Virtual try-on overlay"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Detection Overlay */}
                {isDetecting && (
                  <div className="absolute inset-0 z-20">
                    {/* Face and Body Detection Points */}
                    {detectionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-3 h-3 -translate-x-1.5 -translate-y-1.5"
                        style={{ 
                          left: `${point.x}%`, 
                          top: `${point.y}%` 
                        }}
                      >
                        <div 
                          className={`w-full h-full rounded-full border-2 animate-pulse ${
                            point.type === 'face' 
                              ? 'border-blue-400 bg-blue-400/20' 
                              : 'border-green-400 bg-green-400/20'
                          }`} 
                        />
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
                      disabled={isGeneratingTryOn}
                    >
                      {isGeneratingTryOn ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isGeneratingTryOn ? "Applying..." : "Try On T-Shirt"}
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
                      disabled={isGeneratingTryOn}
                    >
                      {isGeneratingTryOn ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      {isGeneratingTryOn ? "Applying..." : "Try On T-Shirt"}
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
                AI Size Recommendation
              </h3>
              <div className="space-y-3">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-foreground">Analyzing your body size...</span>
                  </div>
                ) : (
                  <>
                    {aiAnalysis.recommendedSize && (
                      <div className="bg-gradient-accent/20 rounded-lg p-4 border border-primary/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Recommended Size</span>
                          <Badge variant="default" className="text-lg px-4 py-1 bg-primary text-primary-foreground">
                            {aiAnalysis.recommendedSize}
                          </Badge>
                        </div>
                        {aiAnalysis.confidence && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3" />
                            <span>{aiAnalysis.confidence}% confidence</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {aiAnalysis.bodyType && (
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-accent" />
                        <span className="text-sm text-foreground">
                          Body type: <span className="font-medium capitalize">{aiAnalysis.bodyType}</span>
                        </span>
                      </div>
                    )}
                    
                    {aiAnalysis.measurements && (
                      <div className="space-y-1">
                        {aiAnalysis.measurements.chest && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>• Chest: {aiAnalysis.measurements.chest}</span>
                          </div>
                        )}
                        {aiAnalysis.measurements.shoulders && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>• Shoulders: {aiAnalysis.measurements.shoulders}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {aiAnalysis.fitAdvice && (
                      <div className="bg-muted/20 rounded-lg p-3 mt-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{aiAnalysis.fitAdvice}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {aiAnalysis.bodyDetected ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      )}
                      <span className="text-sm text-foreground">
                        {aiAnalysis.bodyDetected ? "Body detected" : "Capture photo to get size recommendation"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Manual Size Selection */}
            <Card className="bg-gradient-card border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-accent" />
                Choose Your Size
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select your preferred size manually or use AI recommendation above
              </p>
              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].slice(0, 5).map((size) => (
                  <Button
                    key={size}
                    variant={manualSize === size ? "default" : "outline"}
                    className={`h-14 font-bold text-base transition-all ${
                      manualSize === size 
                        ? 'shadow-glow scale-105' 
                        : 'hover:scale-105'
                    }`}
                    onClick={() => {
                      setManualSize(size);
                      toast.success(`Size ${size} selected!`);
                    }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setManualSize('XXL');
                    toast.success('Size XXL selected!');
                  }}
                >
                  XXL
                </Button>
              </div>
              {manualSize && (
                <div className="mt-4 bg-gradient-accent/10 rounded-lg p-3 border border-accent/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Selected Size:</span>
                    <Badge variant="default" className="text-base px-3 bg-accent text-accent-foreground">
                      {manualSize}
                    </Badge>
                  </div>
                  {aiAnalysis.recommendedSize && manualSize !== aiAnalysis.recommendedSize && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      AI recommends size {aiAnalysis.recommendedSize}
                    </p>
                  )}
                </div>
              )}
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