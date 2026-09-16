import { useEffect, useState } from "react";
import { Copy, Key } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const STATUS = {
  Active: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  Expired: "text-amber-300 bg-amber-400/10 border-amber-400/20",
  Revoked: "text-red-300 bg-red-400/10 border-red-400/20",
};

export default function Licenses() {
  const [licenses, setLicenses] = useState([]);
  useEffect(() => { api.get("/me/licenses").then((r) => setLicenses(r.data)); }, []);

  const copy = (key) => { navigator.clipboard.writeText(key); toast.success("License key copied"); };

  if (licenses.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">No licenses yet.</div>;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {licenses.map((l) => (
        <div key={l.id} data-testid={`license-${l.id}`} className="rounded-2xl border border-white/10 bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /><span className="font-display font-bold">{l.product_name}</span></div>
            <span className={`text-[11px] px-2 py-0.5 rounded border ${STATUS[l.status] || STATUS.Active}`}>{l.status}</span>
          </div>
          <button onClick={() => copy(l.key)} data-testid={`copy-license-${l.id}`}
            className="group w-full flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0b0b10] px-3 py-2.5 hover:border-white/30 transition-colors">
            <span className="font-mono text-sm">{l.key}</span>
            <Copy className="h-4 w-4 text-muted-foreground group-hover:text-white" />
          </button>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Purchased {new Date(l.created_at).toLocaleDateString()}</span>
            <span>{l.expires ? `Expires ${new Date(l.expires).toLocaleDateString()}` : "Lifetime"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
