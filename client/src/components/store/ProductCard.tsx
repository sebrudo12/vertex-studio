import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, isInCart } = useCart();
  const added = isInCart(product.id);

  return (
    <div className="group relative rounded-2xl bg-dark-850/80 border border-white/5 hover:border-[var(--brand-primary)]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--brand-glow)]/10 flex flex-col overflow-hidden backdrop-blur-sm">
      
      {/* Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-dark-800">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-850 via-transparent to-transparent opacity-80" />

        {/* Category & Version Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-dark-900/80 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {product.category}
          </span>
          {product.featured ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border border-[var(--brand-primary)]/40 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              FEATURED
            </span>
          ) : null}
        </div>

        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/60 backdrop-blur-md text-gray-300 border border-white/10">
            v{product.version}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Framework Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {product.frameworks && product.frameworks.map((fw) => (
              <span
                key={fw}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
              >
                {fw}
              </span>
            ))}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
            {product.title}
          </h3>

          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
              Instant Delivery
            </span>
            <span className="text-lg font-extrabold text-white">
              €{parseFloat(product.price as string).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/store/${product.slug}`}
              className="p-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-gray-300 hover:text-white border border-white/5 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => addItem(product)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                added
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-black shadow-md shadow-[var(--brand-glow)]'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};