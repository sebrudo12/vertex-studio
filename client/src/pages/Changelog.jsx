import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Wrench, ArrowUp } from "lucide-react";
import api from "@/lib/api";

const GROUPS = [
  { key: "added", label: "Added", color: "text-emerald-300", icon: Plus },
  { key: "fixed", label: "Fixed", color: "text-sky-300", icon: Wrench },
  { key: "improved", label: "Improved", color: "text-amber-300", icon: ArrowUp },
];

export default function Changelog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    api.get("/changelogs")
      .then((r) => setLogs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setLogs([]));
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div>
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="vx-container relative py-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Changelog</p>
          <h1 className="font-display font-black uppercase text-4xl mt-2">What's New</h1>
        </div>
      </section>

      <div className="vx-container py-12 max-w-3xl">
        <div className="relative border-l border-white/10 pl-8 space-y-10">
          {safeLogs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }} data-testid={`changelog-${log.id}`} className="relative">
              <span className="absolute -left-[42px] top-1 h-4 w-4 rounded-full bg-white border-4 border-[#080808]" />
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display font-bold text-xl">{log.product}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10">v{log.version}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(log.date).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-card p-6 space-y-4">
                {GROUPS.map(({ key, label, color, icon: Icon }) =>
                  log[key]?.length ? (
                    <div key={key}>
                      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${color} mb-2`}>
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </div>
                      <ul className="space-y-1">
                        {log[key].map((item) => <li key={item} className="text-sm text-muted-foreground pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-white/30">{item}</li>)}
                      </ul>
                    </div>
                  ) : null
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
