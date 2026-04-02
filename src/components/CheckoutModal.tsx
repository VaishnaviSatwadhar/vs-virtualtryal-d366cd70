import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Lock, ShieldCheck, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

export const CheckoutModal = ({ open, onOpenChange, product }: CheckoutModalProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"details" | "success">("details");
  const [orderId, setOrderId] = useState("");

  // Address state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleClose = () => {
    setStep("details");
    setAddress("");
    setCity("");
    setPincode("");
    setPhone("");
    setName("");
    setEmail("");
    onOpenChange(false);
  };

  if (!product) return null;

  const subtotal = product.price;
  const shipping = subtotal > 8000 ? 0 : 499;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const initiateRazorpayPayment = async () => {
    if (!name || !email || !phone || !address || !city || !pincode) {
      toast.error("Please fill in all delivery details");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order on backend
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: total,
          currency: "INR",
          receipt: `order_${Date.now()}`,
          notes: {
            product_name: product.name,
            customer_name: name,
          },
        },
      });

      if (error || !data?.order_id) {
        throw new Error(error?.message || "Failed to create order");
      }

      // Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "VS Virtual Try-On",
        description: product.name,
        order_id: data.order_id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        notes: {
          address: `${address}, ${city} - ${pincode}`,
        },
        theme: {
          color: "#27F5E0",
        },
        handler: async function (response: any) {
          // Save order to database
          if (user) {
            await supabase.from("orders").insert({
              user_id: user.id,
              product_name: product.name,
              product_image: product.image,
              product_price: product.price,
              total_amount: total,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              status: "paid",
              delivery_address: `${address}, ${city} - ${pincode}`,
              customer_name: name,
              customer_email: email,
              customer_phone: phone,
            });
          }
          setOrderId(response.razorpay_payment_id);
          setStep("success");
          toast.success("Payment successful! 🎉");
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Lock className="w-5 h-5 text-success" />
                Secure Checkout
              </DialogTitle>
              <DialogDescription>
                Complete your details and pay securely with Razorpay
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Order Summary</h3>
                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{product.name}</h4>
                    {product.brand && <p className="text-sm text-muted-foreground">{product.brand}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">
                      {shipping === 0 ? (
                        <Badge variant="secondary" className="bg-success/20 text-success">Free</Badge>
                      ) : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-foreground">₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary text-lg">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" />Secure
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4 text-success" />Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-success" />Fast Delivery
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Your Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <Input id="phone" placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} className="mt-1" />
                  </div>
                </div>

                <Separator />

                <h4 className="font-medium text-foreground text-sm">Delivery Address</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="address" className="text-sm">Address</Label>
                    <Input id="address" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city" className="text-sm">City</Label>
                      <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="text-sm">PIN Code</Label>
                      <Input id="pincode" placeholder="123456" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} className="mt-1" />
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={initiateRazorpayPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ₹{total.toFixed(2)} with Razorpay
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Powered by Razorpay • Cards, UPI, Net Banking, Wallets supported
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">Your order has been placed successfully.</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg inline-block">
              <p className="text-sm text-muted-foreground">Payment ID</p>
              <p className="font-mono font-bold text-foreground">{orderId}</p>
            </div>
            <div className="flex gap-4 p-4 bg-muted/20 rounded-lg max-w-xs mx-auto">
              <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
              <div className="text-left">
                <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                <p className="text-lg font-bold text-primary">₹{total.toFixed(2)}</p>
              </div>
            </div>
            <Button variant="hero" onClick={handleClose}>Continue Shopping</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
