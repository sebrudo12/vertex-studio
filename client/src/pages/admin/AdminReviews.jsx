import { useEffect, useState } from "react";
import { Check, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const load = () => api.get("/admin/reviews").then((r) => setReviews(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id) => { await api.post(`/admin/reviews/${id}/approve`); toast.success("Approved"); load(); };
  const del = async (id) => { await api.delete(`/admin/reviews/${id}`); toast.success("Deleted"); load(); };

  return (
    <div>
      <h1 className="font-display font-black text-2xl mb-6">Reviews</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.length === 0 && <div className="text-sm text-muted-foreground">No reviews.</div>}
        {reviews.map((r) => (
          <div key={r.id} data-testid={`admin-review-${r.id}`} className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <div><span className="font-semibold text-sm">{r.username}</span><span className="text-xs text-muted-foreground ml-2">{r.product}</span></div>
              <span className={`text-xs px-2 py-0.5 rounded border ${r.status === "approved" ? "text-emerald-300 border-emerald-400/20 bg-emerald-400/10" : "text-amber-300 border-amber-400/20 bg-amber-400/10"}`}>{r.status}</span>
            </div>
            <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`h-3.5 w-3.5 ${k < r.rating ? "fill-white text-white" : "text-white/20"}`} />)}</div>
            <p className="text-sm text-muted-foreground">"{r.comment}"</p>
            <div className="mt-4 flex gap-2">
              {r.status !== "approved" && <Button size="sm" onClick={() => approve(r.id)} data-testid={`approve-${r.id}`} className="bg-white text-black hover:bg-white/90"><Check className="h-3.5 w-3.5 mr-1" /> Approve</Button>}
              <Button size="sm" variant="outline" onClick={() => del(r.id)} data-testid={`del-review-${r.id}`} className="border-white/15 hover:bg-white/5 text-red-400"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
