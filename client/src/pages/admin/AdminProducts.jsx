import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATEGORIES = ["Scripts", "UI", "Framework", "Vehicles", "Maps", "Misc"];
const empty = { name: "", slug: "", category: "Scripts", price: 0, short_description: "", description: "",
  image: "", gallery: "", frameworks: "QBCore, ESX", version: "1.0.0", status: "Available",
  dependencies: "oxmysql, ox_lib", features: "", download_url: "", download_filename: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get("/admin/products").then((r) => setProducts(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, gallery: (p.gallery || []).join(", "), frameworks: (p.frameworks || []).join(", "),
      dependencies: (p.dependencies || []).join(", "), features: (p.features || []).join(", ") });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      ...form, price: parseFloat(form.price) || 0,
      gallery: form.gallery.split(",").map((s) => s.trim()).filter(Boolean),
      frameworks: form.frameworks.split(",").map((s) => s.trim()).filter(Boolean),
      dependencies: form.dependencies.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
    };
    delete payload.id; delete payload.sales; delete payload.created_at; delete payload.last_updated; delete payload.reviews;
    try {
      if (editing) { await api.put(`/admin/products/${editing.id}`, payload); toast.success("Product updated"); }
      else { await api.post("/admin/products", payload); toast.success("Product created"); }
      setOpen(false); load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`); toast.success("Deleted"); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-black text-2xl">Products</h1>
        <Button onClick={openNew} data-testid="admin-new-product" className="bg-white text-black hover:bg-white/90 font-semibold"><Plus className="h-4 w-4 mr-1" /> New Product</Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground"><tr>
            <th className="text-left font-medium px-4 py-3">Product</th>
            <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Category</th>
            <th className="text-left font-medium px-4 py-3">Price</th>
            <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Sales</th>
            <th className="text-right font-medium px-4 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {products.map((p) => (
              <tr key={p.id} data-testid={`admin-product-${p.slug}`}>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-9 w-12 rounded object-cover" /><span className="font-medium">{p.name}</span></div></td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 font-semibold">{Number(p.price) === 0 ? "Free" : `€${Number(p.price).toFixed(2)}`}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.sales || 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} data-testid={`edit-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(p.id)} data-testid={`delete-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Edit" : "New"} Product</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input data-testid="pf-name" value={form.name} onChange={set("name")} className="bg-card border-white/10" /></Field>
            <Field label="Slug"><Input data-testid="pf-slug" value={form.slug} onChange={set("slug")} className="bg-card border-white/10" /></Field>
            <Field label="Category">
              <select data-testid="pf-category" value={form.category} onChange={set("category")} className="w-full h-10 rounded-md bg-card border border-white/10 px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Price (€)"><Input data-testid="pf-price" type="number" step="0.01" value={form.price} onChange={set("price")} className="bg-card border-white/10" /></Field>
            <Field label="Version"><Input value={form.version} onChange={set("version")} className="bg-card border-white/10" /></Field>
            <Field label="Status"><Input value={form.status} onChange={set("status")} className="bg-card border-white/10" /></Field>
            <Field label="Image URL" full><Input data-testid="pf-image" value={form.image} onChange={set("image")} className="bg-card border-white/10" /></Field>
            <Field label="Short Description" full><Input value={form.short_description} onChange={set("short_description")} className="bg-card border-white/10" /></Field>
            <Field label="Description" full><Textarea rows={3} value={form.description} onChange={set("description")} className="bg-card border-white/10" /></Field>
            <Field label="Frameworks (comma)"><Input value={form.frameworks} onChange={set("frameworks")} className="bg-card border-white/10" /></Field>
            <Field label="Dependencies (comma)"><Input value={form.dependencies} onChange={set("dependencies")} className="bg-card border-white/10" /></Field>
            <Field label="Gallery URLs (comma)" full><Input value={form.gallery} onChange={set("gallery")} className="bg-card border-white/10" /></Field>
            <Field label="Features (comma)" full><Input value={form.features} onChange={set("features")} className="bg-card border-white/10" /></Field>
          </div>
          <DialogFooter><Button onClick={save} data-testid="pf-save" className="bg-white text-black hover:bg-white/90 font-semibold">{editing ? "Save Changes" : "Create Product"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, full }) {
  return <div className={full ? "col-span-2" : ""}><Label className="text-xs">{label}</Label><div className="mt-1.5">{children}</div></div>;
}
