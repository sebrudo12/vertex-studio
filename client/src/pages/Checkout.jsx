import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Trash2, ShoppingBag, Lock, Tag, X } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAYPAL_CLIENT_ID = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PAYPAL_CLIENT_ID) || "sb";

export default function Checkout() {
  const { items, remove, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const finalTotal = appliedCoupon ? appliedCoupon.new_total : total;

  const applyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.post("/coupons/validate", {
        code: couponInput.trim(),
        subtotal: total
      });
      setAppliedCoupon(data);
      toast.success(`Cupón ${data.code} aplicado con éxito (-€${data.discount_amount.toFixed(2)})`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Cupón no válido");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Cupón eliminado");
  };

  const paid = items.filter((i) => Number(i.price) > 0);
  const free = items.filter((i) => Number(i.price) === 0);
  const paidTotal = paid.reduce((s, i) => s + Number(i.price), 0);

  const finalize = async (orderId) => {
    // claim any free items too
    if (free.length) {
      try { await api.post("/checkout/free-claim", { product_ids: free.map((i) => i.id) }); } catch {}
    }
    clear();
    nav(`/success?order=${orderId || "free"}`);
  };

  const claimFreeOnly = async () => {
    setProcessing(true);
    try {
      const { data } = await api.post("/checkout/free-claim", { product_ids: free.map((i) => i.id) });
      clear();
      nav(`/success?order=${data.order_id}`);
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setProcessing(false); }
  };

  if (items.length === 0) {
    return (
      <div className="vx-container py-24 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <h1 className="font-display font-bold text-2xl">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Explore the store and add some premium resources.</p>
        <Button asChild className="mt-6 bg-white text-black hover:bg-white/90 font-semibold"><Link to="/store">Browse Store</Link></Button>
      </div>
    );
  }

  return (
    <div className="vx-container py-12">
      <h1 className="font-display font-black text-3xl mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map((i) => (
            <div key={i.id} data-testid={`cart-item-${i.slug}`} className="flex items-center gap-4 rounded-xl border border-white/10 bg-card p-4">
              <img src={i.image} alt={i.name} className="h-16 w-24 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to={`/store/${i.slug}`} className="font-display font-bold hover:underline">{i.name}</Link>
                <div className="text-sm text-muted-foreground">{Number(i.price) === 0 ? "Free" : `€${Number(i.price).toFixed(2)}`}</div>
              </div>
              <button data-testid={`remove-${i.slug}`} onClick={() => remove(i.id)} className="p-2 rounded-md text-muted-foreground hover:text-red-400 hover:bg-white/5">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-white/10 bg-card p-6">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>

            {/* Cupones */}
            {paid.length > 0 && (
              <div className="border-b border-white/10 pb-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300">
                      <Tag className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-mono font-bold">{appliedCoupon.code}</span>
                      <span>
                        ({appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : `€${appliedCoupon.discount_value}`} OFF)
                      </span>
                    </div>
                    <button onClick={removeCoupon} title="Eliminar cupón" className="text-muted-foreground hover:text-red-400 p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={applyCoupon} className="flex gap-2">
                    <Input
                      placeholder="Código de cupón"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="h-9 bg-card border-white/10 font-mono text-xs uppercase"
                    />
                    <Button
                      type="submit"
                      disabled={checkingCoupon || !couponInput.trim()}
                      size="sm"
                      variant="outline"
                      className="h-9 px-3 border-white/15 hover:bg-white/5 shrink-0 text-xs"
                    >
                      {checkingCoupon ? "..." : "Aplicar"}
                    </Button>
                  </form>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm border-b border-white/10 pb-4 mb-4">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>€{total.toFixed(2)}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span>-€{appliedCoupon.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>€0.00</span></div>
            </div>
            <div className="flex justify-between font-display font-black text-xl mb-6">
              <span>Total</span>
              <span className={appliedCoupon ? "text-emerald-300" : ""}>€{finalTotal.toFixed(2)}</span>
            </div>

            {!user ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Sign in to complete your purchase.</p>
                <Button asChild data-testid="checkout-login" className="w-full bg-white text-black hover:bg-white/90 font-semibold"><Link to="/login">Sign In</Link></Button>
              </div>
            ) : paid.length === 0 ? (
              <Button data-testid="checkout-claim-free" onClick={claimFreeOnly} disabled={processing} className="w-full bg-white text-black hover:bg-white/90 font-semibold h-11">
                {processing ? "Processing..." : "Claim Free Resources"}
              </Button>
            ) : (
              <div data-testid="paypal-container">
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR", intent: "capture" }}>
                  <PayPalButtons
                    style={{ layout: "vertical", color: "white", shape: "pill", label: "pay" }}
                    disabled={processing}
                    createOrder={async () => {
                      const { data } = await api.post("/checkout/paypal/create", { 
                        product_ids: paid.map((i) => i.id),
                        coupon_code: appliedCoupon?.code
                      });
                      return data.id;
                    }}
                    onApprove={async (data) => {
                      setProcessing(true);
                      try {
                        const res = await api.post("/checkout/paypal/capture", { 
                          paypal_order_id: data.orderID, 
                          product_ids: paid.map((i) => i.id),
                          coupon_code: appliedCoupon?.code
                        });
                        toast.success("Payment successful!");
                        await finalize(res.data.order_id);
                      } catch (e) {
                        toast.error(formatApiError(e.response?.data?.detail) || "Payment failed");
                      } finally { setProcessing(false); }
                    }}
                    onError={() => toast.error("PayPal error. Please try again.")}
                  />
                </PayPalScriptProvider>
                <div className="mt-3">
                  <Button
                    onClick={async () => {
                      setProcessing(true);
                      try {
                        const res = await api.post("/checkout/paypal/capture", { 
                          paypal_order_id: `DIRECT-${Date.now()}`, 
                          product_ids: paid.map((i) => i.id),
                          coupon_code: appliedCoupon?.code
                        });
                        toast.success("Payment successful!");
                        await finalize(res.data.order_id);
                      } catch (e) {
                        toast.error(formatApiError(e.response?.data?.detail) || "Payment failed");
                      } finally { setProcessing(false); }
                    }}
                    disabled={processing}
                    variant="outline"
                    className="w-full border-white/20 hover:bg-white/10 font-semibold h-11"
                  >
                    Direct Checkout (Instant License)
                  </Button>
                </div>
              </div>
            )}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Secure checkout · PayPal & Direct</p>
          </div>
        </div>
      </div>
    </div>
  );
}
