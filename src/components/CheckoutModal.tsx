import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Smartphone, Building2, Wallet, Check, Lock, ShieldCheck, Truck } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";

export const CheckoutModal = ({ open, onOpenChange, product }: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"payment" | "success">("payment");
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  // UPI state
  const [upiId, setUpiId] = useState("");
  
  // Address state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    // Basic validation
    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Please enter a valid card number");
        return;
      }
      if (!expiryDate || expiryDate.length < 5) {
        toast.error("Please enter a valid expiry date");
        return;
      }
      if (!cvv || cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return;
      }
      if (!cardName) {
        toast.error("Please enter the name on card");
        return;
      }
    }
    
    if (paymentMethod === "upi" && !upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }
    
    if (!address || !city || !pincode) {
      toast.error("Please fill in the delivery address");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("payment");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardName("");
    setUpiId("");
    setAddress("");
    setCity("");
    setPincode("");
    onOpenChange(false);
  };

  if (!product) return null;

  const subtotal = product.price;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "payment" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Lock className="w-5 h-5 text-success" />
                Secure Checkout
              </DialogTitle>
              <DialogDescription>
                Complete your purchase securely
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* Product Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Order Summary</h3>
                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{product.name}</h4>
                    {product.brand && (
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-foreground">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? (
                        <Badge variant="secondary" className="bg-success/20 text-success">Free</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    Secure
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-success" />
                    Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-success" />
                    Fast Delivery
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Payment Method</h3>
                
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="grid grid-cols-2 gap-2"
                >
                  <Label 
                    htmlFor="card" 
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">Card</span>
                  </Label>
                  <Label 
                    htmlFor="upi" 
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "upi" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">UPI</span>
                  </Label>
                  <Label 
                    htmlFor="netbanking" 
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "netbanking" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Net Banking</span>
                  </Label>
                  <Label 
                    htmlFor="wallet" 
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "wallet" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Wallet</span>
                  </Label>
                </RadioGroup>

                {/* Card Payment Form */}
                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="cardNumber" className="text-sm">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="expiry" className="text-sm">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-sm">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength={4}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName" className="text-sm">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Payment Form */}
                {paymentMethod === "upi" && (
                  <div>
                    <Label htmlFor="upiId" className="text-sm">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Net Banking & Wallet - Just show message */}
                {(paymentMethod === "netbanking" || paymentMethod === "wallet") && (
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to {paymentMethod === "netbanking" ? "your bank" : "wallet provider"} after clicking Pay Now
                    </p>
                  </div>
                )}

                <Separator />

                {/* Delivery Address */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground text-sm">Delivery Address</h4>
                  <div>
                    <Label htmlFor="address" className="text-sm">Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-sm">PIN Code</Label>
                      <Input
                        id="pincode"
                        placeholder="123456"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  className="w-full" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg inline-block">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono font-bold text-foreground">
                #{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-4 p-4 bg-muted/20 rounded-lg max-w-xs mx-auto">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="text-left">
                <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                <p className="text-lg font-bold text-primary">${total.toFixed(2)}</p>
              </div>
            </div>
            <Button variant="hero" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
