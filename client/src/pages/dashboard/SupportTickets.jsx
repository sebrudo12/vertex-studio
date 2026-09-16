import { useEffect, useState } from "react";
import { Plus, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["Purchase", "Installation", "Bug", "License", "General"];
const STATUS = { Open: "text-emerald-300", Pending: "text-amber-300", Resolved: "text-muted-foreground" };

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", product: "", category: "General", message: "" });

  const load = () => api.get("/tickets").then((r) => setTickets(r.data));
  useEffect(() => { load(); api.get("/products").then((r) => setProducts(r.data)); }, []);

  const create = async () => {
    if (!form.subject || !form.message) return toast.error("Subject and message required");
    try {
      await api.post("/tickets", form);
      toast.success("Ticket created");
      setOpen(false); setForm({ subject: "", product: "", category: "General", message: "" });
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const send = async (tid) => {
    if (!reply.trim()) return;
    try {
      await api.post(`/tickets/${tid}/messages`, { message: reply });
      setReply("");
      const { data } = await api.get("/tickets");
      setTickets(data);
      setActive(data.find((t) => t.id === tid));
    } catch (e) { toast.error("Failed to send"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">Support Tickets</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="new-ticket-btn" className="bg-white text-black hover:bg-white/90 font-semibold"><Plus className="h-4 w-4 mr-1" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10">
            <DialogHeader><DialogTitle className="font-display">Open a new ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Subject</Label><Input data-testid="ticket-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-1.5 bg-card border-white/10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Product</Label>
                  <Select value={form.product} onValueChange={(v) => setForm({ ...form, product: v })}>
                    <SelectTrigger data-testid="ticket-product" className="mt-1.5 bg-card border-white/10"><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger data-testid="ticket-category" className="mt-1.5 bg-card border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Message</Label><Textarea data-testid="ticket-message" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1.5 bg-card border-white/10" /></div>
            </div>
            <DialogFooter><Button onClick={create} data-testid="ticket-submit" className="bg-white text-black hover:bg-white/90 font-semibold">Create Ticket</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">No tickets yet.</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            {tickets.map((t) => (
              <button key={t.id} onClick={() => setActive(t)} data-testid={`ticket-${t.id}`}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${active?.id === t.id ? "border-white/40 bg-white/5" : "border-white/10 bg-card hover:border-white/20"}`}>
                <div className="flex items-center justify-between"><span className="font-medium text-sm truncate">{t.subject}</span><span className={`text-xs ${STATUS[t.status]}`}>{t.status}</span></div>
                <div className="text-xs text-muted-foreground mt-1">{t.category}{t.product ? ` · ${t.product}` : ""}</div>
              </button>
            ))}
          </div>
          <div className="lg:col-span-2">
            {active ? (
              <div className="rounded-2xl border border-white/10 bg-card p-5 flex flex-col h-full">
                <div className="pb-3 border-b border-white/10 mb-3"><h3 className="font-display font-bold">{active.subject}</h3><span className={`text-xs ${STATUS[active.status]}`}>{active.status}</span></div>
                <div className="space-y-3 flex-1 mb-4 max-h-80 overflow-y-auto">
                  {active.messages.map((m, i) => (
                    <div key={i} className={`rounded-lg p-3 text-sm ${m.from === "admin" ? "bg-white/10 ml-6" : "bg-[#0b0b10] mr-6"}`}>
                      <div className="text-xs text-muted-foreground mb-1">{m.author} · {new Date(m.date).toLocaleString()}</div>
                      {m.message}
                    </div>
                  ))}
                </div>
                {active.status !== "Resolved" && (
                  <div className="flex gap-2">
                    <Input data-testid="ticket-reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply..." className="bg-[#0b0b10] border-white/10" onKeyDown={(e) => e.key === "Enter" && send(active.id)} />
                    <Button onClick={() => send(active.id)} data-testid="ticket-send" className="bg-white text-black hover:bg-white/90"><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground flex items-center justify-center h-full">
                <div><MessageSquare className="h-8 w-8 mx-auto mb-2" />Select a ticket to view the conversation</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
