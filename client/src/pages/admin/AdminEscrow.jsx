import { useState } from "react";
import { ShieldCheck, Lock, Code2, Download, Copy, Check, Terminal, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_LUA_SAMPLE = `-- Script FiveM de Prueba
print("^2[MiScript] Inicializando logica principal en el servidor FiveM...^7")

RegisterNetEvent("miscript:server:darRecompensa", function(cantidad)
    local src = source
    print("Jugador " .. tostring(src) .. " recibio " .. tostring(cantidad) .. " de dinero.")
end)

AddEventHandler("playerConnecting", function(name, setKickReason, deferrals)
    print("Jugador conectandose: " .. name)
end)
`;

export default function AdminEscrow() {
  const [activeTab, setActiveTab] = useState("encryptor");
  const [rawLua, setRawLua] = useState(DEFAULT_LUA_SAMPLE);
  const [productTitle, setProductTitle] = useState("Mi Script FiveM");
  const [testLicenseKey, setTestLicenseKey] = useState("VERTEX-DEMO-9941-A8F2");
  const [encryptedCode, setEncryptedCode] = useState("");
  const [encrypting, setEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEncrypt = async () => {
    if (!rawLua.trim()) {
      toast.error("Por favor introduce código Lua para encriptar");
      return;
    }
    setEncrypting(true);
    try {
      const res = await api.post("/admin/escrow/encrypt", {
        luaCode: rawLua,
        licenseKey: testLicenseKey.trim() || "VERTEX-DEMO-MASTER",
        productTitle: productTitle.trim() || "Script FiveM Protegido"
      });
      setEncryptedCode(res.data.encryptedLua);
      toast.success("¡Código encriptado con éxito con Vertex Escrow!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Error al encriptar");
    } finally {
      setEncrypting(false);
    }
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Archivo ${filename} descargado`);
  };

  const universalAuthSnippet = `-- ====================================================================
-- VERTEX STUDIO - MODULO UNIVERSAL DE PROTECCION FIVEM (vertex_auth.lua)
-- Incluye este archivo en tu fxmanifest.lua:
--   server_scripts {
--       'vertex_auth.lua',
--       'server/main.lua'
--   }
-- ====================================================================

local API_ENDPOINT = "https://vertex-studio-api.onrender.com/api/licenses/verify"

CreateThread(function()
    Wait(200)
    local licenseKey = (Config and Config.LicenseKey) or ""
    
    if not licenseKey or licenseKey == "" then
        print("^1[Vertex Security] ✗ ERROR CRITICO: No se ha configurado Config.LicenseKey en config.lua^7")
        StopResource(GetCurrentResourceName())
        return
    end

    PerformHttpRequest(API_ENDPOINT, function(status, text, headers)
        if status == 200 then
            local data = json.decode(text)
            if data and data.valid then
                print("^2[Vertex Security] ✓ Licencia verificada y activa para: " .. (data.license.product or GetCurrentResourceName()) .. "^7")
                print("^2[Vertex Security] ✓ Autorizado para el servidor: " .. (data.license.boundIp or "Localhost") .. "^7")
            else
                local msg = (data and data.message) or "Licencia no valida para este servidor FiveM."
                print("^1[Vertex Security] ✗ ACCESO DENEGADO: " .. msg .. "^7")
                print("^1[Vertex Security] ✗ Vincula la IP de tu servidor en tu Vertex Keymaster.^7")
                StopResource(GetCurrentResourceName())
            end
        else
            print("^1[Vertex Security] ✗ Error de conexion con Vertex Cloud (HTTP " .. tostring(status) .. ")^7")
            StopResource(GetCurrentResourceName())
        end
    end, "POST", json.encode({ license_key = licenseKey }), { ["Content-Type"] = "application/json" })
end)
`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            Vertex Escrow Engine v2.0 · Activo
          </div>
          <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Vertex Escrow & Encriptador de Scripts
          </h1>
          <p className="text-sm text-muted-foreground">
            Protege tus scripts de FiveM contra filtraciones (leaks) y redistribución no autorizada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("encryptor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "encryptor" ? "bg-white text-black font-semibold" : "text-muted-foreground hover:text-white bg-white/5"
            }`}
          >
            Encriptador Lua
          </button>
          <button
            onClick={() => setActiveTab("module")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "module" ? "bg-white text-black font-semibold" : "text-muted-foreground hover:text-white bg-white/5"
            }`}
          >
            Módulo Universal
          </button>
        </div>
      </div>

      {activeTab === "encryptor" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input side */}
          <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-sky-400" />
                1. Código Lua Original (server.lua)
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground">Pega tu código sin encriptar</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-mono">Nombre del Script</label>
                <Input
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Ej: Vertex Mechanics"
                  className="bg-black/50 border-white/10 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-mono">Clave de Prueba / Asignada</label>
                <Input
                  value={testLicenseKey}
                  onChange={(e) => setTestLicenseKey(e.target.value)}
                  placeholder="VERTEX-XXXX-XXXX-XXXX"
                  className="bg-black/50 border-white/10 text-xs font-mono mt-1"
                />
              </div>
            </div>

            <Textarea
              rows={16}
              value={rawLua}
              onChange={(e) => setRawLua(e.target.value)}
              className="bg-[#0b0b10] border-white/10 font-mono text-xs text-white/90 resize-none"
              placeholder="Pega aquí el código que quieres proteger..."
            />

            <Button
              onClick={handleEncrypt}
              disabled={encrypting}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold text-xs h-10 shadow-lg"
            >
              <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" />
              {encrypting ? "Encriptando con Vertex Escrow..." : "Encriptar Código con Vertex Escrow"}
            </Button>
          </div>

          {/* Output side */}
          <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  2. Resultado Encriptado (Protegido)
                </h2>
                {encryptedCode && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCode(encryptedCode)}
                      className="border-white/15 hover:bg-white/10 h-7 text-xs px-2.5"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      Copiar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadFile("server_protected.lua", encryptedCode)}
                      className="bg-white text-black hover:bg-white/90 h-7 text-xs px-2.5 font-semibold"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Descargar .lua
                    </Button>
                  </div>
                )}
              </div>

              {encryptedCode ? (
                <Textarea
                  readOnly
                  rows={19}
                  value={encryptedCode}
                  className="bg-[#08080c] border-emerald-500/20 font-mono text-[11px] text-emerald-400/90 resize-none select-all"
                />
              ) : (
                <div className="h-[380px] rounded-xl border border-dashed border-white/10 bg-[#08080c] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Lock className="h-10 w-10 text-white/20 mb-3" />
                  <p className="font-display font-bold text-white text-sm">Aún no has encriptado ningún código</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Haz clic en "Encriptar Código" para generar el payload protegido con el runtime anti-tamper.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-sky-400 shrink-0" />
              <span>
                El código generado verifica la IP del servidor de FiveM y se apaga automáticamente si la licencia no es válida.
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Módulo Universal */
        <div className="max-w-3xl space-y-6">
          <div className="rounded-2xl border border-white/10 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-base text-white">Módulo Universal de Autenticación</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Protege cualquier script existente añadiendo este único archivo sin modificar el resto de tu código.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCode(universalAuthSnippet)}
                  className="border-white/15 hover:bg-white/10 h-8 text-xs px-3"
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copiar
                </Button>
                <Button
                  size="sm"
                  onClick={() => downloadFile("vertex_auth.lua", universalAuthSnippet)}
                  className="bg-white text-black hover:bg-white/90 h-8 text-xs px-3 font-semibold"
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Descargar
                </Button>
              </div>
            </div>

            <Textarea
              readOnly
              rows={18}
              value={universalAuthSnippet}
              className="bg-[#08080c] border-white/10 font-mono text-xs text-white/90 resize-none select-all"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-6 space-y-3">
            <h3 className="font-display font-bold text-sm text-white">Instrucciones de Uso Rápido:</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
              <li>Descarga el archivo <code>vertex_auth.lua</code> y colócalo en la carpeta de tu script.</li>
              <li>Abre <code>fxmanifest.lua</code> y añade <code>'vertex_auth.lua'</code> al inicio de <code>server_scripts</code>.</li>
              <li>En <code>config.lua</code> añade la línea <code>Config.LicenseKey = "TU_CLAVE"</code>.</li>
              <li>¡Listo! El script verificará la licencia en la nube de Vertex Studio en cada inicio del servidor.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
