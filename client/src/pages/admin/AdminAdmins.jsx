import { useEffect, useState } from "react";
import { Shield, ShieldCheck, UserPlus, UserX, Crown, Mail, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const SUPER_ADMINS = ["sebasruades8@gmail.com", "kingsitonassir@gmail.com"];

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/admins");
      setAdmins(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Error al cargar administradores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("El correo electrónico es requerido");
    try {
      setSubmitting(true);
      const res = await api.post("/admin/admins", {
        email: email.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined
      });
      toast.success(res.data?.message || "Administrador asignado correctamente");
      setOpen(false);
      setEmail("");
      setUsername("");
      setPassword("");
      loadAdmins();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al agregar administrador");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemote = async (admin) => {
    if (SUPER_ADMINS.map((e) => e.toLowerCase()).includes(admin.email.toLowerCase())) {
      return toast.error("No se puede degradar a un Administrador Principal");
    }

    if (!window.confirm(`¿Estás seguro de degradar a ${admin.name || admin.email} de vuelta al rol de cliente?`)) {
      return;
    }

    try {
      await api.post(`/admin/admins/${admin.id}/demote`);
      toast.success(`${admin.name || admin.email} degradado a cliente`);
      loadAdmins();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al degradar administrador");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono mb-2">
            <Shield className="h-3.5 w-3.5" /> Zona de Administración
          </div>
          <h1 className="font-display font-black text-2xl text-white">Administradores y Staff</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestión y control de cuentas con acceso total al panel administrativo de Vertex Studio.
          </p>
        </div>

        <Button
          onClick={() => setOpen(true)}
          data-testid="btn-add-admin"
          className="bg-white text-black hover:bg-white/90 font-semibold"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Añadir Administrador
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Administradores</span>
          <div className="mt-2 font-display font-black text-3xl text-white">{admins.length}</div>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Super Admins Principales</span>
          <div className="mt-2 text-xs font-semibold text-white space-y-1">
            <div className="flex items-center gap-2 truncate">
              <Crown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate">sebasruades8@gmail.com</span>
            </div>
            <div className="flex items-center gap-2 truncate text-muted-foreground">
              <Crown className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
              <span className="truncate">kingsitonassir@gmail.com</span>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Estado de Seguridad</span>
          <div className="mt-2 text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Cuentas Protegidas</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Administrador</th>
              <th className="text-left font-medium px-4 py-3">Rango / Privilegios</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Discord</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Fecha de Registro</th>
              <th className="text-right font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Cargando equipo administrativo...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No se encontraron administradores activos.
                </td>
              </tr>
            ) : (
              admins.map((a) => {
                const isSuper = SUPER_ADMINS.map((e) => e.toLowerCase()).includes(a.email.toLowerCase());
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
                          {a.avatar ? (
                            <img src={a.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Shield className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            {a.name || a.username || "Admin"}
                            {isSuper && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                                <Crown className="h-3 w-3" /> Dueño
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {a.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md">
                          <Crown className="h-3.5 w-3.5" /> Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-md">
                          <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {a.discord_tag || (a.discord_id ? `ID: ${a.discord_id}` : "No vinculado")}
                    </td>

                    <td className="px-4 py-4 hidden md:table-cell text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {a.created_at ? new Date(a.created_at).toLocaleDateString() : "N/A"}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground px-2.5 py-1 rounded bg-white/5 border border-white/10">
                          <Shield className="h-3.5 w-3.5 text-amber-400" /> Inmune
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDemote(a)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 text-xs h-8"
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" /> Degradar
                        </Button>
                      )}
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
              <UserPlus className="h-5 w-5 text-emerald-400" /> Añadir Administrador
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddAdmin} className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                Si el usuario ya está registrado con este correo, será <strong>promovido a Admin</strong> inmediatamente. Si no existe, se creará su cuenta de staff con los datos que indiques.
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Correo Electrónico (Requerido)</Label>
              <Input
                type="email"
                required
                placeholder="admin@tudominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Nombre / Tag Staff (Opcional)</Label>
              <Input
                type="text"
                placeholder="Ej. StaffCarlos"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Contraseña Inicial (Opcional, por defecto AdminVertex2026!)</Label>
              <Input
                type="password"
                placeholder="Min. 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {submitting ? "Guardando..." : "Asignar Administrador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
