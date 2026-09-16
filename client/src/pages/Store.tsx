import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { ProductCard } from '../components/store/ProductCard';

const CATEGORIES = ['All', 'Scripts', 'UI', 'Framework', 'Vehicles', 'Maps', 'Misc'];
const FRAMEWORKS = ['All', 'QBCore', 'ESX', 'Qbox', 'Standalone'];

export const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [framework, setFramework] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category !== 'All') params.category = category;
        if (framework !== 'All') params.framework = framework;
        if (search.trim()) params.search = search.trim();

        const res = await api.get('/products', { params });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [category, framework, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-850 border border-white/10 text-xs font-semibold text-[var(--brand-primary)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vertex Studio Official Store</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          Explore Premium FiveM Scripts
        </h1>
        <p className="text-sm text-gray-400">
          Supercharge your FiveM server with high-FPS UI, advanced mechanic roleplay, and robust standalone utilities.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-dark-850/80 border border-white/5 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search scripts, mechanics, UI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900 border border-white/10 focus:border-[var(--brand-primary)] text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Framework Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-semibold mr-1 hidden lg:inline">
              Framework:
            </span>
            {FRAMEWORKS.map((fw) => (
              <button
                key={fw}
                onClick={() => setFramework(fw)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  framework === fw
                    ? 'bg-[var(--brand-primary)] text-black font-bold shadow-md shadow-[var(--brand-glow)]'
                    : 'bg-dark-900 hover:bg-white/5 text-gray-300 border border-white/5'
                }`}
              >
                {fw}
              </button>
            ))}
          </div>

        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-white/5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-2xl bg-dark-850/50 border border-white/5 aspect-square animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-dark-850/30 border border-white/5">
          <SlidersHorizontal className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No products found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting your framework filters.
          </p>
          <button
            onClick={() => {
              setCategory('All');
              setFramework('All');
              setSearch('');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};
