import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Key, Download, ShieldCheck, Server, Copy, Check, ExternalLink,
  RefreshCw, Send, BookOpen, AlertCircle, Sparkles, Terminal, ArrowRight,
  HelpCircle, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function Keymaster() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showKeyId, setShowKeyId] = useState(null);

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

  // Regenerate Key confirmation
  const [regenLicense, setRegenLicense] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const loadLicenses = () => {
    setLoading(true);
    api.get("/licenses/my-licenses")
      .then((res) => {
        setLicenses(Array.isArray(res.data?.licenses) ? res.data.licenses : []);
      })
      .catch(() => {
        // Fallback to /me/licenses
        api.get("/me/licenses")
          .then((r) => setLicenses(Array.isArray(r.data) ? r.data : []))
          .catch(() => setLicenses([]));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLicenses();
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
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.error || err.response?.data?.detail) || "Error al actualizar IP");
    } finally {
      setSavingIp(false);
    }
  };

  const handleRegenerate = async () => {
    if (!regenLicense) return;
    setRegenerating(true);
    try {
      const res = await api.post(`/licenses/${regenLicense.id}/regenerate`);
      toast.success("Nueva clave generada. Recuerda actualizar tu config.lua.");
      setRegenLicense(null);
      loadLicenses();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al regenerar clave");
    } finally {
      setRegenerating(false);
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
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al transferir la licencia");
    } finally {
      setTransferring(false);
    }
  };

  const activeLicenses = licenses.filter((l) => String(l.status).toLowerCase() === "active").length;
  const boundServers = licenses.filter((l) => Boolean(l.bound_server_ip)).length;

  return (
    <div className="vx-container py-10 max-w-7xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#14141c] via-[#0d0d12] to-[#080808] p-8 md:p-10 mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Vertex Keymaster · Escrow & DRM Engine v2.0
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight flex items-center gap-3">
              <Key className="h-9 w-9 text-white" />
              Vertex Keymaster
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
              Tu portal personal de gestión de scripts protegidos para FiveM. Descarga tus paquetes cifrados,
              vincula la IP de tu servidor y administra tus licencias oficiales sin intermediarios.
            </p>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shrink-0">
            <div className="text-center px-3">
              <div className="text-2xl font-black font-display text-white">{licenses.length}</div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Recursos</div>
            </div>
            <div className="text-center px-3 border-x border-white/10">
              <div className="text-2xl font-black font-display text-emerald-400">{activeLicenses}</div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Activas</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black font-display text-sky-400">{boundServers}</div>
              <div className="text-[11px] font-mono text-muted-foreground uppercase">Servidores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-card p-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="font-mono text-sm text-muted-foreground">Conectando con Vertex Keymaster Cloud...</p>
        </div>
      ) : licenses.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-card p-12 md:p-16 text-center max-w-2xl mx-auto shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-white/60">
            <Key className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">No tienes scripts en tu Keymaster</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Cuando adquieras o reclames un script en nuestra tienda, se generará tu clave de autorización y tu paquete encriptado automáticamente aquí.
          </p>
          <Button asChild className="bg-white text-black hover:bg-white/90 font-semibold px-6">
            <Link to="/store">Explorar Scripts en la Tienda</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Tus Scripts Protegidos (Granted Assets)
            </h2>
            <span className="text-xs font-mono text-muted-foreground">{licenses.length} recursos asignados</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {licenses.map((lic) => {
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
                    {/* Card Header: Product Info & Status */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={lic.thumbnail || lic.image || "/logo.png"}
                          alt={prodTitle}
                          className="h-14 w-14 rounded-xl object-cover border border-white/10 bg-white/5 shrink-0"
                        />
                        <div>
                          <h3 className="font-display font-bold text-lg text-white leading-tight">{prodTitle}</h3>
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
                          {lic.status === "Active" ? "Protegido (Escrow)" : lic.status}
                        </span>
                      </div>
                    </div>

                    {/* License Key Display */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="font-mono">Clave de Licencia Vertex (License Key)</span>
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
                          <span className="text-[10px] text-muted-foreground uppercase font-sans">Auth Key</span>
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

                    {/* Server IP Binding Section */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 mb-5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="text-muted-foreground">Servidor Vinculado: </span>
                            <span className="font-mono text-white font-medium">
                              {lic.bound_server_ip ? lic.bound_server_ip : "Cualquiera (Auto-detección al iniciar)"}
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

                  {/* Actions Bar */}
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setRegenLicense(lic)}
                          className="hover:text-amber-300 transition-colors"
                        >
                          Regenerar
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => setTransferLicense(lic)}
                          className="hover:text-sky-300 transition-colors"
                        >
                          Transferir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How it works info cards */}
      <div className="mt-16 rounded-3xl border border-white/10 bg-card p-8 md:p-10">
        <h3 className="font-display font-bold text-xl mb-6 text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-sky-400" />
          ¿Cómo Funciona la Protección de Vertex Keymaster?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-primary/20 text-white flex items-center justify-center font-bold text-sm font-mono">1</div>
            <h4 className="font-display font-bold text-sm text-white">Descarga tu Paquete Cifrado</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              El archivo descargado contiene los scripts listos con tu clave de licencia inyectada y el módulo del servidor protegido contra manipulaciones.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm font-mono">2</div>
            <h4 className="font-display font-bold text-sm text-white">Colócalo en tu Servidor</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Extrae la carpeta en <code>resources/[scripts]</code> y añade <code>ensure nombre-del-script</code> en tu <code>server.cfg</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm font-mono">3</div>
            <h4 className="font-display font-bold text-sm text-white">Autenticación en la Nube</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Al iniciar tu servidor FiveM, el script verifica la licencia contra Vertex Cloud en 0.05s y se ejecuta fluidamente sin consumir recursos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal 1: Vincular IP de Servidor */}
      <Dialog open={Boolean(ipModalLicense)} onOpenChange={(open) => !open && setIpModalLicense(null)}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Server className="h-5 w-5 text-sky-400" />
              Vincular IP de Servidor FiveM
            </DialogTitle>
            <DialogDescription className="text-xs">
              Introduce la dirección IP pública de tu servidor de FiveM (ej. de tu VPS o Host). Si corres el servidor en tu propia PC para pruebas, déjalo vacío o usa <code>127.0.0.1</code>.
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
                  El script se ejecuta mediante el motor autónomo de Vertex Escrow. No requiere plugins externos en tu servidor FiveM.
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

      {/* Modal 3: Regenerar Clave */}
      <Dialog open={Boolean(regenLicense)} onOpenChange={(open) => !open && setRegenLicense(null)}>
        <DialogContent className="glass border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-amber-400">
              <RefreshCw className="h-5 w-5" />
              ¿Regenerar Clave de Licencia?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Si tu clave actual ha sido expuesta o compartida sin querer, generar una nueva revocará inmediatamente la anterior en todos los servidores.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRegenLicense(null)}>Cancelar</Button>
            <Button disabled={regenerating} size="sm" onClick={handleRegenerate} className="bg-amber-400 text-black hover:bg-amber-300 font-semibold">
              {regenerating ? "Regenerando..." : "Confirmar y Regenerar"}
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
              Transferir Licencia a Otro Usuario
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transfiere la propiedad de este script a otro usuario registrado en Vertex Studio. La licencia se transferirá a su cuenta y dejarás de tener acceso a ella.
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
              {transferring ? "Transfiriendo..." : "Transferir Licencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
