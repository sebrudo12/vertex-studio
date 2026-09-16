import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Downloads() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get("/me/products").then((r) => setProducts(r.data)); }, []);

  const download = async (pid, active) => {
    if (!active) return toast.error("License is not active");
    try {
      const { data } = await api.get(`/downloads/${pid}`);
      toast.success(`Downloading ${data.filename}`);
      window.open(data.url, "_blank");
    } catch (e) { toast.error("Download failed"); }
  };

  if (products.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">
      No downloads available. <Link to="/store" className="text-white hover:underline">Buy a resource</Link> to unlock downloads.
    </div>;

  return (
    <div className="rounded-2xl border border-white/10 bg-card divide-y divide-white/10">
      {products.map((p) => {
        const active = p.license?.status?.toLowerCase() === "active";
        return (
          <div key={p.id} className="flex items-center gap-4 p-4">
            <img src={p.image} alt={p.name} className="h-12 w-16 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="font-mono text-xs text-muted-foreground truncate">{p.download_filename}</div>
            </div>
            <Button size="sm" onClick={() => download(p.id, active)} disabled={!active} data-testid={`dl-${p.slug}`}
              className="bg-white text-black hover:bg-white/90 font-semibold disabled:opacity-40">
              <Download className="h-3.5 w-3.5 mr-1" /> {active ? "Download" : p.license?.status}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
