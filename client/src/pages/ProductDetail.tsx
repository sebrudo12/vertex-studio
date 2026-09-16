import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, ShieldCheck, ArrowLeft, Star, FileText, History, Cpu, Download, CheckCircle, ExternalLink, Play } from 'lucide-react';
import api from '../services/api';
import { Product, Review, Changelog } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'changelog' | 'reviews'>('overview');
  const [selectedImage, setSelectedImage] = useState<string>('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
        setChangelogs(res.data.changelogs || []);
        setSelectedImage(res.data.product.thumbnail);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [slug]);

  const handleInstantBuy = () => {
    if (!product) return;
    addItem(product);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !comment.trim()) return;

    if (!isAuthenticated) {
      showToast('Please log in to submit a review', 'warning');
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: product.id,
        rating,
        comment: comment.trim(),
      });
      showToast('Review submitted successfully!', 'success');
      setComment('');
      const res = await api.get(`/products/${slug}`);
      setReviews(res.data.reviews || []);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">Product not found</h2>
        <Link to="/store" className="mt-4 inline-block text-[var(--brand-primary)] hover:underline">
          Return to store
        </Link>
      </div>
    );
  }

  const added = isInCart(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-dark-900 border border-white/10 aspect-video shadow-2xl">
            <img
              src={selectedImage || product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.video_url && (
              <a
                href={product.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Video Preview</span>
              </a>
            )}
          </div>

          {product.gallery && product.gallery.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.thumbnail)}
                className={`w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0 ${
                  selectedImage === product.thumbnail
                    ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30'
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={product.thumbnail} alt="Main" className="w-full h-full object-cover" />
              </button>
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-dark-850 border border-white/10 text-white">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-white/5 border border-white/10 text-gray-300">
                v{product.version}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Instant Automated Delivery
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {product.title}
            </h1>

            <p className="text-sm text-gray-400 leading-relaxed">
              {product.short_description}
            </p>

            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Supported Frameworks
              </span>
              <div className="flex flex-wrap gap-2">
                {product.frameworks && product.frameworks.map((fw) => (
                  <span
                    key={fw}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-dark-850 text-gray-200 border border-white/10"
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            {product.dependencies && product.dependencies.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Dependencies
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.dependencies.map((dep) => (
                    <span
                      key={dep}
                      className="px-2.5 py-0.5 rounded text-xs font-mono bg-white/5 text-gray-400 border border-white/5"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase">One-Time License</span>
              <span className="text-3xl font-extrabold text-white font-display">
                €{parseFloat(product.price as string).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addItem(product)}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-dark-750 hover:bg-dark-700 text-white border border-white/10'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{added ? 'In Cart' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleInstantBuy}
                className="py-3 px-4 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-all shadow-lg shadow-[var(--brand-glow)]"
              >
                Buy Now
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Includes FiveM license key, documentation & lifetime updates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'overview' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Description & Overview
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'features' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Features Checklist
            {activeTab === 'features' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'changelog' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Changelog ({changelogs.length})
            {activeTab === 'changelog' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-semibold transition-all relative ${
              activeTab === 'reviews' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-primary)]" />
            )}
          </button>
        </div>
      </div>

      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="max-w-4xl space-y-6">
            <div className="p-8 rounded-2xl bg-dark-850/40 border border-white/5 leading-relaxed text-gray-300 text-sm whitespace-pre-line">
              {product.description}
            </div>

            <div className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Need Installation Assistance?</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Read our full interactive documentation or contact our 24/7 support team.
                </p>
              </div>
              <Link
                to={`/documentation/${product.slug}`}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View Documentation</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {product.features && product.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl bg-dark-850/60 border border-white/5"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-gray-200">{feat}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'changelog' && (
          <div className="space-y-4 max-w-3xl">
            {changelogs.length === 0 ? (
              <p className="text-sm text-gray-400">No changelog entries yet.</p>
            ) : (
              changelogs.map((c) => (
                <div key={c.id} className="p-6 rounded-2xl bg-dark-850/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] font-mono text-xs font-bold">
                        v{c.version}
                      </span>
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    </div>
                    <span className="text-xs text-gray-500">{c.release_date}</span>
                  </div>

                  {c.content.added && c.content.added.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        Added
                      </span>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        {c.content.added.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {c.content.fixed && c.content.fixed.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                        Fixed
                      </span>
                      <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                        {c.content.fixed.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="max-w-4xl space-y-8">
            <form onSubmit={handleReviewSubmit} className="p-6 rounded-2xl bg-dark-850/80 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Write a Customer Review</h3>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 hover:scale-110 transition-transform ${
                        star <= rating ? 'text-amber-400' : 'text-gray-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                placeholder="Share your experience using this script on your FiveM server..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full p-3 rounded-xl bg-dark-900 border border-white/10 text-sm text-white placeholder-gray-500 focus:border-[var(--brand-primary)] focus:outline-none"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] transition-colors shadow-md disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet. Be the first to review this resource!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-5 rounded-xl bg-dark-850/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                          alt={r.username}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-sm font-bold text-white">{r.username}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed pl-10">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};