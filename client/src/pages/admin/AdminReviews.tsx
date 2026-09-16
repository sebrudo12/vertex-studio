import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      showToast('Review removed', 'info');
      load();
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Review Moderation</h2>
        <p className="text-xs text-gray-400 mt-1">Approve, moderate, or remove customer feedback posted on script pages.</p>
      </div>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-dark-850/80 border border-white/5 flex items-start justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white">{r.username}</span>
                <span className="text-[10px] text-gray-500">Resource: <strong>{r.product_title}</strong></span>
                <div className="flex items-center text-amber-400 text-xs">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed italic">"{r.comment}"</p>
              <div className="text-[10px] text-gray-500">{r.created_at}</div>
            </div>

            <button
              onClick={() => handleDelete(r.id)}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
