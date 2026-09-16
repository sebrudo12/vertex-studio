import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Key } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Success() {
  const [licenses, setLicenses] = useState([]);
  useEffect(() => {
    api.get("/me/licenses").then((r) => setLicenses(r.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="vx-container py-20 max-w-2xl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-400" />
        <h1 className="font-display font-black text-3xl mt-6">Thank you!</h1>
        <p className="text-muted-foreground mt-2">Your order is complete. Your licenses have been generated and your downloads are ready.</p>
      </motion.div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2"><Key className="h-4 w-4" /> Your latest licenses</h2>
        <div className="space-y-2">
          {licenses.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-lg border border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{l.product_name}</div>
                <div className="font-mono text-xs text-muted-foreground">{l.key}</div>
              </div>
              <span className="text-xs text-emerald-300">{l.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <Button asChild className="bg-white text-black hover:bg-white/90 font-semibold" data-testid="success-downloads"><Link to="/dashboard/downloads"><Download className="h-4 w-4 mr-2" /> Go to Downloads</Link></Button>
        <Button asChild variant="outline" className="border-white/15 hover:bg-white/5"><Link to="/store">Continue Shopping</Link></Button>
      </div>
    </div>
  );
}
