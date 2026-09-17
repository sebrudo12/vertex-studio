import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Star, Zap, Shield, Package, Gauge, ChevronLeft, ChevronRight, Sparkles, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

const HERO_UI = "https://images.unsplash.com/photo-1725544014976-5c60cc9fc1fd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400";

function Counter({ value, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="text-center sm:text-left">
      <div className="font-display font-black text-3xl sm:text-4xl lg:text-5xl chrome-text">{value}</div>
      <div className="mt-1 text-xs sm:text-sm uppercase tracking-widest text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function FeaturedHeroShowcase({ products }) {
  const featured = (Array.isArray(products) ? products : []).filter((p) => p.featured);
  const items = featured.length > 0 ? featured : (Array.isArray(products) ? products : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, isHovered]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative group"
      >
        <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative rounded-2xl border border-white/15 overflow-hidden glass shadow-2xl p-8 sm:p-10 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Vertex Studio 2.0
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Servidor Activo
              </span>
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-snug">
              Próximamente Recursos Exclusivos
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Los recursos y scripts destacados que crees desde el panel de administración aparecerán aquí automáticamente en este carrusel interactivo.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono text-muted-foreground">
              Desarrollado para FiveM · QBCore · ESX · Qbox
            </div>
            <Button asChild size="sm" className="bg-white text-black hover:bg-white/90 font-semibold">
              <Link to="/store">
                Ir a la Tienda <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const safeIndex = currentIndex % items.length;
  const current = items[safeIndex] || items[0];

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const free = Number(current.price) === 0;
  const frameworks = Array.isArray(current.frameworks) ? current.frameworks : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic ambient backdrop glow */}
      <div className="absolute -inset-6 bg-white/10 blur-3xl rounded-full pointer-events-none transition-all duration-700 group-hover:bg-white/15" />

      {/* Main card */}
      <div className="relative rounded-2xl border border-white/15 overflow-hidden glass shadow-2xl backdrop-blur-xl">
        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-semibold backdrop-blur-md shadow-lg">
              <Sparkles className="h-3 w-3 fill-amber-400 text-amber-400" />
              Destacado
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-white/90 backdrop-blur-md shadow-lg">
              {current.category || "Script"}
            </span>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/75 border border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-lg flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v{current.version || "1.0.0"}
          </span>
        </div>

        {/* Product Image Link */}
        <Link to={`/store/${current.slug}`} className="block relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden group/img">
          <motion.img
            key={current.slug || current.id}
            src={current.image || current.thumbnail || HERO_UI}
            alt={current.name || current.title}
            initial={{ opacity: 0.8, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-[#09090d]/30 to-transparent" />
        </Link>

        {/* Carousel Arrows (if multiple products) */}
        {items.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/3 -translate-y-1/2 z-30 h-9 w-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-black transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/3 -translate-y-1/2 z-30 h-9 w-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-white hover:text-black transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-xl cursor-pointer"
              aria-label="Siguiente producto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Details & Action Panel */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#0e0e14]/95 to-[#08080c]/98 border-t border-white/10 backdrop-blur-2xl">
          {/* Framework tags */}
          {frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {frameworks.slice(0, 4).map((fw) => (
                <span
                  key={fw}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-300"
                >
                  {fw}
                </span>
              ))}
            </div>
          )}

          <div>
            <Link to={`/store/${current.slug}`} className="hover:text-primary transition-colors">
              <h3 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight line-clamp-1">
                {current.name || current.title}
              </h3>
            </Link>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {current.short_description}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Precio</span>
              <span className="font-display font-black text-xl sm:text-2xl text-white">
                {free ? "Gratis" : `€${Number(current.price).toFixed(2)}`}
              </span>
            </div>

            <Button
              asChild
              size="default"
              className="bg-white text-black hover:bg-white/90 font-semibold group/btn px-5 shadow-lg"
            >
              <Link to={`/store/${current.slug}`}>
                Ver Producto
                <ArrowUpRight className="h-4 w-4 ml-1.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Link>
            </Button>
          </div>

          {/* Dots Indicator */}
          {items.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id || item.slug || i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === safeIndex ? "w-6 bg-white" : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { settings } = useAuth();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const discord = settings?.discord;
  const stats = settings?.stats || {};

  useEffect(() => {
    api.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]));
    api.get("/reviews")
      .then((r) => setReviews(Array.isArray(r.data) ? r.data.slice(0, 3) : []))
      .catch(() => setReviews([]));
    api.get("/announcements")
      .then((r) => setAnnouncements(Array.isArray(r.data) ? r.data.slice(0, 2) : []))
      .catch(() => setAnnouncements([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Cinematic Banner Ambient Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/banner.png"
            alt="Vertex Studio Banner"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-[#080808]/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/40 to-[#080808]" />
        </div>
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 radial-glow" />
        <div className="vx-container relative pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Vertex Studio · Premium FiveM Development
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
                className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
                Premium FiveM<br />Resources.<br /><span className="chrome-text">Built Different.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Powerful, optimized and beautifully designed resources built to take your FiveM server to the next level.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
                className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" data-testid="hero-explore"
                  className="bg-white text-black hover:bg-white/90 font-semibold btn-shine h-12 px-7">
                  <Link to="/store">Explore Scripts <ArrowRight className="h-4 w-4 ml-2" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" data-testid="hero-discord"
                  className="border-white/20 hover:bg-white/5 h-12 px-7">
                  <a href={discord?.invite || "#"} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" /> Join Discord
                  </a>
                </Button>
              </motion.div>
            </div>

            <FeaturedHeroShowcase products={products} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 bg-[#0a0a0c]">
        <div className="vx-container py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Counter value={stats.resources || "50+"} label="Resources" />
          <Counter value={stats.customers || "1,000+"} label="Customers" />
          <Counter value={stats.feedback || "99%"} label="Positive Feedback" />
          <Counter value={stats.support || "24/7"} label="Support" />
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="vx-container py-16 grid sm:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Optimized Performance", desc: "Every resource is profiled and tuned for the lowest possible resmon." },
          { icon: Shield, title: "Framework Ready", desc: "QBCore, Qbox and ESX support with clean, documented configuration." },
          { icon: Package, title: "Instant Delivery", desc: "Buy once, download instantly with a unique license attached to you." },
        ].map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.08 }} className="rounded-2xl border border-white/10 bg-card p-6 card-glow transition-all">
            <f.icon className="h-6 w-6 text-white" />
            <h3 className="mt-4 font-display font-bold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* BRAND BANNER SHOWCASE */}
      <section className="vx-container py-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl group"
        >
          <img
            src="/banner.png"
            alt="Vertex Studio - FiveM Scripts"
            className="w-full h-auto max-h-[380px] object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-transparent to-black/30 pointer-events-none" />
          <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            <span className="text-xs font-mono text-white/80 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Official Vertex Studio FiveM Scripts
            </span>
            <span className="text-xs font-mono text-white/60">
              QBCore · ESX · Qbox Compatible · Vertex Escrow DRM
            </span>
          </div>
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="vx-container py-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Vertex Store</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl mt-1">Featured Resources</h2>
          </div>
          <Button asChild variant="ghost" data-testid="home-viewall" className="hover:bg-white/5">
            <Link to="/store">View all <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(products) && products.length > 0) ? (
            products.slice(0, 6).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          ) : (
            <div className="col-span-full rounded-2xl border border-white/10 bg-card/40 p-12 text-center backdrop-blur-sm">
              <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-display font-bold text-lg text-white">No hay recursos disponibles aún</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Los nuevos recursos añadidos desde el panel de administración se mostrarán aquí de forma automática.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="vx-container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Reviews</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-1">What our customers say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(Array.isArray(reviews) ? reviews : []).map((r, i) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.08 }} className="rounded-2xl border border-white/10 bg-card p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className={`h-4 w-4 ${k < (r.rating || 5) ? "fill-white text-white" : "text-white/20"}`} />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">"{r.comment || ""}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center font-display font-bold text-sm">
                  {(r.username || "U")[0]}
                </span>
                <div>
                  <div className="text-sm font-semibold">{r.username || "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">{r.product || "FiveM Resource"}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DISCORD CTA */}
      <section className="vx-container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#101015] to-[#0a0a0c] p-10 lg:p-16">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl">Join the {discord?.name || "Vertex Studio"} community</h2>
              <p className="mt-3 text-muted-foreground max-w-lg">Get support, previews and early access. Connect with thousands of server owners and developers.</p>
              <div className="mt-5 flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {(discord?.online || 0).toLocaleString()} online</span>
                <span className="text-muted-foreground">{(discord?.members || 0).toLocaleString()} members</span>
              </div>
            </div>
            <Button asChild size="lg" data-testid="cta-discord" className="bg-white text-black hover:bg-white/90 font-semibold btn-shine h-12 px-8 shrink-0">
              <a href={discord?.invite || "#"} target="_blank" rel="noreferrer"><MessageCircle className="h-5 w-5 mr-2" /> Join Server</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
