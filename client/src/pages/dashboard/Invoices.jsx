import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Invoices() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { 
    api.get("/me/orders")
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setOrders([])); 
  }, []);

  const printInvoice = (o) => {
    const w = window.open("", "_blank");
    const orderNumber = o.order_number || (o.id ? `ORD-${String(o.id).padStart(4, "0")}` : "");
    const dateStr = new Date(o.date || o.created_at || Date.now()).toLocaleString();
    const amountVal = (Number(o.amount || o.total_amount || 0)).toFixed(2);
    const itemsLines = Array.isArray(o.items) && o.items.length > 0
      ? o.items.map((i) => `${i.name || i.product_title}  €${(Number(i.price) || 0).toFixed(2)}`).join("\n")
      : (o.product_title ? `${o.product_title}  €${amountVal}` : "");

    w.document.write(`<pre style="font-family:monospace;padding:24px">VERTEX STUDIO — INVOICE
Invoice: ${orderNumber}
Date: ${dateStr}
Method: ${o.payment_method || "Direct"}

${itemsLines}

TOTAL: €${amountVal}
Status: ${o.status || "Completed"}
</pre>`);
    w.print();
  };

  if (orders.length === 0)
    return <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">No invoices yet.</div>;

  return (
    <div className="rounded-2xl border border-white/10 bg-card divide-y divide-white/10">
      {orders.map((o) => {
        const invNum = o.order_number ? String(o.order_number) : (o.id !== undefined && o.id !== null ? `INV-${String(o.id).padStart(4, "0")}` : "INV-0000");
        const dateStr = new Date(o.date || o.created_at || Date.now()).toLocaleDateString();
        const amountVal = (Number(o.amount || o.total_amount || 0)).toFixed(2);

        return (
          <div key={o.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-mono text-sm text-white">{invNum}</div>
              <div className="text-xs text-muted-foreground">{dateStr} · €{amountVal}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => printInvoice(o)} data-testid={`invoice-${o.id}`} className="border-white/15 hover:bg-white/5">
              <Download className="h-3.5 w-3.5 mr-1" /> Invoice
            </Button>
          </div>
        );
      })}
    </div>
  );
}
