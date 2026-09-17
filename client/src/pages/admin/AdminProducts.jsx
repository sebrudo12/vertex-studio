import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Star, Upload, Lock, Sparkles, Check, ShieldCheck, FileCode, CheckCircle2 } from "lucide-react";
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
  const [showReportDetails, setShowReportDetails] = useState(false);

  // Quick table upload state
  const [quickUploadProduct, setQuickUploadProduct] = useState(null);
  const tableFileInputRef = useRef(null);

  const load = () => api.get("/admin/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setZipInfo(null);
    setShowReportDetails(false);
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
    setShowReportDetails(false);
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

  const processFileUpload = async (file, targetProduct = null) => {
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
        return prev + 15;
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

      setTimeout(async () => {
        if (targetProduct) {
          await api.put(`/admin/products/${targetProduct.id}`, {
            download_filename: data.filename
          });
          toast.success(`¡Script actualizado y protegido para "${targetProduct.name}"!`);
          load();
        } else {
          setForm((prev) => ({
            ...prev,
            download_filename: data.filename,
            name: prev.name || data.detectedTitle || file.name.replace(/\.zip$/i, "").replace(/[-_]/g, " "),
            slug: prev.slug || data.detectedSlug || file.name.replace(/\.zip$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")
          }));
          setZipInfo(data);
          setShowReportDetails(true);
          toast.success("¡Script encriptado y protegido con Vertex Escrow!");
        }
        setUploadingZip(false);
      }, 500);
    } catch (err) {
      clearInterval(progressTimer);
      setUploadingZip(false);
      toast.error(formatApiError(err.response?.data?.detail) || "Error al subir y encriptar el archivo");
    }
  };

  const handleModalFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFileUpload(file);
  };

  const handleTableFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && quickUploadProduct) {
      processFileUpload(file, quickUploadProduct);
      setQuickUploadProduct(null);
    }
  };

  const triggerTableUpload = (p) => {
    setQuickUploadProduct(p);
    if (tableFileInputRef.current) {
      tableFileInputRef.current.value = "";
      tableFileInputRef.current.click();
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
    <div className="space-y-6">
      {/* Hidden input for direct table upload */}
      <input
        type="file"
        ref={tableFileInputRef}
        accept=".zip"
        onChange={handleTableFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Catálogo de Productos & Escrow</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publica recursos de FiveM con encriptación automática para tu propio Keymaster.
          </p>
        </div>
        <Button onClick={openNew} data-testid="admin-new-product" className="bg-white text-black hover:bg-white/90 font-semibold text-xs h-10 px-4">
          <Plus className="h-4 w-4 mr-1.5" /> Nuevo Producto
        </Button>
      </div>

      {/* GUIDE BANNER */}
      <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 via-[#101518] to-emerald-950/10 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">¿Cómo subir y vender tus scripts con Vertex Escrow?</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Vertex Escrow v2.0
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-3xl">
                Al hacer clic en <strong className="text-white">"Nuevo Producto"</strong>, arrastra tu archivo <code className="text-emerald-400 bg-white/5 px-1.5 py-0.5 rounded">.zip</code>.
                El sistema encripta automáticamente el código del servidor (<code className="text-emerald-300">server/*.lua</code>) y la interfaz (<code className="text-emerald-300">app.js</code>, <code className="text-emerald-300">style.css</code>),
                dejando <strong className="text-emerald-400">config.lua</strong> y <strong className="text-emerald-400">locales</strong> 100% editables para que tus compradores personalicen nombres, comandos y traducciones.
              </p>
            </div>
          </div>
          <Button onClick={openNew} variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold shrink-0 h-9">
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Subir .zip Ahora
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Recurso / Script</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Categoría</th>
              <th className="text-left font-medium px-4 py-3">Precio</th>
              <th className="text-left font-medium px-4 py-3">Protección Escrow</th>
              <th className="text-left font-medium px-4 py-3">Destacado</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No hay productos registrados. Haz clic en "Nuevo Producto" para subir tu primer script.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const hasZip = Boolean(p.download_filename);
                return (
                  <tr key={p.id} data-testid={`admin-product-${p.slug}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image || "/logo.png"} alt="" className="h-9 w-12 rounded object-cover border border-white/10 bg-white/5" />
                        <div>
                          <div className="font-medium text-white">{p.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">{p.version || "1.0.0"} • /{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{Number(p.price) === 0 ? "Gratis" : `€${Number(p.price).toFixed(2)}`}</td>
                    <td className="px-4 py-3">
                      {hasZip ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                            <ShieldCheck className="h-3 w-3" /> Escrow Activo
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerTableUpload(p)}
                            className="text-[11px] text-muted-foreground hover:text-white underline font-mono"
                            title="Actualizar archivo .zip de este script"
                          >
                            Actualizar .zip
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => triggerTableUpload(p)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 hover:bg-amber-500/20 transition-colors"
                        >
                          <Upload className="h-3 w-3" /> Subir Script .zip
                        </button>
                      )}
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
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} data-testid={`edit-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-white" title="Editar detalles">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => del(p.id)} data-testid={`delete-${p.slug}`} className="p-2 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400" title="Eliminar producto">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: CREATE / EDIT PRODUCT */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-emerald-400" />
              {editing ? "Editar Producto & Archivo Escrow" : "Nuevo Producto & Encriptación Vertex Escrow"}
            </DialogTitle>
          </DialogHeader>

          {/* PASO 1: SUBIDA Y ENCRIPTACIÓN ESCROW */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                <Label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  Archivo del Script FiveM (.zip) & Encriptación
                </Label>
              </div>
              {form.download_filename && !uploadingZip && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  <Check className="h-3 w-3" /> Vertex Escrow Activado
                </span>
              )}
            </div>

            {uploadingZip ? (
              <div className="relative overflow-hidden rounded-xl border border-emerald-500/40 bg-black/50 p-4 space-y-2.5">
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
                      {encryptProgress < 30 ? "1/4 Analizando fxmanifest.lua y estructura del recurso..." :
                       encryptProgress < 60 ? "2/4 Cifrando lógica del servidor (server/*.lua) con bytecode DRM..." :
                       encryptProgress < 85 ? "3/4 Ofuscando interfaz NUI (app.js) y empaquetando estilos (style.css)..." :
                       "4/4 Preservando config.lua y traducciones 100% editables para el comprador..."}
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
              <div className="space-y-2.5">
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

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium cursor-pointer text-white/80 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors shrink-0">
                      Cambiar .zip
                      <input type="file" accept=".zip" onChange={handleModalFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* ESCROW PROTECTION BREAKDOWN */}
                <div className="rounded-xl bg-black/40 border border-white/10 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px]">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Desglose de Protección Escrow
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReportDetails(!showReportDetails)}
                      className="text-emerald-400 hover:underline"
                    >
                      {showReportDetails ? "Ocultar detalles" : "Ver detalles de archivos"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="font-semibold text-emerald-300 flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Cifrados & Protegidos:
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        • server/*.lua (Bytecode DRM)<br />
                        • app.js (Ofuscado NUI)<br />
                        • style.css (Estilo protegido)
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <div className="font-semibold text-sky-300 flex items-center gap-1">
                        <FileCode className="h-3 w-3" /> 100% Editables por el Cliente:
                      </div>
                      <p className="text-muted-foreground mt-0.5">
                        • config.lua (Nombres y ajustes)<br />
                        • fxmanifest.lua (Manifest)<br />
                        • locales/*.lua (Traducciones)
                      </p>
                    </div>
                  </div>

                  {showReportDetails && zipInfo?.report && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-[10px] font-mono space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
                      {zipInfo.report.encryptedLua?.length > 0 && (
                        <div>🔒 Server Lua: {zipInfo.report.encryptedLua.join(", ")}</div>
                      )}
                      {zipInfo.report.encryptedJs?.length > 0 && (
                        <div>🔒 NUI JS: {zipInfo.report.encryptedJs.join(", ")}</div>
                      )}
                      {zipInfo.report.encryptedCss?.length > 0 && (
                        <div>🔒 NUI CSS: {zipInfo.report.encryptedCss.join(", ")}</div>
                      )}
                      {zipInfo.report.editableFiles?.length > 0 && (
                        <div>🔓 Archivos Abiertos: {zipInfo.report.editableFiles.join(", ")}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 rounded-xl cursor-pointer hover:bg-emerald-500/[0.03] transition-colors group">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300">
                  Arrastra aquí el archivo .zip de tu script FiveM
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 text-center max-w-sm">
                  Al subirlo, Vertex Escrow encriptará <strong className="text-white">server.lua, app.js y style.css</strong>, dejando <strong className="text-emerald-400">config.lua</strong> editable.
                </span>
                <input type="file" accept=".zip" onChange={handleModalFileSelect} className="hidden" />
              </label>
            )}
          </div>

          {/* PASO 2: INFORMACIÓN DEL PRODUCTO */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-5 w-5 rounded-full bg-white/10 text-white font-mono text-xs flex items-center justify-center font-bold">2</span>
              <Label className="text-xs font-bold text-white">
                Información Comercial & Precios
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre del Script *">
                <Input data-testid="pf-name" value={form.name} onChange={set("name")} placeholder="Ej: Vertex Banking" className="bg-card border-white/10" required />
              </Field>
              <Field label="Slug Identificador (URL) *">
                <Input data-testid="pf-slug" value={form.slug} onChange={set("slug")} placeholder="vertex-banking" className="bg-card border-white/10" required />
              </Field>
              <Field label="Categoría">
                <select data-testid="pf-category" value={form.category} onChange={set("category")} className="w-full h-10 rounded-md bg-card border border-white/10 px-3 text-sm text-white focus:outline-none">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#121217]">{c}</option>)}
                </select>
              </Field>
              <Field label="Precio (€) *">
                <Input data-testid="pf-price" type="number" step="0.01" value={form.price} onChange={set("price")} className="bg-card border-white/10" required />
              </Field>
              <Field label="Versión">
                <Input value={form.version} onChange={set("version")} placeholder="1.0.0" className="bg-card border-white/10" />
              </Field>
              <Field label="Estado">
                <Input value={form.status} onChange={set("status")} placeholder="Available" className="bg-card border-white/10" />
              </Field>

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
                  Marcar como Producto Destacado (se destacará en el Hero principal)
                </label>
              </div>

              <Field label="Imagen de Portada (URL)" full>
                <Input data-testid="pf-image" value={form.image} onChange={set("image")} placeholder="/logo.png o https://..." className="bg-card border-white/10" />
              </Field>
              <Field label="Descripción Corta" full>
                <Input value={form.short_description} onChange={set("short_description")} placeholder="Breve resumen para la tarjeta del producto" className="bg-card border-white/10" />
              </Field>
              <Field label="Descripción Detallada (Markdown)" full>
                <Textarea rows={3} value={form.description} onChange={set("description")} placeholder="Características completas, instrucciones y requisitos..." className="bg-card border-white/10" />
              </Field>
              <Field label="Frameworks (separados por coma)">
                <Input value={form.frameworks} onChange={set("frameworks")} placeholder="QBCore, ESX, Standalone" className="bg-card border-white/10" />
              </Field>
              <Field label="Dependencias (separadas por coma)">
                <Input value={form.dependencies} onChange={set("dependencies")} placeholder="oxmysql, ox_lib" className="bg-card border-white/10" />
              </Field>
              <Field label="Galería de Capturas (URLs separadas por coma)" full>
                <Input value={form.gallery} onChange={set("gallery")} placeholder="https://..., https://..." className="bg-card border-white/10" />
              </Field>
              <Field label="Características Destacadas (separadas por coma)" full>
                <Input value={form.features} onChange={set("features")} placeholder="0.00ms resmon, Tablet NUI, Soporte Discord" className="bg-card border-white/10" />
              </Field>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/15"
            >
              Cancelar
            </Button>
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
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
