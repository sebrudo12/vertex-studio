import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { VertexLogo } from "@/components/VertexLogo";

export function Footer() {
  const { settings } = useAuth();
  const cols = [
    { title: "Product", links: [["Store", "/store"], ["Documentation", "/documentation"], ["Changelog", "/changelog"]] },
    { title: "Company", links: [["Support", "/support"], ["Reviews", "/#reviews"], ["Discord", settings?.discord?.invite || "#"]] },
    { title: "Legal", links: [["Terms", "/support"], ["Privacy", "/support"], ["Refund Policy", "/support"]] },
  ];
  return (
    <footer className="border-t border-white/10 bg-[#060606] mt-auto">
      <div className="vx-container py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <VertexLogo logo={settings?.logo} size={30} />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Premium resources for the FiveM community. Built different.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display text-xs uppercase tracking-widest text-white mb-4">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith("http") ? (
                    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-white transition-colors">{label}</a>
                  ) : (
                    <Link to={href} className="text-sm text-muted-foreground hover:text-white transition-colors">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="vx-container py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© 2026 Vertex Studio. All rights reserved.</p>
          <p className="text-xs text-muted-foreground font-mono">Premium · Reliable · Modern · Fast</p>
        </div>
      </div>
    </footer>
  );
}
