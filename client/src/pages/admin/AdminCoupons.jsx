import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Check, Copy, Percent, DollarSign, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_spend: "0",
    max_uses: "",
    expires_at: ""
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/coupons");
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadCoupons error:", err);
      toast.error(err.response?.data?.error || "Error al cargar cupones");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Código ${code} copiado al portapapeles`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (c) => {
    try {
      await api.put(`/admin/coupons/${c.id}`, { is_active: !c.is_active });
      toast.success(c.is_active ? "Cupón pausado" : "Cupón activado");
      loadCoupons();
    } catch (err) {
      toast.error("Error al actualizar cupón");
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`¿Estás seguro de eliminar el cupón ${c.code}?`)) return;
    try {
      await api.delete(`/admin/coupons/${c.id}`);
      toast.success("Cupón eliminado");
      loadCoupons();
    } catch (err) {
      toast.error("Error al eliminar cupón");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error("El código es obligatorio");
    if (!form.discount_value || Number(form.discount_value) <= 0) return toast.error("Ingresa un valor de descuento válido");

    try {
      setSubmitting(true);
      await api.post("/admin/coupons", {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_spend: parseFloat(form.min_spend) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses, 10) : null,
        expires_at: form.expires_at || null
      });
      toast.success("¡Cupón creado exitosamente!");
      setOpen(false);
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_spend: "0", max_uses: "", expires_at: "" });
      loadCoupons();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al crear cupón");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-mono mb-2">
            <Tag className="h-3.5 w-3.5" /> Marketing y Promociones
          </div>
          <h1 className="font-display font-black text-2xl text-white">Cupones de Descuento</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Crea campañas promocionales, códigos para creadores y descuentos directos en caja.
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          data-testid="btn-add-coupon"
          className="bg-white text-black hover:bg-white/90 font-semibold"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Cupón
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Código</th>
              <th className="text-left font-medium px-4 py-3">Descuento</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Gasto Mínimo</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Usos / Límite</th>
              <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Expiración</th>
              <th className="text-left font-medium px-4 py-3">Estado</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Cargando cupones...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No hay cupones creados aún. Haz clic en <strong>"Nuevo Cupón"</strong> para crear el primero.
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const discountVal = c.discount_value !== undefined ? c.discount_value : (c.discount_percent || 0);
                const usedCount = c.used_count !== undefined ? c.used_count : (c.uses_count || 0);
                const isPercentage = c.discount_type ? c.discount_type === "percentage" : true;
                const isExpired = c.expires_at && new Date() > new Date(c.expires_at);

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white bg-white/5 px-2 py-1 rounded border border-white/10">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopy(c.code)}
                          className="p-1 rounded text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === c.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-emerald-300">
                      {isPercentage ? (
                        <span className="inline-flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5" /> {Number(discountVal)}% OFF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" /> -€{Number(discountVal).toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {Number(c.min_spend || 0) > 0 ? `€${Number(c.min_spend).toFixed(2)}` : "Sin mínimo"}
                    </td>

                    <td className="px-4 py-3.5 hidden md:table-cell text-xs text-muted-foreground">
                      <span className="font-mono text-white font-medium">{usedCount}</span>
                      {c.max_uses !== null ? ` / ${c.max_uses}` : " (Ilimitado)"}
                    </td>

                    <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-muted-foreground">
                      {c.expires_at ? (
                        <span className={isExpired ? "text-red-400" : ""}>
                          {new Date(c.expires_at).toLocaleDateString()} {isExpired ? "(Expirado)" : ""}
                        </span>
                      ) : (
                        "Nunca"
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          c.is_active && !isExpired
                            ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20 hover:bg-emerald-400/20"
                            : "bg-amber-400/10 text-amber-300 border-amber-400/20 hover:bg-amber-400/20"
                        }`}
                      >
                        {c.is_active && !isExpired ? "Activo" : isExpired ? "Expirado" : "Pausado"}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(c)}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-cyan-400" /> Crear Cupón de Descuento
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Código del Cupón (Ej. SUMMER20)</Label>
              <Input
                required
                placeholder="PROMO20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="mt-1.5 bg-card border-white/10 font-mono tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Descuento</Label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                  className="w-full h-10 mt-1.5 rounded-md bg-card border border-white/10 px-3 text-sm text-white"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Fijo en Euros (€)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Valor ({form.discount_type === "percentage" ? "%" : "€"})
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  placeholder={form.discount_type === "percentage" ? "20" : "10.00"}
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="mt-1.5 bg-card border-white/10 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Gasto Mínimo (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.min_spend}
                  onChange={(e) => setForm({ ...form, min_spend: e.target.value })}
                  className="mt-1.5 bg-card border-white/10 font-mono"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Límite de Usos (Opcional)</Label>
                <Input
                  type="number"
                  placeholder="Ilimitado"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="mt-1.5 bg-card border-white/10 font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Fecha de Expiración (Opcional)</Label>
              <Input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-white text-black hover:bg-white/90 font-semibold"
              >
                {submitting ? "Creando..." : "Crear Cupón"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
