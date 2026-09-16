import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS = ["#FFFFFF", "#38BDF8", "#A855F7", "#22C55E", "#F59E0B", "#EF4444"];

export default function AdminSettings() {
  const { reloadSettings } = useAuth();
  const [s, setS] = useState(null);

  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);
  if (!s) return <div className="text-muted-foreground">Loading...</div>;

  const save = async () => {
    try {
      await api.put("/admin/settings", { accent_color: s.accent_color, logo: s.logo, stats: s.stats, discord: s.discord });
      await reloadSettings();
      toast.success("Settings saved");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display font-black text-2xl">Settings</h1>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold mb-4">Accent Color</h2>
        <div className="flex items-center gap-3">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => setS({ ...s, accent_color: c })} data-testid={`accent-${c}`}
              style={{ background: c }} className={`h-9 w-9 rounded-full border-2 ${s.accent_color === c ? "border-white scale-110" : "border-white/20"} transition-transform`} />
          ))}
          <Input value={s.accent_color} onChange={(e) => setS({ ...s, accent_color: e.target.value })} className="w-32 bg-[#0b0b10] border-white/10 font-mono" data-testid="accent-input" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold mb-4">Homepage Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {["resources", "customers", "feedback", "support"].map((k) => (
            <div key={k}><Label className="capitalize text-xs">{k}</Label><Input data-testid={`stat-${k}`} value={s.stats?.[k] || ""} onChange={(e) => setS({ ...s, stats: { ...s.stats, [k]: e.target.value } })} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold mb-4">Discord</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><Label className="text-xs">Server Name</Label><Input value={s.discord?.name || ""} onChange={(e) => setS({ ...s, discord: { ...s.discord, name: e.target.value } })} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
          <div><Label className="text-xs">Invite Link</Label><Input data-testid="discord-invite" value={s.discord?.invite || ""} onChange={(e) => setS({ ...s, discord: { ...s.discord, invite: e.target.value } })} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
          <div><Label className="text-xs">Members</Label><Input type="number" value={s.discord?.members || 0} onChange={(e) => setS({ ...s, discord: { ...s.discord, members: parseInt(e.target.value) || 0 } })} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
          <div><Label className="text-xs">Online</Label><Input type="number" value={s.discord?.online || 0} onChange={(e) => setS({ ...s, discord: { ...s.discord, online: parseInt(e.target.value) || 0 } })} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
        </div>
      </div>

      <Button onClick={save} data-testid="settings-save" className="bg-white text-black hover:bg-white/90 font-semibold">Save All Settings</Button>
    </div>
  );
}
