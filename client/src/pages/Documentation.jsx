import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Book, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";

export default function Documentation() {
  const [docs, setDocs] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get("/docs")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        setDocs(list);
        if (list.length && list[0]?.product) {
          setActiveProduct(list[0].product);
          setActiveSection(Object.keys(list[0].sections || {})[0]);
        }
      })
      .catch(() => setDocs([]));
  }, []);

  const safeDocs = Array.isArray(docs) ? docs : [];
  const current = safeDocs.find((d) => d.product === activeProduct);
  const sections = current ? Object.keys(current.sections || {}) : [];

  const filteredDocs = useMemo(() => {
    if (!q) return safeDocs;
    return safeDocs.map((d) => ({
      ...d,
      _matches: Object.entries(d.sections || {}).filter(([k, v]) =>
        k.toLowerCase().includes(q.toLowerCase()) || String(v).toLowerCase().includes(q.toLowerCase())),
    })).filter((d) => (d.product || "").toLowerCase().includes(q.toLowerCase()) || d._matches.length);
  }, [q, safeDocs]);

  return (
    <div>
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="vx-container relative py-14">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Documentation</p>
          <h1 className="font-display font-black uppercase text-4xl mt-2">Docs</h1>
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input data-testid="docs-search" placeholder="Search documentation..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-card border-white/10 h-11" />
          </div>
        </div>
      </section>

      <div className="vx-container py-10 grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            {(q ? filteredDocs : safeDocs).map((d) => (
              <div key={d.product}>
                <button onClick={() => { setActiveProduct(d.product); setActiveSection(Object.keys(d.sections)[0]); setQ(""); }}
                  data-testid={`doc-product-${d.product.replace(/\s+/g, "-").toLowerCase()}`}
                  className={`flex items-center gap-2 font-display font-bold text-sm mb-2 ${activeProduct === d.product ? "text-white" : "text-muted-foreground hover:text-white"}`}>
                  <Book className="h-4 w-4" /> {d.product}
                </button>
                <ul className="space-y-0.5 border-l border-white/10 ml-2">
                  {Object.keys(d.sections).map((s) => (
                    <li key={s}>
                      <button onClick={() => { setActiveProduct(d.product); setActiveSection(s); setQ(""); }}
                        data-testid={`doc-section-${s.toLowerCase()}`}
                        className={`block w-full text-left pl-4 py-1.5 text-sm -ml-px border-l transition-colors ${
                          activeProduct === d.product && activeSection === s ? "border-white text-white" : "border-transparent text-muted-foreground hover:text-white"
                        }`}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <main className="lg:col-span-3">
          {current && activeSection && (
            <motion.article key={activeProduct + activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                {activeProduct} <ChevronRight className="h-3 w-3" /> {activeSection}
              </div>
              <h2 className="font-display font-bold text-2xl mb-4">{activeSection}</h2>
              <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed bg-transparent">{current.sections[activeSection]}</pre>
            </motion.article>
          )}
        </main>
      </div>
    </div>
  );
}
