import { useEffect, useState } from "react";
import { Shield, ShieldCheck, UserPlus, UserX, Crown, Mail, Calendar, Sparkles, Plus, Trash2, Tag, Users } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const SUPER_ADMIN = "sebasruades8@gmail.com";

const PRESET_COLORS = [
  { label: "Esmeralda", value: "#10b981" },
  { label: "Azul Cielo", value: "#0ea5e9" },
  { label: "Púrpura", value: "#a855f7" },
  { label: "Índigo", value: "#6366f1" },
  { label: "Ámbar", value: "#f59e0b" },
  { label: "Rosa", value: "#f43f5e" },
  { label: "Cian", value: "#06b6d4" },
  { label: "Gris Platino", value: "#94a3b8" }
];

export default function AdminAdmins() {
  const [activeTab, setActiveTab] = useState("staff"); // "staff" | "roles"
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add staff modal
  const [openStaffModal, setOpenStaffModal] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("Administrador");
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Create role modal
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleColor, setRoleColor] = useState("#38bdf8");
  const [roleDescription, setRoleDescription] = useState("");
  const [submittingRole, setSubmittingRole] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adminsRes, rolesRes] = await Promise.all([
        api.get("/admin/admins"),
        api.get("/admin/roles")
      ]);
      setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
      const rList = Array.isArray(rolesRes.data) ? rolesRes.data : [];
      setRoles(rList);
      if (rList.length > 0 && !selectedRole) {
        setSelectedRole(rList[0].name);
      }
    } catch {
      toast.error("Error al sincronizar datos de staff y roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("El correo electrónico es requerido");
    try {
      setSubmittingStaff(true);
      const res = await api.post("/admin/admins", {
        email: email.trim(),
        username: username.trim() || undefined,
        password: password.trim() || undefined,
        staff_role: selectedRole || "Administrador"
      });
      toast.success(res.data?.message || "Miembro de staff asignado exitosamente");
      setOpenStaffModal(false);
      setEmail("");
      setUsername("");
      setPassword("");
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al agregar miembro");
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleChangeRole = async (adminId, newRole) => {
    try {
      await api.put(`/admin/admins/${adminId}/role`, { staff_role: newRole });
      toast.success(`Rango actualizado a "${newRole}"`);
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al actualizar rol");
    }
  };

  const handleDemote = async (admin) => {
    if (admin.email.toLowerCase() === SUPER_ADMIN.toLowerCase()) {
      return toast.error("No se puede degradar al Super Admin Principal");
    }

    if (!window.confirm(`¿Estás seguro de degradar a ${admin.name || admin.email} de vuelta al rol de cliente?`)) {
      return;
    }

    try {
      await api.post(`/admin/admins/${admin.id}/demote`);
      toast.success(`${admin.name || admin.email} degradado a cliente`);
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al degradar");
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return toast.error("El nombre del rol es requerido");
    try {
      setSubmittingRole(true);
      const res = await api.post("/admin/roles", {
        name: roleName.trim(),
        color: roleColor,
        description: roleDescription.trim()
      });
      toast.success(res.data?.message || "Rol creado exitosamente");
      setOpenRoleModal(false);
      setRoleName("");
      setRoleDescription("");
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al crear rol");
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.name === "Administrador" || role.name === "Super Admin") {
      return toast.error("No se puede eliminar un rol del sistema");
    }
    if (!window.confirm(`¿Eliminar el rol "${role.name}"? Los miembros con este rol volverán a Administrador.`)) {
      return;
    }
    try {
      await api.delete(`/admin/roles/${role.id}`);
      toast.success(`Rol "${role.name}" eliminado`);
      loadData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al eliminar rol");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono mb-2">
            <Shield className="h-3.5 w-3.5" /> Zona de Staff & Permisos
          </div>
          <h1 className="font-display font-black text-2xl text-white">Equipo y Roles Personalizados</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Crea roles como Soporte, Moderador y asígnalos a los miembros de tu equipo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setOpenRoleModal(true)}
            variant="outline"
            className="border-white/15 hover:bg-white/5 font-semibold text-xs h-10 px-4"
          >
            <Plus className="h-4 w-4 mr-1.5 text-primary" /> Crear Rol
          </Button>
          <Button
            onClick={() => setOpenStaffModal(true)}
            className="bg-white text-black hover:bg-white/90 font-semibold text-xs h-10 px-4"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Añadir Miembro
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "staff"
              ? "border-white text-white"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" /> Miembros de Staff ({admins.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "roles"
              ? "border-white text-white"
              : "border-transparent text-muted-foreground hover:text-white"
          }`}
        >
          <Tag className="h-4 w-4" /> Gestor de Roles ({roles.length})
        </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Equipo Staff</span>
          <div className="mt-2 font-display font-black text-3xl text-white">{admins.length}</div>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Super Admin Principal</span>
          <div className="mt-2 text-sm font-semibold text-white flex items-center gap-2 truncate">
            <Crown className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="truncate">{SUPER_ADMIN}</span>
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-card">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Roles Configurados</span>
          <div className="mt-2 text-sm font-semibold text-sky-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{roles.length} roles disponibles</span>
          </div>
        </div>
      </div>

      {/* TAB 1: STAFF LIST */}
      {activeTab === "staff" && (
        <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Miembro</th>
                <th className="text-left font-medium px-4 py-3">Rango Asignado</th>
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
                    No se encontraron miembros de staff activos.
                  </td>
                </tr>
              ) : (
                admins.map((a) => {
                  const isSuper = a.email.toLowerCase() === SUPER_ADMIN.toLowerCase();
                  const badgeColor = a.role_color || (isSuper ? "#f59e0b" : "#10b981");

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
                              {a.name || a.username || "Staff"}
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
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border"
                            style={{
                              backgroundColor: "#f59e0b15",
                              borderColor: "#f59e0b40",
                              color: "#f59e0b"
                            }}
                          >
                            <Crown className="h-3.5 w-3.5" /> Super Admin
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={a.staff_role || "Administrador"}
                              onChange={(e) => handleChangeRole(a.id, e.target.value)}
                              className="h-8 rounded-md bg-black/40 border border-white/15 px-2.5 text-xs font-semibold focus:outline-none focus:border-white/40 cursor-pointer"
                              style={{ color: badgeColor }}
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.name} className="bg-[#121217] text-white">
                                  {r.name}
                                </option>
                              ))}
                              {!roles.some((r) => r.name === (a.staff_role || "Administrador")) && (
                                <option value={a.staff_role} className="bg-[#121217] text-white">
                                  {a.staff_role}
                                </option>
                              )}
                            </select>
                          </div>
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
      )}

      {/* TAB 2: ROLES MANAGER */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => {
              const isProtected = r.name === "Administrador" || r.name === "Super Admin";
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-white/10 bg-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border"
                        style={{
                          backgroundColor: `${r.color}20`,
                          borderColor: `${r.color}50`,
                          color: r.color
                        }}
                      >
                        <Tag className="h-3 w-3" />
                        {r.name}
                      </span>

                      {!isProtected && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(r)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Eliminar rol"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {r.description || "Sin descripción asignada."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Miembros con este rol:</span>
                    <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {r.members_count || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      <Dialog open={openStaffModal} onOpenChange={setOpenStaffModal}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Añadir Miembro al Equipo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <Label className="text-xs">Correo Electrónico *</Label>
              <Input
                type="email"
                required
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <div>
              <Label className="text-xs">Rango / Rol *</Label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full mt-1.5 h-10 rounded-md bg-card border border-white/10 px-3 text-sm focus:outline-none focus:border-white/30"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.name} className="bg-[#121217] text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Nombre de Usuario (Opcional)</Label>
              <Input
                placeholder="Nombre o alias"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <div>
              <Label className="text-xs">Contraseña Inicial (Opcional)</Label>
              <Input
                type="password"
                placeholder="Por defecto: AdminVertex2026!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenStaffModal(false)}
                className="border-white/15"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submittingStaff}
                className="bg-white text-black hover:bg-white/90 font-semibold"
              >
                {submittingStaff ? "Guardando..." : "Asignar Staff"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CREATE ROLE */}
      <Dialog open={openRoleModal} onOpenChange={setOpenRoleModal}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Crear Nuevo Rol de Staff</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div>
              <Label className="text-xs">Nombre del Rol *</Label>
              <Input
                required
                placeholder="ej. Soporte, Moderador, Desarrollador..."
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            <div>
              <Label className="text-xs">Color del Distintivo</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setRoleColor(c.value)}
                    className={`h-7 w-7 rounded-full transition-transform border ${
                      roleColor === c.value ? "scale-125 border-white shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Descripción del Rol</Label>
              <Input
                placeholder="ej. Atención a tickets de soporte técnico"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="mt-1.5 bg-card border-white/10"
              />
            </div>

            {/* Live Preview */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1.5">
                Vista previa del rango
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border"
                style={{
                  backgroundColor: `${roleColor}20`,
                  borderColor: `${roleColor}50`,
                  color: roleColor
                }}
              >
                <Tag className="h-3 w-3" />
                {roleName || "Nombre del Rol"}
              </span>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenRoleModal(false)}
                className="border-white/15"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submittingRole}
                className="bg-white text-black hover:bg-white/90 font-semibold"
              >
                {submittingRole ? "Creando..." : "Crear Rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
