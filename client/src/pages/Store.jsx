import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import api from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Scripts", "UI", "Framework", "Vehicles", "Maps", "Misc"];

export default function Store() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = active === "All" || p.category === active;
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase()) || p.short_description.toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div>
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="vx-container relative py-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Vertex Store</p>
          <h1 className="font-display font-black uppercase text-4xl sm:text-5xl mt-2">The Store</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">Premium, optimized resources for every framework. Buy once, own forever.</p>
        </div>
      </section>

      <div className="vx-container py-10">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} data-testid={`filter-${c.toLowerCase()}`} onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  active === c ? "bg-white text-black border-white" : "border-white/15 text-muted-foreground hover:text-white hover:border-white/40"
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input data-testid="store-search" placeholder="Search resources..." value={q} onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-card border-white/10" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground">No resources found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
