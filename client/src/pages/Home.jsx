import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Star, Zap, Shield, Package, Gauge } from "lucide-react";
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

export default function Home() {
  const { settings } = useAuth();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const discord = settings?.discord;
  const stats = settings?.stats || {};

  useEffect(() => {
    api.get("/products")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data.slice(0, 6) : []))
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
        <div className="absolute inset-0 grid-bg" />
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

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="relative">
              <div className="absolute -inset-6 bg-white/5 blur-3xl rounded-full" />
              <div className="relative rounded-2xl border border-white/10 overflow-hidden glass animate-floaty">
                <img src={HERO_UI} alt="Vertex UI preview" className="w-full aspect-[4/3] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div>
                    <div className="font-display text-sm font-bold text-white">Vertex Mechanics</div>
                    <div className="text-[11px] text-muted-foreground font-mono">NUI · Optimized · v2.1.0</div>
                  </div>
                  <span className="text-xs font-mono text-emerald-300 flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" /> 0.02ms
                  </span>
                </div>
              </div>
            </motion.div>
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
          {(Array.isArray(products) ? products : []).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
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
