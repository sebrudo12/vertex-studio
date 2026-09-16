import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-900 border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-brand-primary">
                <ShoppingBag className="w-5 h-5 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Your Cart</h2>
                <p className="text-xs text-gray-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <ShoppingBag className="w-12 h-12 stroke-1 text-gray-600 mb-3" />
                <p className="font-medium text-white mb-1">Your cart is empty</p>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                  Explore our premium FiveM scripts and enhance your server today.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/store');
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-dark-850 border border-white/5 hover:border-white/10 transition-all duration-200"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover bg-dark-800 border border-white/5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{item.category} • v{item.version}</p>
                    <div className="text-sm font-bold text-[var(--brand-primary)] mt-1">
                      €{parseFloat(item.price as string).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/5 bg-dark-850/50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-xl font-bold text-white">€{totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Instant automated delivery & license activation</span>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  navigate('/checkout');
                }}
                className="w-full py-3 px-4 rounded-xl font-semibold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all duration-200 shadow-lg shadow-[var(--brand-glow)] flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};