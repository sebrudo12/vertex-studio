import { useEffect, useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

const COLOR = { Active: "text-emerald-300", Expired: "text-amber-300", Revoked: "text-red-400" };

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const load = () => api.get("/admin/licenses").then((r) => setLicenses(r.data));
  useEffect(() => { load(); }, []);

  const act = async (id, action) => { await api.post(`/admin/licenses/${id}/${action}`); toast.success("Updated"); load(); };

  return (
    <div>
      <h1 className="font-display font-black text-2xl mb-6">Licenses</h1>
      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground"><tr>
            <th className="text-left font-medium px-4 py-3">Key</th>
            <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Owner</th>
            <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Product</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-right font-medium px-4 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {licenses.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No licenses yet.</td></tr> :
              licenses.map((l) => (
                <tr key={l.id} data-testid={`admin-license-${l.id}`}>
                  <td className="px-4 py-3 font-mono text-xs">{l.key}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{l.user_email}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{l.product_name}</td>
                  <td className="px-4 py-3"><span className={`text-xs ${COLOR[l.status]}`}>{l.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "Active" ? (
                      <Button size="sm" variant="outline" onClick={() => act(l.id, "revoke")} data-testid={`revoke-${l.id}`} className="border-white/15 hover:bg-white/5 text-red-400"><Ban className="h-3.5 w-3.5 mr-1" /> Revoke</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => act(l.id, "reactivate")} data-testid={`reactivate-${l.id}`} className="border-white/15 hover:bg-white/5"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reactivate</Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
