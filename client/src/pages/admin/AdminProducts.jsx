import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Upload, Lock, Sparkles, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATEGORIES = ["Scripts", "UI", "Framework", "Vehicles", "Maps", "Misc"];
const empty = {
  name: "", slug: "", category: "Scripts", price: 0, short_description: "", description: "",
  image: "", gallery: "", frameworks: "QBCore, ESX", version: "1.0.0", status: "Available", featured: false,
  dependencies: "oxmysql, ox_lib", features: "", download_url: "", download_filename: ""
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  // Escrow upload state
  const [uploadingZip, setUploadingZip] = useState(false);
  const [encryptProgress, setEncryptProgress] = useState(0);
  const [zipInfo, setZipInfo] = useState(null);

  const load = () => api.get("/admin/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setZipInfo(null);
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      ...p,
      featured: Boolean(p.featured),
      gallery: (p.gallery || []).join(", "),
      frameworks: (p.frameworks || []).join(", "),
      dependencies: (p.dependencies || []).join(", "),
      features: (p.features || []).join(", ")
    });
    setZipInfo(p.download_filename ? { filename: p.download_filename, originalName: p.download_filename } : null);
    setOpen(true);
  };

  const toggleFeatured = async (p) => {
    try {
      const next = !p.featured;
      await api.put(`/admin/products/${p.id}`, { featured: next });
      toast.success(next ? `"${p.name}" marcado como destacado` : `"${p.name}" desmarcado de destacado`);
      load();
    } catch {
      toast.error("Error al actualizar estado destacado");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Solo se permiten archivos comprimidos .zip");
      return;
    }

    setUploadingZip(true);
    setEncryptProgress(15);

    const progressTimer = setInterval(() => {
      setEncryptProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 20;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await api.post("/admin/products/upload-zip", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(progressTimer);
      setEncryptProgress(100);

      setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          download_filename: data.filename,
          name: prev.name || file.name.replace(/\.zip$/i, "").replace(/[-_]/g, " "),
          slug: prev.slug || file.name.replace(/\.zip$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")
        }));
        setZipInfo(data);
        setUploadingZip(false);
        toast.success("¡Archivo encriptado y protegido con Vertex Escrow!");
      }, 500);
    } catch (err) {
      clearInterval(progressTimer);
      setUploadingZip(false);
      toast.error(formatApiError(err.response?.data?.detail) || "Error al subir y encriptar el archivo");
    }
  };

  const save = async () => {
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      featured: form.featured ? 1 : 0,
      gallery: form.gallery.split(",").map((s) => s.trim()).filter(Boolean),
      frameworks: form.frameworks.split(",").map((s) => s.trim()).filter(Boolean),
      dependencies: form.dependencies.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
    };
    delete payload.id; delete payload.sales; delete payload.created_at; delete payload.last_updated; delete payload.reviews;
    try {
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
        toast.success("Producto actualizado con éxito");
      } else {
        await api.post("/admin/products", payload);
        toast.success("Producto creado y protegido con Vertex Escrow");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  const del = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await api.delete(`/admin/products/${id}`);
    toast.success("Producto eliminado");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestión de recursos y encriptación de scripts FiveM.</p>
        </div>
        <Button onClick={openNew} data-testid="admin-new-product" className="bg-white text-black hover:bg-white/90 font-semibold">
          <Plus className="h-4 w-4 mr-1" /> New Product
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Product</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Category</th>
              <th className="text-left font-medium px-4 py-3">Price</th>
              <th className="text-left font-medium px-4 py-3">Protección</th>
              <th className="text-left font-medium px-4 py-3">Destacado</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No hay productos registrados. Haz clic en "New Product" para subir tu primer script.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} data-testid={`admin-product-${p.slug}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image || "/logo.png"} alt="" className="h-9 w-12 rounded object-cover border border-white/10 bg-white/5" />
                      <div>
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{p.version || "1.0.0"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">{Number(p.price) === 0 ? "Free" : `€${Number(p.price).toFixed(2)}`}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                      <Lock className="h-3 w-3" /> Escrow Protegido
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(p)}
                      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        p.featured
                          ? "bg-amber-400/15 border-amber-400/40 text-amber-300 shadow-sm hover:bg-amber-400/25"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10"
                      }`}
                      title="Alternar producto destacado en la página principal"
                    >
                      <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                      {p.featured ? "Destacado" : "Normal"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} data-testid={`edit-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => del(p.id)} data-testid={`delete-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              {editing ? "Editar Producto" : "Nuevo Producto & Encriptación Escrow"}
            </DialogTitle>
          </DialogHeader>

          {/* Subida y Encriptación Automática con Vertex Escrow */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-3 mb-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-400" />
                Subir Script (.zip) para Encriptación Automática
              </Label>
              {form.download_filename && !uploadingZip && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Check className="h-3 w-3" /> Vertex Escrow Activado
                </span>
              )}
            </div>

            {uploadingZip ? (
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-black/40 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Lock className="h-5 w-5 text-emerald-400 animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <Sparkles className="h-4 w-4 text-amber-400 animate-bounce" />
                        Encriptando con Vertex Escrow...
                      </span>
                      <span className="font-mono text-emerald-400">{encryptProgress}%</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {encryptProgress < 40 ? "Analizando estructura del script y fxmanifest.lua..." :
                       encryptProgress < 85 ? "Cifrando scripts del servidor con bytecode anti-tamper..." :
                       "¡Finalizando y empaquetando con firma de seguridad!"}
                    </p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-200"
                        style={{ width: `${encryptProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : form.download_filename ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{zipInfo?.originalName || form.download_filename}</span>
                      <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                        {zipInfo?.sizeFormatted || "Protegido"}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      ✓ Encriptado con Vertex Escrow & listo para descarga en Keymaster
                    </p>
                  </div>
                </div>

                <label className="text-xs font-medium cursor-pointer text-white/80 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors shrink-0">
                  Cambiar .zip
                  <input type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-emerald-500/40 rounded-xl cursor-pointer hover:bg-white/[0.02] transition-colors group">
                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-emerald-400 transition-colors mb-2" />
                <span className="text-xs font-medium text-white group-hover:text-emerald-300">
                  Selecciona o arrastra el archivo .zip de tu script
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  Apenas lo selecciones, se encriptará automáticamente con Vertex Escrow
                </span>
                <input type="file" accept=".zip" onChange={handleFileSelect} className="hidden" />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del Script"><Input data-testid="pf-name" value={form.name} onChange={set("name")} placeholder="Ej: Vertex Banking" className="bg-card border-white/10" /></Field>
            <Field label="Slug"><Input data-testid="pf-slug" value={form.slug} onChange={set("slug")} placeholder="vertex-banking" className="bg-card border-white/10" /></Field>
            <Field label="Categoría">
              <select data-testid="pf-category" value={form.category} onChange={set("category")} className="w-full h-10 rounded-md bg-card border border-white/10 px-3 text-sm text-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Precio (€)"><Input data-testid="pf-price" type="number" step="0.01" value={form.price} onChange={set("price")} className="bg-card border-white/10" /></Field>
            <Field label="Versión"><Input value={form.version} onChange={set("version")} className="bg-card border-white/10" /></Field>
            <Field label="Estado"><Input value={form.status} onChange={set("status")} className="bg-card border-white/10" /></Field>

            <div className="col-span-2 flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <input
                type="checkbox"
                id="pf-featured"
                checked={Boolean(form.featured)}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 text-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="pf-featured" className="text-xs text-white font-medium cursor-pointer flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                Marcar como Producto Destacado (aparecerá en el Hero de la página principal)
              </label>
            </div>

            <Field label="Imagen / Thumbnail URL" full><Input data-testid="pf-image" value={form.image} onChange={set("image")} placeholder="/logo.png" className="bg-card border-white/10" /></Field>
            <Field label="Descripción Corta" full><Input value={form.short_description} onChange={set("short_description")} placeholder="Breve resumen del script" className="bg-card border-white/10" /></Field>
            <Field label="Descripción Completa" full><Textarea rows={3} value={form.description} onChange={set("description")} className="bg-card border-white/10" /></Field>
            <Field label="Frameworks (separados por coma)"><Input value={form.frameworks} onChange={set("frameworks")} placeholder="QBCore, ESX" className="bg-card border-white/10" /></Field>
            <Field label="Dependencias (separadas por coma)"><Input value={form.dependencies} onChange={set("dependencies")} placeholder="oxmysql, ox_lib" className="bg-card border-white/10" /></Field>
            <Field label="Galería de Imágenes (URLs separadas por coma)" full><Input value={form.gallery} onChange={set("gallery")} className="bg-card border-white/10" /></Field>
            <Field label="Características (separadas por coma)" full><Input value={form.features} onChange={set("features")} className="bg-card border-white/10" /></Field>
          </div>

          <DialogFooter>
            <Button
              onClick={save}
              disabled={uploadingZip}
              data-testid="pf-save"
              className="bg-white text-black hover:bg-white/90 font-semibold"
            >
              {editing ? "Guardar Cambios" : "Crear Producto Protegido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
