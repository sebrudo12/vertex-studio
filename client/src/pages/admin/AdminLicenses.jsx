import { useEffect, useState } from "react";
import { Ban, RotateCcw, Plus, Key, Server, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const COLOR = { Active: "text-emerald-300", Expired: "text-amber-300", Revoked: "text-red-400" };

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [productId, setProductId] = useState("");
  const [boundIp, setBoundIp] = useState("");
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.get("/admin/licenses")
      .then((r) => setLicenses(Array.isArray(r.data) ? r.data : []))
      .catch(() => setLicenses([]));
  };

  useEffect(() => {
    load();
    api.get("/admin/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const act = async (id, action) => {
    await api.post(`/admin/licenses/${id}/${action}`);
    toast.success("Estado de licencia actualizado");
    load();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!userEmail.trim() || !productId) {
      toast.error("Por favor completa el email del usuario y selecciona un producto");
      return;
    }
    setCreating(true);
    try {
      await api.post("/admin/licenses", {
        user_email: userEmail.trim(),
        product_id: parseInt(productId, 10),
        bound_server_ip: boundIp.trim() || null
      });
      toast.success("¡Licencia generada con éxito y entregada en el Keymaster del usuario!");
      setOpenModal(false);
      setUserEmail("");
      setProductId("");
      setBoundIp("");
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al crear la licencia");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-black text-2xl">Keymaster Licenses</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Control y gestión de licencias emitidas y servidores vinculados.</p>
        </div>
        <Button onClick={() => setOpenModal(true)} className="bg-white text-black hover:bg-white/90 font-semibold text-xs">
          <Plus className="h-4 w-4 mr-1" /> Emitir Licencia Manual
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Clave de Licencia</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Propietario</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Producto</th>
              <th className="text-left font-medium px-4 py-3">Servidor FiveM (IP)</th>
              <th className="text-left font-medium px-4 py-3">Estado</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {licenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No hay licencias emitidas todavía.
                </td>
              </tr>
            ) : (
              licenses.map((l) => (
                <tr key={l.id} data-testid={`admin-license-${l.id}`}>
                  <td className="px-4 py-3 font-mono text-xs text-white">
                    <div className="flex items-center gap-1.5">
                      <Key className="h-3 w-3 text-muted-foreground" />
                      <span>{l.key}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    <div>{l.user_email}</div>
                    {l.user_name && l.user_name !== "Unknown" && (
                      <div className="text-[10px] text-white/50">@{l.user_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell font-medium">{l.product_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {l.bound_server_ip ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sky-300">{l.bound_server_ip}</span>
                        <button
                          onClick={() => act(l.id, "reset_ip")}
                          title="Resetear IP vinculada para permitir nuevo servidor"
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No vinculada (Local/Auto)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${COLOR[l.status] || "text-emerald-300"}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "Active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(l.id, "revoke")}
                        data-testid={`revoke-${l.id}`}
                        className="border-white/15 hover:bg-white/5 text-red-400 h-8 text-xs"
                      >
                        <Ban className="h-3.5 w-3.5 mr-1" /> Revocar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => act(l.id, "reactivate")}
                        data-testid={`reactivate-${l.id}`}
                        className="border-white/15 hover:bg-white/5 h-8 text-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reactivar
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Emitir Licencia Manual */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              Emitir Licencia Manual a Usuario
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 my-2">
            <div>
              <label className="text-xs text-muted-foreground">Email del Usuario:</label>
              <Input
                placeholder="ej: cliente@correo.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="bg-card border-white/10 text-xs mt-1"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Seleccionar Producto:</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full h-10 rounded-md bg-card border border-white/10 px-3 text-xs mt-1 text-white"
              >
                <option value="">-- Selecciona un Script --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (€{Number(p.price).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">IP de Servidor Inicial (Opcional):</label>
              <Input
                placeholder="Ej: 185.220.101.5 o dejar en blanco"
                value={boundIp}
                onChange={(e) => setBoundIp(e.target.value)}
                className="bg-card border-white/10 text-xs mt-1 font-mono"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpenModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={creating} size="sm" className="bg-white text-black hover:bg-white/90 font-semibold">
                {creating ? "Generando..." : "Emitir y Entregar Licencia"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
