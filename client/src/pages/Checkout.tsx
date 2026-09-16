import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Checkout: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'test_sandbox'>('stripe');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto stroke-1" />
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-sm text-gray-400">
          Browse our store and add resources to your cart before proceeding to checkout.
        </p>
        <Link
          to="/store"
          className="inline-block px-6 py-3 rounded-xl font-bold text-black bg-[var(--brand-primary)]"
        >
          Explore Scripts
        </Link>
      </div>
    );
  }

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please log in or register before completing checkout to bind your licenses', 'warning');
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/orders/checkout', {
        items,
        paymentMethod,
      });

      const { orderId, orderNumber, totalAmount, licenses } = res.data;
      clearCart();

      navigate('/success', {
        state: {
          orderId,
          orderNumber,
          totalAmount,
          licenses,
        },
      });
    } catch (err: any) {
      console.error('Checkout error:', err);
      showToast(err.response?.data?.error || 'Payment failed to process', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
          Complete Your Order
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Instant delivery. Your unique FiveM license keys will be generated immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProcessOrder} className="space-y-6">
            
            {/* Account Confirmation */}
            <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Account
              </h3>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-900 border border-white/5">
                  <img
                    src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">{user.username}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  You are not logged in. <Link to="/login?redirect=/checkout" className="underline font-bold">Log in</Link> or <Link to="/register?redirect=/checkout" className="underline font-bold">Register</Link> to attach licenses to your account.
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    paymentMethod === 'stripe'
                      ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-white'
                      : 'bg-dark-900 border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[var(--brand-primary)]" />
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                  <span className="text-[10px] text-gray-500">Stripe Gateway</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    paymentMethod === 'paypal'
                      ? 'bg-[#0070BA]/20 border-[#0070BA] text-white'
                      : 'bg-dark-900 border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-display font-extrabold text-lg text-[#0070BA]">PayPal</div>
                  <span className="text-xs font-bold">PayPal Account</span>
                  <span className="text-[10px] text-gray-500">Global Payments</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('test_sandbox')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                    paymentMethod === 'test_sandbox'
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-dark-900 border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-bold">Instant Sandbox</span>
                  <span className="text-[10px] text-gray-500">Fast Dev Test</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit encrypted checkout. Instant automated FiveM license provisioning.</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all shadow-xl shadow-[var(--brand-glow)] flex items-center justify-center gap-2 disabled:opacity-50 text-base"
            >
              {loading ? (
                <span>Generating Licenses & Processing...</span>
              ) : (
                <>
                  <span>Pay €{totalPrice.toFixed(2)} & Activate Now</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 backdrop-blur-md space-y-4 sticky top-28">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="divide-y divide-white/5 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover bg-dark-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-[10px] text-gray-400">v{item.version} • Lifetime License</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white shrink-0">
                    €{parseFloat(item.price as string).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>VAT / Tax</span>
                <span>€0.00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/5">
                <span>Total Due</span>
                <span className="text-[var(--brand-primary)]">€{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Automatic License Generation</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Immediate ZIP File Download</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};