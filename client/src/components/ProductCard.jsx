import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const FW_COLOR = {
  QBCore: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  Qbox: "text-pink-300 border-pink-400/30 bg-pink-400/10",
  ESX: "text-purple-300 border-purple-400/30 bg-purple-400/10",
  Standalone: "text-slate-300 border-white/20 bg-white/5",
};

export function ProductCard({ product, index = 0 }) {
  const free = Number(product.price) === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
      data-testid={`product-card-${product.slug}`}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 card-glow"
    >
      <Link to={`/store/${product.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        <img src={product.image} alt={product.name} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-transparent to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-black/60 border border-white/10 text-white backdrop-blur">
          {product.category}
        </span>
        <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-1 rounded-md bg-black/60 border border-white/10 text-emerald-300 backdrop-blur flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {product.status}
        </span>
      </Link>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-bold text-lg leading-tight text-white">{product.name}</h3>
          <span className="font-mono text-[11px] text-muted-foreground shrink-0 mt-1">v{product.version}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{product.short_description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {(Array.isArray(product.frameworks) ? product.frameworks : []).slice(0, 3).map((fw) => (
            <span key={fw} className={`text-[10px] font-medium px-2 py-0.5 rounded border ${FW_COLOR[fw] || FW_COLOR.Standalone}`}>{fw}</span>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="font-display font-black text-xl text-white">
            {free ? "Free" : <>€{Number(product.price).toFixed(2)}</>}
          </div>
          <Button asChild size="sm" data-testid={`view-product-${product.slug}`}
            className="bg-white text-black hover:bg-white/90 font-semibold group/btn">
            <Link to={`/store/${product.slug}`}>
              View Product <ArrowUpRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
