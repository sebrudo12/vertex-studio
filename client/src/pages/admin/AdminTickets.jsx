import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS = ["Open", "Pending", "Resolved"];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");

  const load = async () => { const { data } = await api.get("/admin/tickets"); setTickets(data); return data; };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!reply.trim() || !active) return;
    await api.post(`/tickets/${active.id}/messages`, { message: reply });
    setReply("");
    const data = await load();
    setActive(data.find((t) => t.id === active.id));
  };

  const setStatus = async (status) => {
    await api.post(`/admin/tickets/${active.id}/status?status=${status}`);
    toast.success(`Marked ${status}`);
    const data = await load();
    setActive(data.find((t) => t.id === active.id));
  };

  return (
    <div>
      <h1 className="font-display font-black text-2xl mb-6">Support Tickets</h1>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {tickets.length === 0 && <div className="text-sm text-muted-foreground">No tickets.</div>}
          {tickets.map((t) => (
            <button key={t.id} onClick={() => setActive(t)} data-testid={`admin-ticket-${t.id}`}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${active?.id === t.id ? "border-white/40 bg-white/5" : "border-white/10 bg-card hover:border-white/20"}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-sm truncate">{t.subject}</span><span className="text-xs text-muted-foreground">{t.status}</span></div>
              <div className="text-xs text-muted-foreground mt-1">{t.user_email} · {t.category}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2">
          {active ? (
            <div className="rounded-2xl border border-white/10 bg-card p-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div><h3 className="font-display font-bold">{active.subject}</h3><span className="text-xs text-muted-foreground">{active.user_name} · {active.category}</span></div>
                <div className="flex gap-1">
                  {STATUS.map((s) => <button key={s} onClick={() => setStatus(s)} data-testid={`status-${s.toLowerCase()}`} className={`text-xs px-2 py-1 rounded border ${active.status === s ? "bg-white text-black border-white" : "border-white/15 text-muted-foreground hover:text-white"}`}>{s}</button>)}
                </div>
              </div>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {active.messages.map((m, i) => (
                  <div key={i} className={`rounded-lg p-3 text-sm ${m.from === "admin" ? "bg-white/10 ml-6" : "bg-[#0b0b10] mr-6"}`}>
                    <div className="text-xs text-muted-foreground mb-1">{m.author} · {new Date(m.date).toLocaleString()}</div>{m.message}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input data-testid="admin-ticket-reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply as Vertex staff..." className="bg-[#0b0b10] border-white/10" onKeyDown={(e) => e.key === "Enter" && send()} />
                <Button onClick={send} data-testid="admin-ticket-send" className="bg-white text-black hover:bg-white/90"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          ) : <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">Select a ticket to respond.</div>}
        </div>
      </div>
    </div>
  );
}
