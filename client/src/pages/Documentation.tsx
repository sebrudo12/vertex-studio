import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Search, Copy, Check, ChevronRight, Terminal, HelpCircle, Layers } from 'lucide-react';
import api from '../services/api';
import { Product, ProductDoc } from '../types';
import { useToast } from '../context/ToastContext';

export const Documentation: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [docs, setDocs] = useState<ProductDoc[]>([]);
  const [activeSection, setActiveSection] = useState<string>('installation');
  const [search, setSearch] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get('/products');
        const prods = res.data.products || [];
        setProducts(prods);

        // Select either requested slug or first product
        const initial = slug
          ? prods.find((p: Product) => p.slug === slug) || prods[0]
          : prods[0];

        setSelectedProduct(initial);
      } catch (err) {
        console.error('Failed to load products for docs:', err);
      }
    }
    loadProducts();
  }, [slug]);

  useEffect(() => {
    async function loadDocs() {
      if (!selectedProduct) return;
      try {
        const res = await api.get(`/products/${selectedProduct.slug}/docs`);
        const sections = res.data.sections || [];
        setDocs(sections);
        if (sections.length > 0) {
          setActiveSection(sections[0].section_slug);
        }
      } catch (err) {
        console.error('Failed to load documentation sections:', err);
      }
    }
    loadDocs();
  }, [selectedProduct]);

  const currentDoc = docs.find((d) => d.section_slug === activeSection) || docs[0];

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    showToast('Code copied to clipboard', 'info');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.section_title.toLowerCase().includes(search.toLowerCase()) ||
      d.content_markdown.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Developer Documentation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-display">
            Vertex Knowledge Base
          </h1>
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">Resource:</span>
          <select
            value={selectedProduct?.slug || ''}
            onChange={(e) => {
              const p = products.find((prod) => prod.slug === e.target.value);
              if (p) setSelectedProduct(p);
            }}
            className="px-4 py-2 rounded-xl bg-dark-850 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-[var(--brand-primary)]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title} (v{p.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Documentation Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search guide..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-850 border border-white/5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="p-3 rounded-2xl bg-dark-850/70 border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1">
              Table of Contents
            </div>
            {filteredDocs.map((d) => {
              const active = d.section_slug === activeSection;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveSection(d.section_slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[var(--brand-primary)] text-black font-bold shadow-md shadow-[var(--brand-glow)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{d.section_title}</span>
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Article View */}
        <div className="lg:col-span-9">
          <div className="p-8 sm:p-10 rounded-2xl bg-dark-850/50 border border-white/5 backdrop-blur-sm min-h-[500px]">
            {currentDoc ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-2xl font-bold text-white font-display">
                    {currentDoc.section_title}
                  </h2>
                  <span className="text-xs font-mono text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-md border border-[var(--brand-primary)]/20">
                    {selectedProduct?.title}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-line space-y-4">
                  {currentDoc.content_markdown}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No documentation found for this section.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};