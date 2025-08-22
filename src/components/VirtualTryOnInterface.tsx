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
import cameraInterfaceImage from "@/assets/camera-interface.jpg";

interface DetectionPoint {
  x: number;
  y: number;
  type: 'face' | 'body' | 'hand';
  confidence: number;
}

export const VirtualTryOnInterface = () => {
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionPoints, setDetectionPoints] = useState<DetectionPoint[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("Classic T-Shirt");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate AI detection
  useEffect(() => {
    if (isActive && isDetecting) {
      const interval = setInterval(() => {
        const points: DetectionPoint[] = [
          { x: 50, y: 25, type: 'face', confidence: 0.95 },
          { x: 50, y: 45, type: 'body', confidence: 0.92 },
          { x: 35, y: 55, type: 'hand', confidence: 0.88 },
          { x: 65, y: 55, type: 'hand', confidence: 0.91 },
        ];
        setDetectionPoints(points);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, isDetecting]);

  const handleStartTrial = () => {
    setIsActive(true);
    setIsDetecting(true);
  };

  const handleStopTrial = () => {
    setIsActive(false);
    setIsDetecting(false);
    setDetectionPoints([]);
  };

  return (
    <section className="py-16 px-6 bg-gradient-hero">
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
                {/* Camera Feed Simulation */}
                <img 
                  src={cameraInterfaceImage}
                  alt="Virtual camera interface"
                  className="w-full h-full object-cover opacity-80"
                />

                {/* Detection Overlay */}
                {isDetecting && (
                  <div className="absolute inset-0">
                    {/* Scanning Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />
                    
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

                    {/* AI Status Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                      <Scan className="w-4 h-4 text-primary animate-spin" />
                      <span className="text-sm text-foreground font-medium">
                        AI Scanning...
                      </span>
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
                {!isActive && (
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
                    <Button variant="glass" size="lg">
                      <RotateCcw className="w-5 h-5" />
                      Reset
                    </Button>
                    <Button variant="glass" size="lg">
                      <Download className="w-5 h-5" />
                      Save
                    </Button>
                    <Button variant="glass" size="lg">
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="lg">
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
                <div className="w-full h-32 bg-gradient-accent/20 rounded-lg mb-3 flex items-center justify-center">
                  <Shirt className="w-12 h-12 text-accent" />
                </div>
                <h4 className="font-medium text-foreground">{selectedProduct}</h4>
                <p className="text-sm text-muted-foreground">Premium Cotton Blend</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">Size: M</Badge>
                  <Badge variant="outline">$29.99</Badge>
                </div>
              </div>
              <Button variant="glow" className="w-full">
                Try Different Item
              </Button>
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
                <Button variant="ghost" className="w-full justify-start">
                  Change Background
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Adjust Lighting
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  View in Mirror Mode
                </Button>
                <Button variant="ghost" className="w-full justify-start">
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