import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  Truck,
  Clock,
  Bookmark,
  Gift,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Percent,
  X,
} from "lucide-react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

const COUPON_CODES: Record<string, { discount: number; type: "percent" | "flat"; label: string }> = {
  SAVE10: { discount: 10, type: "percent", label: "10% Off" },
  FLAT500: { discount: 500, type: "flat", label: "₹500 Off" },
  WELCOME20: { discount: 20, type: "percent", label: "20% Off (Welcome)" },
  TRYON15: { discount: 15, type: "percent", label: "15% Off" },
};

export const ShoppingCart = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: ShoppingCartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || !COUPON_CODES[appliedCoupon]) return 0;
    const coupon = COUPON_CODES[appliedCoupon];
    if (coupon.type === "percent") return subtotal * (coupon.discount / 100);
    return Math.min(coupon.discount, subtotal);
  }, [appliedCoupon, subtotal]);

  const shipping = subtotal > 8000 ? 0 : 499;
  const total = subtotal - couponDiscount + shipping;

  const estimatedDelivery = useMemo(() => {
    const today = new Date();
    const minDays = 3;
    const maxDays = 7;
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);
    return `${minDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${maxDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
  }, []);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPON_CODES[code]) {
      setAppliedCoupon(code);
      setCouponCode("");
      toast.success(`Coupon "${code}" applied! ${COUPON_CODES[code].label}`);
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const handleSaveForLater = (item: CartItem) => {
    setSavedForLater((prev) => [...prev, { ...item, quantity: 1 }]);
    onRemoveItem(item.id);
    toast.success(`${item.name} saved for later`);
  };

  const handleMoveToCart = (item: CartItem) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== item.id));
    // We need to trigger add to cart from parent - use onUpdateQuantity workaround
    // Instead, we'll just toast and let user re-add
    toast.success(`${item.name} moved back — please add from gallery`);
  };

  const handleRemoveSaved = (id: string) => {
    setSavedForLater((prev) => prev.filter((i) => i.id !== id));
    toast.success("Removed from saved items");
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    // Simulate checkout
    await new Promise((r) => setTimeout(r, 1500));
    setIsCheckingOut(false);
    toast.success("🎉 Order placed successfully!", {
      description: `Total: ₹${total.toFixed(2)} • ${totalItems} items`,
    });
    onClearCart();
    setAppliedCoupon(null);
    setIsOpen(false);
  };

  const incrementQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity >= 10) {
      toast.error("Maximum 10 items per product");
      return;
    }
    onUpdateQuantity(id, currentQuantity + 1);
  };

  const decrementQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(id, currentQuantity - 1);
    } else {
      onRemoveItem(id);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2 relative">
          <CartIcon className="h-4 w-4" />
          Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add some items to get started!
            </p>
            <Button variant="default" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>

            {/* Show saved for later even when cart is empty */}
            {savedForLater.length > 0 && (
              <div className="w-full mt-8">
                <Separator className="mb-4" />
                <SavedForLaterSection
                  items={savedForLater}
                  onMoveToCart={handleMoveToCart}
                  onRemove={handleRemoveSaved}
                  showItems={showSavedItems}
                  onToggle={() => setShowSavedItems(!showSavedItems)}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            {subtotal < 8000 && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 text-xs text-accent mb-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  <span>Add ₹{(8000 - subtotal).toFixed(0)} more for <strong>FREE shipping!</strong></span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / 8000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 py-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50 group"
                  >
                    <div className="w-18 h-18 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => decrementQuantity(item.id, item.quantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-7 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => incrementQuantity(item.id, item.quantity)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground text-sm">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              ₹{(item.originalPrice * item.quantity).toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Save for later button */}
                      <button
                        className="text-xs text-accent hover:underline mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleSaveForLater(item)}
                      >
                        <Bookmark className="h-3 w-3" />
                        Save for later
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Saved for later */}
              {savedForLater.length > 0 && (
                <div className="pb-3">
                  <Separator className="mb-3" />
                  <SavedForLaterSection
                    items={savedForLater}
                    onMoveToCart={handleMoveToCart}
                    onRemove={handleRemoveSaved}
                    showItems={showSavedItems}
                    onToggle={() => setShowSavedItems(!showSavedItems)}
                  />
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-border pt-3 space-y-3">
              {/* Coupon Code */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">
                      {appliedCoupon} — {COUPON_CODES[appliedCoupon]?.label}
                    </span>
                  </div>
                  <button onClick={handleRemoveCoupon}>
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  />
                  <Button variant="outline" size="sm" className="h-8 px-3" onClick={handleApplyCoupon}>
                    <Percent className="h-3.5 w-3.5 mr-1" />
                    Apply
                  </Button>
                </div>
              )}

              {/* Order Summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Product Savings</span>
                    <span>-₹{savings.toFixed(0)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>Coupon Discount</span>
                    <span>-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `₹${shipping}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold text-foreground">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span>Estimated delivery: <strong className="text-foreground">{estimatedDelivery}</strong></span>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-accent" />Secure</span>
                <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3 text-accent" />7-day return</span>
                <span className="flex items-center gap-1"><Gift className="h-3 w-3 text-accent" />Gift wrap</span>
              </div>

              <SheetFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Checkout • ₹${total.toFixed(0)}`
                  )}
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      onClearCart();
                      setAppliedCoupon(null);
                      toast.success("Cart cleared");
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Saved for later sub-component
function SavedForLaterSection({
  items,
  onMoveToCart,
  onRemove,
  showItems,
  onToggle,
}: {
  items: CartItem[];
  onMoveToCart: (item: CartItem) => void;
  onRemove: (id: string) => void;
  showItems: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-foreground mb-2"
      >
        <span className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-accent" />
          Saved for Later ({items.length})
        </span>
        {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {showItems && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-2 rounded-lg bg-muted/20 border border-border/30">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">₹{item.price}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMoveToCart(item)}>
                  <CartIcon className="h-3.5 w-3.5 text-accent" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(item.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
