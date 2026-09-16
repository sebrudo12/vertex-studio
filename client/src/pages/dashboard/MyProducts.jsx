import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, BookOpen, Key, FileClock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get("/me/products").then((r) => setProducts(r.data)); }, []);

  const download = async (pid) => {
    try {
      const { data } = await api.get(`/downloads/${pid}`);
      toast.success(`Downloading ${data.filename}`);
      window.open(data.url, "_blank");
    } catch (e) { toast.error("Download failed"); }
  };

  if (products.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">
      You haven't purchased any products yet. <Link to="/store" className="text-white hover:underline">Visit the store</Link>.
    </div>;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {products.map((p) => (
        <div key={p.id} data-testid={`owned-${p.slug}`} className="rounded-2xl border border-white/10 bg-card overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-32 object-cover" />
          <div className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold">{p.name}</h3>
              <span className="font-mono text-xs text-muted-foreground">v{p.version}</span>
            </div>
            {p.license && <div className="mt-1 font-mono text-xs text-muted-foreground">{p.license.key}</div>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => download(p.id)} data-testid={`download-${p.slug}`} className="bg-white text-black hover:bg-white/90 font-semibold"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
              <Button asChild size="sm" variant="outline" className="border-white/15 hover:bg-white/5"><Link to="/documentation"><BookOpen className="h-3.5 w-3.5 mr-1" /> Docs</Link></Button>
              <Button asChild size="sm" variant="outline" className="border-white/15 hover:bg-white/5"><Link to="/dashboard/licenses"><Key className="h-3.5 w-3.5 mr-1" /> License</Link></Button>
              <Button asChild size="sm" variant="outline" className="border-white/15 hover:bg-white/5"><Link to="/changelog"><FileClock className="h-3.5 w-3.5 mr-1" /> Changelog</Link></Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
