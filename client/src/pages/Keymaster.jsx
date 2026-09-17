import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Key, Download, ShieldCheck, Server, Copy, Check, ExternalLink,
  RefreshCw, Send, BookOpen, AlertCircle, Sparkles, Terminal,
  HelpCircle, Eye, EyeOff, Search, Activity, Trash2, ArrowRightLeft,
  Layers, CheckCircle2, Shield
} from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function Keymaster() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("assets");
  const [licenses, setLicenses] = useState([]);
  const [servers, setServers] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingServers, setLoadingServers] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showKeyId, setShowKeyId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit Server IP Modal
  const [ipModalLicense, setIpModalLicense] = useState(null);
  const [ipInput, setIpInput] = useState("");
  const [savingIp, setSavingIp] = useState(false);

  // Guide Modal
  const [guideLicense, setGuideLicense] = useState(null);

  // Transfer Modal
  const [transferLicense, setTransferLicense] = useState(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Unlink Server confirmation
  const [serverToUnlink, setServerToUnlink] = useState(null);
  const [unlinking, setUnlinking] = useState(false);

  const loadLicenses = () => {
    setLoading(true);
    api.get("/licenses/my-licenses")
      .then((res) => {
        setLicenses(Array.isArray(res.data?.licenses) ? res.data.licenses : []);
      })
      .catch(() => {
        api.get("/me/licenses")
          .then((r) => setLicenses(Array.isArray(r.data) ? r.data : []))
          .catch(() => setLicenses([]));
      })
      .finally(() => setLoading(false));
  };

  const loadServers = () => {
    setLoadingServers(true);
    api.get("/licenses/my-servers")
      .then((res) => {
        setServers(Array.isArray(res.data?.servers) ? res.data.servers : []);
      })
      .catch(() => setServers([]))
      .finally(() => setLoadingServers(false));
  };

  const loadTransfers = () => {
    api.get("/licenses/my-transfers")
      .then((res) => {
        setTransfers(Array.isArray(res.data?.transfers) ? res.data.transfers : []);
      })
      .catch(() => setTransfers([]));
  };

  useEffect(() => {
    loadLicenses();
    loadServers();
    loadTransfers();
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success("Clave de licencia copiada al portapapeles");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadEscrow = async (license) => {
    setDownloadingId(license.id);
    try {
      toast.info(`Generando paquete encriptado para ${license.product_title || license.product_name}...`);
      
      const response = await api.get(`/downloads/escrow/${license.id}`, {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "application/zip" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `[VERTEX-ESCROW]-${license.product_slug || "script"}-v${license.product_version || "1.0.0"}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("¡Descarga de script encriptado completada!");
      loadLicenses();
      loadServers();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.error || err.response?.data?.detail) || "Error al descargar el archivo");
    } finally {
      setDownloadingId(null);
    }
  };

  const openIpModal = (lic) => {
    setIpModalLicense(lic);
    setIpInput(lic.bound_server_ip || "");
  };

  const saveServerIp = async () => {
    if (!ipModalLicense) return;
    setSavingIp(true);
    try {
      await api.put(`/licenses/${ipModalLicense.id}/server-ip`, { serverIp: ipInput.trim() });
      toast.success("IP de servidor FiveM vinculada exitosamente");
      setIpModalLicense(null);
      loadLicenses();
      loadServers();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.error || err.response?.data?.detail) || "Error al actualizar IP");
    } finally {
      setSavingIp(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferLicense || !transferTarget.trim()) return;
    setTransferring(true);
    try {
      await api.post(`/licenses/${transferLicense.id}/transfer`, { targetUser: transferTarget.trim() });
      toast.success(`Licencia transferida correctamente a "${transferTarget}"`);
      setTransferLicense(null);
      setTransferTarget("");
      loadLicenses();
      loadServers();
      loadTransfers();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al transferir la licencia");
    } finally {
      setTransferring(false);
    }
  };

  const handleUnlinkServer = async () => {
    if (!serverToUnlink) return;
    setUnlinking(true);
    try {
      await api.delete(`/licenses/servers/${serverToUnlink.id}`);
      toast.success("Servidor desvinculado con éxito. La IP ha quedado liberada.");
      setServerToUnlink(null);
      loadServers();
      loadLicenses();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.error) || "Error al desvincular servidor");
    } finally {
      setUnlinking(false);
    }
  };

  // Filter assets
  const filteredLicenses = licenses.filter((l) => {
    const title = (l.product_title || l.product_name || "").toLowerCase();
    const key = (l.license_key || l.key || "").toLowerCase();
    const matchesSearch = !searchQuery || title.includes(searchQuery.toLowerCase()) || key.includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || (l.category || "scripts").toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const activeLicenses = licenses.filter((l) => String(l.status).toLowerCase() === "active").length;

  return (
    <div className="vx-container py-8 max-w-7xl">
      {/* Header Banner - Cfx.re Keymaster Style */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d14] p-7 md:p-9 mb-8 shadow-2xl">
        {/* Banner Background */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/banner.png"
            alt="Vertex Keymaster Banner"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d14] via-[#0d0d14]/90 to-[#0d0d14]/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Vertex Keymaster Portal · Cfx.re Escrow Compatible
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight flex items-center gap-3">
              <Key className="h-9 w-9 text-white" />
              Vertex Keymaster
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-xs md:text-sm leading-relaxed">
              Administra tus scripts protegidos para FiveM, monitorea en tiempo real los servidores donde se ejecutan tus licencias
              y descarga tus paquetes con cifrado Vertex Escrow.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
            <div className="text-center px-2">
              <div className="text-2xl font-black font-display text-white">{licenses.length}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Assets</div>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <div className="text-2xl font-black font-display text-emerald-400">{activeLicenses}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Activas</div>
            </div>
            <div className="text-center px-2">
              <div className="text-2xl font-black font-display text-sky-400">{servers.length}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Servidores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cfx.re Keymaster Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 mb-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "assets"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Purchased Assets ({licenses.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab("servers"); loadServers(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "servers"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Registered Servers ({servers.length})</span>
          {servers.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab("transfers"); loadTransfers(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "transfers"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Asset Transfers ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === "docs"
              ? "bg-white text-black font-bold shadow-lg"
              : "text-muted-foreground hover:text-white hover:bg-white/5"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Documentation & Escrow</span>
        </button>
      </div>

      {/* TAB 1: PURCHASED ASSETS */}
      {activeTab === "assets" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-card border-white/10 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["all", "scripts", "ui", "framework", "vehicles"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    categoryFilter === c ? "bg-white text-black font-semibold" : "text-muted-foreground hover:text-white bg-white/5"
                  }`}
                >
                  {c === "all" ? "Todos" : c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-card p-16 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
              <p className="font-mono text-sm text-muted-foreground">Cargando tus recursos de Keymaster...</p>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-card p-12 md:p-16 text-center max-w-xl mx-auto shadow-xl">
              <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-white/60">
                <Key className="h-8 w-8" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-2">No tienes scripts en tu Keymaster</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Cuando adquieras un script en la tienda, aparecerá aquí con su paquete encriptado y listo para vincular a tu servidor FiveM.
              </p>
              <Button asChild className="bg-white text-black hover:bg-white/90 font-semibold px-6">
                <Link to="/store">Explorar Scripts en la Tienda</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredLicenses.map((lic) => {
                const prodTitle = lic.product_title || lic.product_name || "Recurso FiveM";
                const key = lic.license_key || lic.key || "VTX-PENDING";
                const isVisible = showKeyId === lic.id;
                const isDownloading = downloadingId === lic.id;

                return (
                  <div
                    key={lic.id}
                    data-testid={`keymaster-asset-${lic.id}`}
                    className="rounded-2xl border border-white/10 bg-[#0e0e14] hover:border-white/20 transition-all p-6 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Asset Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={lic.thumbnail || lic.image || "/logo.png"}
                            alt={prodTitle}
                            className="h-14 w-14 rounded-xl object-cover border border-white/10 bg-white/5 shrink-0"
                          />
                          <div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                              Asset ID: VTX-AST-{String(lic.id).padStart(5, "0")}
                            </div>
                            <h3 className="font-display font-bold text-lg text-white leading-tight mt-0.5">{prodTitle}</h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="font-mono text-white/80">v{lic.product_version || "1.0.0"}</span>
                              <span>·</span>
                              <span>{lic.category || "Script"}</span>
                              {lic.frameworks && lic.frameworks.length > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-sky-400">{lic.frameworks.join(", ")}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
                            lic.status === "Active"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-red-500/10 border-red-500/30 text-red-400"
                          }`}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {lic.status === "Active" ? "Escrow Protegido" : lic.status}
                          </span>
                        </div>
                      </div>

                      {/* License Key Field */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span className="font-mono">Clave de Licencia (License Key)</span>
                          <button
                            onClick={() => setShowKeyId(isVisible ? null : lic.id)}
                            className="hover:text-white flex items-center gap-1 text-[11px]"
                          >
                            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            {isVisible ? "Ocultar" : "Mostrar"}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-xl bg-black/60 border border-white/10 px-3.5 py-2.5 font-mono text-sm text-white flex items-center justify-between select-all">
                            <span>{isVisible ? key : key.replace(/([^-]{4})(?=[^-])/g, "****")}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-sans">FiveM Auth</span>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(key, lic.id)}
                            size="sm"
                            variant="outline"
                            className="border-white/10 hover:bg-white/10 h-10 px-3 shrink-0"
                            title="Copiar Clave"
                          >
                            {copiedKey === lic.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Server IP Binding */}
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 mb-5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-sky-400 shrink-0" />
                            <div>
                              <span className="text-muted-foreground">IP Autorizada: </span>
                              <span className="font-mono text-white font-medium">
                                {lic.bound_server_ip ? lic.bound_server_ip : "Cualquiera (Detección al arrancar)"}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => openIpModal(lic)}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs hover:bg-white/10 text-sky-300 hover:text-white px-2.5"
                          >
                            {lic.bound_server_ip ? "Cambiar IP" : "Vincular IP"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <Button
                          onClick={() => handleDownloadEscrow(lic)}
                          disabled={isDownloading || lic.status !== "Active"}
                          className="bg-white text-black hover:bg-white/90 font-semibold text-xs h-10 flex items-center justify-center gap-1.5 shadow-md"
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Generando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              <span>Descargar (.zip)</span>
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => setGuideLicense(lic)}
                          variant="outline"
                          className="border-white/15 hover:bg-white/5 text-xs h-10 flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Instalación</span>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 px-1">
                        <span>Adquirido: {new Date(lic.created_at).toLocaleDateString()}</span>
                        <button
                          onClick={() => setTransferLicense(lic)}
                          className="hover:text-sky-300 transition-colors"
                        >
                          Transferir Activo
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTERED SERVERS (Cfx.re Keymaster Live Tracking) */}
      {activeTab === "servers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-sky-400" />
                Servidores FiveM Registrados (Active Licences)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aquí se registran automáticamente los servidores de FiveM que han iniciado tus scripts protegidos con su hostname, IP y estado.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={loadServers}
              disabled={loadingServers}
              className="border-white/15 hover:bg-white/10 text-xs h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loadingServers ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {servers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-card p-12 text-center max-w-xl mx-auto shadow-xl">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/60">
                <Server className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">Ningún servidor conectado todavía</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Cuando inicies tu servidor FiveM con alguno de tus scripts en <code>resources/</code>, el servidor enviará su señal de autorización y aparecerá registrado aquí automáticamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("assets")}
                className="border-white/15 hover:bg-white/10 text-xs"
              >
                Ver Mis Scripts Comprados
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto shadow-xl">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Nombre del Servidor (sv_hostname)</th>
                    <th className="text-left font-medium px-4 py-3">Dirección IP & Puerto</th>
                    <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Script Asociado</th>
                    <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Jugadores</th>
                    <th className="text-left font-medium px-4 py-3">Última Señal (Heartbeat)</th>
                    <th className="text-left font-medium px-4 py-3">Estado</th>
                    <th className="text-right font-medium px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {servers.map((srv) => {
                    const isOnline = srv.status === "online";
                    return (
                      <tr key={srv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <div>
                              <div className="font-semibold text-white text-xs">{srv.server_name}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{srv.game_build || "FiveM Server"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs">
                          <span className="text-sky-300 font-semibold">{srv.server_ip}</span>
                          <span className="text-muted-foreground">:{srv.server_port || "30120"}</span>
                        </td>

                        <td className="px-4 py-3.5 hidden md:table-cell text-xs">
                          <div className="font-medium text-white">{srv.product_title}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{srv.license_key}</div>
                        </td>

                        <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-muted-foreground font-mono">
                          {srv.max_players || 32} max
                        </td>

                        <td className="px-4 py-3.5 text-xs text-muted-foreground font-mono">
                          {new Date(srv.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(srv.last_seen_at).toLocaleDateString()})
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                            isOnline
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-white/5 border-white/10 text-muted-foreground"
                          }`}>
                            <Activity className="h-3 w-3" />
                            {isOnline ? "En Línea" : "Desconectado"}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setServerToUnlink(srv)}
                            className="border-white/15 hover:bg-white/5 text-red-400 hover:text-red-300 h-8 text-xs"
                            title="Desvincular y liberar IP para cambiar de host"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Desvincular
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSET TRANSFERS */}
      {activeTab === "transfers" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-sky-400" />
                Historial de Transferencias de Recursos
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registro oficial de scripts transferidos o recibidos entre usuarios de Vertex Studio.
              </p>
            </div>
          </div>

          {transfers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-card p-12 text-center max-w-xl mx-auto shadow-xl">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-white/60">
                <ArrowRightLeft className="h-7 w-7" />
              </div>
              <h3 className="font-display font-bold text-lg mb-1">No hay transferencias registradas</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Puedes transferir cualquier script de tu propiedad a otro usuario directamente desde la pestaña "Purchased Assets".
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto shadow-xl">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Recurso / Script</th>
                    <th className="text-left font-medium px-4 py-3">Origen</th>
                    <th className="text-left font-medium px-4 py-3">Destinatario</th>
                    <th className="text-left font-medium px-4 py-3">Fecha</th>
                    <th className="text-right font-medium px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {transfers.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-semibold text-white">{t.product_title}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.from_email || `@${t.from_username}`}</td>
                      <td className="px-4 py-3 text-xs text-sky-300 font-medium">{t.to_email || `@${t.to_username}`}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{new Date(t.transferred_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-emerald-400 font-mono">Completada</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DOCUMENTATION & ESCROW */}
      {activeTab === "docs" && (
        <div className="rounded-3xl border border-white/10 bg-card p-8 md:p-10 space-y-6 max-w-4xl">
          <div>
            <h2 className="font-display font-bold text-2xl text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-emerald-400" />
              Guía Oficial de Vertex Keymaster & Escrow
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Todo lo que necesitas saber sobre la seguridad, activación y administración de tus scripts de FiveM.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¿Cómo descargo mi script?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ve a la pestaña <strong>Purchased Assets</strong> y haz clic en <strong>Descargar (.zip)</strong>. El archivo se generará con tu clave de licencia inyectada automáticamente.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¿Puedo probar en Localhost?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sí. Vertex Keymaster permite siempre la IP <code>127.0.0.1</code> y <code>localhost</code> para que puedas desarrollar y testear en tu computadora sin consumir tu autorización de servidor.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¿Qué pasa si cambio de Hosting?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ve a la pestaña <strong>Registered Servers</strong> y haz clic en <strong>Desvincular</strong>. Esto liberará la licencia y tu nuevo hosting podrá autorizarse de inmediato.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>¿Cómo funciona el Cifrado?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El código del servidor está protegido con bytecode cifrado mediante Vertex Escrow. Se auto-descifra en memoria únicamente en servidores que cuenten con una clave activa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Modal 1: Vincular IP de Servidor */}
      <Dialog open={Boolean(ipModalLicense)} onOpenChange={(open) => !open && setIpModalLicense(null)}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Server className="h-5 w-5 text-sky-400" />
              Vincular IP de Servidor FiveM
            </DialogTitle>
            <DialogDescription className="text-xs">
              Introduce la dirección IP pública de tu servidor de FiveM (ej. de tu VPS o Host). Para pruebas en tu PC déjalo vacío o usa <code>127.0.0.1</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-2">
            <label className="text-xs text-muted-foreground font-mono">IP del Servidor (IPv4)</label>
            <Input
              placeholder="Ej: 185.220.101.5 o 127.0.0.1"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="bg-card border-white/10 font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              Puedes cambiar esta IP cuando cambies de hosting tantas veces como necesites.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIpModalLicense(null)}>Cancelar</Button>
            <Button disabled={savingIp} size="sm" onClick={saveServerIp} className="bg-white text-black hover:bg-white/90 font-semibold">
              {savingIp ? "Guardando..." : "Guardar IP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Guía de Instalación */}
      <Dialog open={Boolean(guideLicense)} onOpenChange={(open) => !open && setGuideLicense(null)}>
        <DialogContent className="glass border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              Guía de Instalación Rápida
            </DialogTitle>
            <DialogDescription className="text-xs">
              {guideLicense?.product_title || guideLicense?.product_name}
            </DialogDescription>
          </DialogHeader>
          {guideLicense && (
            <div className="space-y-4 my-2 text-xs">
              <div className="space-y-1.5">
                <span className="font-medium text-white">1. En tu archivo server.cfg:</span>
                <div className="p-2.5 rounded-lg bg-black/80 font-mono text-emerald-300 border border-white/10 flex items-center justify-between">
                  <span>ensure {guideLicense.product_slug || "recurso"}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      navigator.clipboard.writeText(`ensure ${guideLicense.product_slug || "recurso"}`);
                      toast.success("Copiado al portapapeles");
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-medium text-white">2. En tu archivo config.lua:</span>
                <div className="p-2.5 rounded-lg bg-black/80 font-mono text-white/90 border border-white/10 select-all">
                  Config.LicenseKey = "{guideLicense.license_key || guideLicense.key}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Al iniciar el servidor FiveM, se registrará automáticamente en tu pestaña "Registered Servers" con su hostname e IP en tiempo real.
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button size="sm" onClick={() => setGuideLicense(null)} className="bg-white text-black hover:bg-white/90 font-semibold">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 4: Transferir Licencia */}
      <Dialog open={Boolean(transferLicense)} onOpenChange={(open) => !open && setTransferLicense(null)}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-sky-400">
              <Send className="h-5 w-5" />
              Transferir Activo a Otro Usuario (Keymaster Transfer)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Igual que en Cfx.re Keymaster, puedes transferir este script a otro usuario registrado en Vertex Studio. Una vez transferido, pasará a su inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-2">
            <label className="text-xs text-muted-foreground">Email o Usuario del destinatario en Vertex Studio:</label>
            <Input
              placeholder="correo@ejemplo.com o nombre_usuario"
              value={transferTarget}
              onChange={(e) => setTransferTarget(e.target.value)}
              className="bg-card border-white/10 text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setTransferLicense(null)}>Cancelar</Button>
            <Button disabled={transferring || !transferTarget.trim()} size="sm" onClick={handleTransfer} className="bg-sky-500 text-white hover:bg-sky-400 font-semibold">
              {transferring ? "Transfiriendo..." : "Transferir Activo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal 5: Desvincular Servidor */}
      <Dialog open={Boolean(serverToUnlink)} onOpenChange={(open) => !open && setServerToUnlink(null)}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              ¿Desvincular Servidor FiveM?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Al desvincular <strong>{serverToUnlink?.server_name}</strong> ({serverToUnlink?.server_ip}), la IP quedará liberada en tu licencia para que puedas montar tu script en un nuevo host o VPS.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setServerToUnlink(null)}>Cancelar</Button>
            <Button disabled={unlinking} size="sm" onClick={handleUnlinkServer} className="bg-red-500 text-white hover:bg-red-400 font-semibold">
              {unlinking ? "Desvinculando..." : "Confirmar y Liberar IP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
