import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Zap, Calendar, Package, Layers, Star, ArrowLeft, Download } from "lucide-react";
import api from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [active, setActive] = useState(0);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    api.get(`/products/${slug}`).then((r) => { setProduct(r.data); setActive(0); }).catch(() => nav("/store"));
  }, [slug]);

  useEffect(() => {
    if (user && product) {
      api.get("/me/products").then((r) => setOwned(r.data.some((p) => p.id === product.id))).catch(() => {});
    }
  }, [user, product]);

  if (!product) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading...</div>;

  const free = Number(product.price) === 0;

  const claimFree = async () => {
    if (!user) return nav("/login");
    try {
      await api.post("/checkout/free-claim", { product_ids: [product.id] });
      toast.success("Added to your account");
      setOwned(true);
    } catch (e) { toast.error("Could not claim"); }
  };

  const gallery = product.gallery?.length ? product.gallery : [product.image];

  return (
    <div className="vx-container py-10">
      <Link to="/store" data-testid="back-to-store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to store
      </Link>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* LEFT: gallery + description */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-mono uppercase px-2 py-1 rounded bg-white/5 border border-white/10 text-muted-foreground">{product.category}</span>
              <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20 text-emerald-300">{product.status}</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl">{product.name}</h1>
            <p className="mt-3 text-muted-foreground">{product.short_description}</p>
          </div>

          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/10 overflow-hidden bg-card">
            <img src={gallery[active]} alt={product.name} className="w-full aspect-video object-cover" />
          </motion.div>
          {gallery.length > 1 && (
            <div className="flex gap-3">
              {gallery.map((g, i) => (
                <button key={i} data-testid={`gallery-thumb-${i}`} onClick={() => setActive(i)}
                  className={`h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${active === i ? "border-white" : "border-white/10 opacity-60 hover:opacity-100"}`}>
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div>
            <h2 className="font-display font-bold text-xl mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <div>
            <h2 className="font-display font-bold text-xl mb-4">Features</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {product.features?.map((f) => (
                <div key={f} className="flex items-center gap-3 rounded-xl border border-white/10 bg-card px-4 py-3">
                  <span className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Check className="h-3.5 w-3.5 text-white" /></span>
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {product.reviews?.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl mb-4">Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-white/10 bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{r.username}</span>
                      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? "fill-white text-white" : "text-white/20"}`} />)}</div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: sticky purchase */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="font-display font-black text-3xl">{free ? "Free" : `€${Number(product.price).toFixed(2)}`}</div>
              <div className="mt-1 text-xs text-muted-foreground">One-time payment · Lifetime updates</div>

              {owned ? (
                <Button asChild data-testid="go-downloads" className="w-full mt-5 bg-white text-black hover:bg-white/90 font-semibold h-11">
                  <Link to="/dashboard/downloads"><Download className="h-4 w-4 mr-2" /> Download</Link>
                </Button>
              ) : free ? (
                <Button data-testid="claim-free" onClick={claimFree} className="w-full mt-5 bg-white text-black hover:bg-white/90 font-semibold h-11">
                  <Download className="h-4 w-4 mr-2" /> Get for Free
                </Button>
              ) : (
                <div className="mt-5 space-y-2">
                  <Button data-testid="add-to-cart" onClick={() => add(product)} className="w-full bg-white text-black hover:bg-white/90 font-semibold h-11">
                    <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                  </Button>
                  <Button data-testid="buy-now" variant="outline" onClick={() => { add(product); nav("/checkout"); }}
                    className="w-full border-white/20 hover:bg-white/5 h-11">
                    Buy Now
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-card p-6 space-y-4 text-sm">
              <Info icon={Layers} label="Framework" value={product.frameworks?.join(" / ")} />
              <Info icon={Package} label="Version" value={`v${product.version}`} />
              <Info icon={Calendar} label="Last Update" value={new Date(product.last_updated).toLocaleDateString()} />
              <Info icon={Zap} label="Compatibility" value={product.frameworks?.join(", ")} />
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2"><Package className="h-4 w-4" /> Dependencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {product.dependencies?.map((d) => <span key={d} className="font-mono text-[11px] px-2 py-1 rounded bg-white/5 border border-white/10">{d}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /> {label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
