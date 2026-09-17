import AdmZip from 'adm-zip';
import crypto from 'crypto';

export interface EscrowMetadata {
  licenseKey: string;
  productTitle: string;
  productSlug: string;
  version: string;
  ownerUsername: string;
  ownerEmail: string;
  apiUrl?: string;
  boundIp?: string;
}

/**
 * Encrypts raw Lua code into an obfuscated, self-decrypting runtime
 * embedded with the buyer's unique license signature and FiveM license check.
 */
export function encryptLuaCode(rawLua: string, meta: EscrowMetadata): string {
  const apiUrl = meta.apiUrl || 'https://vertex-studio-api.onrender.com';
  const timestamp = new Date().toISOString();
  const salt = crypto.randomBytes(8).toString('hex');

  // XOR byte stream encryption compatible with Lua 5.4 / LuaJIT
  const keyBytes = crypto.randomBytes(16);
  const rawBuffer = Buffer.from(rawLua, 'utf8');
  const encryptedBytes: number[] = [];

  for (let i = 0; i < rawBuffer.length; i++) {
    encryptedBytes.push(rawBuffer[i] ^ keyBytes[i % keyBytes.length]);
  }

  const hexPayload = Buffer.from(encryptedBytes).toString('hex');
  const keyArrayStr = Array.from(keyBytes).join(',');

  return `-- ====================================================================
-- VERTEX ASSET ESCROW SYSTEM v2.0 (C) VERTEX STUDIO
-- Protected & Licensed FiveM Resource
--
-- Product:     ${meta.productTitle} (v${meta.version})
-- Licensed To: ${meta.ownerUsername} (${meta.ownerEmail})
-- License Key: ${meta.licenseKey}
-- Build Date:  ${timestamp}
-- Signature:   VTX-${salt.toUpperCase()}
--
-- NOTICE: Unauthorized reproduction, reverse engineering, leak or 
-- redistribution of this file is strictly prohibited and protected by DRM.
-- ====================================================================

local _0xVTX_KEY = "${meta.licenseKey}"
local _0xVTX_API = "${apiUrl}"
local _0xVTX_PRODUCT = "${meta.productTitle}"
local _0xVTX_OWNER = "${meta.ownerUsername}"

local function _0xVTX_VERIFY()
    local p = promise.new()
    local endpoint = _0xVTX_API .. "/api/licenses/verify"
    local _sName = GetConvar("sv_hostname", "Servidor FiveM")
    local _sPort = GetConvar("netPort", "30120")
    local _maxP = GetConvarInt("sv_maxclients", 32)
    local _gBuild = GetConvar("version", "FiveM")
    
    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            local data = json.decode(responseText)
            if data and data.valid then
                print("^2[Vertex Keymaster] ✓ Licencia verificada: " .. _0xVTX_PRODUCT .. " (" .. _0xVTX_KEY .. ")^7")
                print("^2[Vertex Keymaster] ✓ Servidor registrado en tu Vertex Keymaster: " .. _sName .. "^7")
                p:resolve(true)
            else
                local reason = (data and data.message) or "Licencia no autorizada para este servidor."
                print("^1[Vertex Keymaster] ✗ ERROR DE AUTORIZACIÓN: " .. reason .. "^7")
                print("^1[Vertex Keymaster] ✗ Por favor vincula la IP de tu servidor en tu Vertex Keymaster.^7")
                p:resolve(false)
            end
        else
            print("^1[Vertex Keymaster] ✗ Error de conexión con Vertex License Cloud (HTTP " .. tostring(statusCode) .. ")^7")
            p:resolve(false)
        end
    end, "POST", json.encode({
        license_key = _0xVTX_KEY,
        product = _0xVTX_PRODUCT,
        owner = _0xVTX_OWNER,
        server_name = _sName,
        server_port = _sPort,
        max_players = _maxP,
        game_build = _gBuild
    }), { ["Content-Type"] = "application/json" })

    return Citizen.Await(p)
end

CreateThread(function()
    Wait(500)
    local isAuthorized = _0xVTX_VERIFY()
    
    if not isAuthorized then
        print("^1[Vertex Keymaster] [SEGURIDAD] Deteniendo recurso " .. GetCurrentResourceName() .. " por protección de copyright.^7")
        StopResource(GetCurrentResourceName())
        return
    end

    -- Runtime Decryption
    local _k = { ${keyArrayStr} }
    local _hex = "${hexPayload}"
    local _decBytes = {}

    local kLen = #_k
    local bIdx = 1

    for i = 1, #_hex, 2 do
        local byteVal = tonumber(_hex:sub(i, i + 1), 16)
        local kByte = _k[((bIdx - 1) % kLen) + 1]
        
        -- Bitwise XOR compatible with Lua 5.4 (~) and LuaJIT (bit32 / bit.bxor)
        local decryptedByte
        if _VERSION == "Lua 5.4" then
            decryptedByte = byteVal ~ kByte
        else
            local bxor = (bit and bit.bxor) or (bit32 and bit32.bxor)
            decryptedByte = bxor and bxor(byteVal, kByte) or byteVal
        end

        table.insert(_decBytes, string.char(decryptedByte))
        bIdx = bIdx + 1
    end

    local _plainCode = table.concat(_decBytes)
    local chunk, loadErr = load(_plainCode, "@" .. GetCurrentResourceName() .. "/server/main.lua")

    if chunk then
        local success, runErr = pcall(chunk)
        if not success then
            print("^1[Vertex Keymaster] Error al ejecutar logica protegida: " .. tostring(runErr) .. "^7")
        end
    else
        print("^1[Vertex Keymaster] Error al compilar chunk protegido: " .. tostring(loadErr) .. "^7")
    end
end)
`;
}

/**
 * Identifies if a script file should remain completely editable and unencrypted
 * for the customer (e.g. config.lua, settings, locales, manifest).
 */
export function isEditableScriptFile(entryPath: string): boolean {
  const lower = entryPath.toLowerCase().replace(/\\/g, '/');
  const filename = lower.split('/').pop() || '';

  // Config files - NEVER encrypt!
  if (
    filename === 'config.lua' ||
    filename === 'settings.lua' ||
    filename.startsWith('config.') ||
    filename.startsWith('settings.') ||
    filename.startsWith('cfg.') ||
    filename === 'shared.lua'
  ) {
    return true;
  }

  // Manifest, metadata and docs
  if (
    filename === 'fxmanifest.lua' ||
    filename === '__resource.lua' ||
    filename === 'readme.md' ||
    filename === 'license' ||
    filename === 'license.md' ||
    filename === 'changelog.md' ||
    filename.endsWith('.json')
  ) {
    return true;
  }

  // Translations and language locales
  if (
    lower.includes('/locales/') ||
    lower.includes('/locale/') ||
    lower.includes('/lang/') ||
    lower.includes('/languages/') ||
    lower.includes('/translation/') ||
    lower.includes('/translations/')
  ) {
    return true;
  }

  return false;
}

/**
 * Obfuscates and protects NUI JavaScript files (e.g. app.js, script.js).
 * Strips comments, base64 encodes the UTF-8 payload, and wraps it in an anti-tamper runtime.
 */
export function encryptJavaScript(rawJs: string, meta?: EscrowMetadata): string {
  const title = meta?.productTitle || 'Vertex FiveM Resource';
  const key = meta?.licenseKey || 'VTX-ESCROW-PROTECTED';
  const buildDate = new Date().toISOString();

  const cleaned = rawJs
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(?<!:)\/\/.*$/gm, '')
    .trim();

  const b64Payload = Buffer.from(cleaned, 'utf8').toString('base64');

  return `/* ====================================================================
 * VERTEX ASSET ESCROW v2.0 - NUI JAVASCRIPT PROTECTION
 * Product:     ${title}
 * License Key: ${key}
 * Protection:  Anti-Tamper & Obfuscated Web Core
 * Timestamp:   ${buildDate}
 * NOTICE: Unauthorized modification, leak or reverse engineering prohibited.
 * ==================================================================== */
(function(){
  try {
    var _0xvxRaw = "${b64Payload}";
    var _0xvxBinary = window.atob ? window.atob(_0xvxRaw) : Buffer.from(_0xvxRaw, "base64").toString("binary");
    var _0xvxBytes = new Uint8Array(_0xvxBinary.length);
    for (var i = 0; i < _0xvxBinary.length; i++) {
      _0xvxBytes[i] = _0xvxBinary.charCodeAt(i);
    }
    var _0xvxDecoded = (typeof TextDecoder !== "undefined")
      ? new TextDecoder("utf-8").decode(_0xvxBytes)
      : decodeURIComponent(escape(_0xvxBinary));
    var _0xvxFn = new Function(_0xvxDecoded);
    _0xvxFn();
  } catch (_0xerr) {
    console.error("[Vertex Escrow NUI] Failed to execute protected logic:", _0xerr);
  }
})();
`;
}

/**
 * Minifies and packages NUI CSS files (e.g. style.css) with Vertex Escrow DRM watermark.
 */
export function encryptCss(rawCss: string, meta?: EscrowMetadata): string {
  const title = meta?.productTitle || 'Vertex FiveM Resource';
  const key = meta?.licenseKey || 'VTX-ESCROW-PROTECTED';
  const buildDate = new Date().toISOString();

  const minified = rawCss
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

  return `/* ====================================================================
 * VERTEX ASSET ESCROW v2.0 - PROTECTED NUI STYLESHEET
 * Product:     ${title}
 * License Key: ${key}
 * Protection:  Vertex Escrow Minified & Watermarked
 * Timestamp:   ${buildDate}
 * ==================================================================== */
${minified}
`;
}

export interface EscrowProtectionReport {
  encryptedLua: string[];
  encryptedJs: string[];
  encryptedCss: string[];
  editableFiles: string[];
  totalFiles: number;
}

/**
 * Inspects any uploaded or existing FiveM resource zip and protects:
 * - server/*.lua with Vertex Escrow XOR cipher & DRM handshake
 * - app.js & other NUI JS files with anti-tamper JS obfuscator
 * - style.css & other CSS files with minified DRM packaging
 * - KEEPS config.lua, settings.lua, locales/*.lua, fxmanifest.lua 100% open and editable!
 */
export function processAndProtectZip(
  zipBuffer: Buffer,
  meta: EscrowMetadata
): { buffer: Buffer; report: EscrowProtectionReport } {
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  const report: EscrowProtectionReport = {
    encryptedLua: [],
    encryptedJs: [],
    encryptedCss: [],
    editableFiles: [],
    totalFiles: entries.length
  };

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = entry.entryName.replace(/\\/g, '/');
    const lower = name.toLowerCase();

    // Skip vendor / third party folders
    if (
      lower.includes('/node_modules/') ||
      lower.includes('/vendor/') ||
      lower.includes('/.git/')
    ) {
      continue;
    }

    // 1. Check if editable / open file
    if (isEditableScriptFile(name)) {
      report.editableFiles.push(name);

      // If it's config.lua, ensure customer's license key is injected
      if (lower.endsWith('config.lua')) {
        let content = entry.getData().toString('utf8');
        if (content.includes('Config.LicenseKey')) {
          content = content.replace(
            /Config\.LicenseKey\s*=\s*['"][^'"]*['"]/,
            `Config.LicenseKey = "${meta.licenseKey}"`
          );
        } else {
          content = `-- Inyectado por Vertex Keymaster DRM\nConfig = Config or {}\nConfig.LicenseKey = "${meta.licenseKey}"\n\n` + content;
        }
        zip.updateFile(entry.entryName, Buffer.from(content, 'utf8'));
      }
      continue;
    }

    // 2. Server-side Lua scripts
    if (
      lower.endsWith('.lua') &&
      (lower.includes('server') || lower.includes('/sv_') || lower.includes('sv_') || lower.endsWith('server.lua'))
    ) {
      const rawLua = entry.getData().toString('utf8');
      if (!rawLua.includes('VERTEX ASSET ESCROW SYSTEM')) {
        const encrypted = encryptLuaCode(rawLua, meta);
        zip.updateFile(entry.entryName, Buffer.from(encrypted, 'utf8'));
        report.encryptedLua.push(name);
      } else {
        report.encryptedLua.push(name);
      }
      continue;
    }

    // 3. Web / NUI JavaScript (app.js, script.js, main.js, etc.)
    if (lower.endsWith('.js')) {
      const rawJs = entry.getData().toString('utf8');
      if (!rawJs.includes('VERTEX ASSET ESCROW')) {
        const encrypted = encryptJavaScript(rawJs, meta);
        zip.updateFile(entry.entryName, Buffer.from(encrypted, 'utf8'));
        report.encryptedJs.push(name);
      } else {
        report.encryptedJs.push(name);
      }
      continue;
    }

    // 4. Web / NUI CSS (style.css, main.css, etc.)
    if (lower.endsWith('.css')) {
      const rawCss = entry.getData().toString('utf8');
      if (!rawCss.includes('VERTEX ASSET ESCROW')) {
        const encrypted = encryptCss(rawCss, meta);
        zip.updateFile(entry.entryName, Buffer.from(encrypted, 'utf8'));
        report.encryptedCss.push(name);
      } else {
        report.encryptedCss.push(name);
      }
      continue;
    }
  }

  return { buffer: zip.toBuffer(), report };
}

/**
 * Generates a complete ready-to-run FiveM resource .zip package
 * with embedded license key, encrypted server runtime, and protected NUI files.
 */
export function generateEncryptedZip(product: any, license: any, user: any, apiUrl: string): Buffer {
  const zip = new AdmZip();
  const folderName = product.slug || 'vertex-resource';

  const meta: EscrowMetadata = {
    licenseKey: license.license_key,
    productTitle: product.title || product.name || 'Vertex Script',
    productSlug: product.slug || 'vertex-script',
    version: product.version || '1.0.0',
    ownerUsername: user.username || 'Customer',
    ownerEmail: user.email || 'customer@vertexstudio.com',
    apiUrl: apiUrl,
    boundIp: license.bound_server_ip || undefined
  };

  // 1. fxmanifest.lua
  const fxmanifestContent = `fx_version 'cerulean'
game 'gta5'

name '${product.title || 'Vertex Script'}'
author 'Vertex Studio'
version '${product.version || '1.0.0'}'
description '${product.short_description || 'Protected FiveM Resource by Vertex Studio'}'

lua54 'yes'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/app.js'
}
`;
  zip.addFile(`${folderName}/fxmanifest.lua`, Buffer.from(fxmanifestContent, 'utf8'));

  // 2. config.lua (100% UNENCRYPTED, EDITABLE FOR BUYER)
  const configContent = `-- ====================================================================
-- ${product.title || 'Vertex Resource'} - Configuration File
-- Licensed to: ${user.username} (${meta.licenseKey})
-- NOTE: Edit this file freely to customize settings, locales and names!
-- ====================================================================

Config = {}

-- Clave de Licencia oficial emitida por Vertex Keymaster
Config.LicenseKey = "${meta.licenseKey}"

-- Configuración general
Config.Debug = false
Config.NotificationType = "ox_lib" -- "ox_lib", "qb", "esx", "chat"

-- Personalización de nombres y textos del script
Config.ScriptName = "${product.title || 'Vertex Resource'}"
Config.CurrencySymbol = "€"
Config.HelpCommand = "ayuda"

-- Idioma del script: "es" o "en"
Config.Locale = "es"
`;
  zip.addFile(`${folderName}/config.lua`, Buffer.from(configContent, 'utf8'));

  // 3. Raw server code to be encrypted with Vertex Escrow
  const rawServerCode = `-- [Internal Server Logic for ${product.title}]
print('^2[${product.title}] Inicializando modulo del servidor (v${product.version || '1.0.0'})...^7')

RegisterNetEvent('${folderName}:server:requestData', function()
    local src = source
    TriggerClientEvent('${folderName}:client:receiveData', src, {
        status = 'active',
        product = '${product.title}',
        version = '${product.version || '1.0.0'}'
    })
end)

AddEventHandler('onResourceStart', function(resName)
    if GetCurrentResourceName() ~= resName then return end
    print('^2[${product.title}] Recurso iniciado correctamente en el servidor FiveM.^7')
end)
`;
  const encryptedServerCode = encryptLuaCode(rawServerCode, meta);
  zip.addFile(`${folderName}/server/main.lua`, Buffer.from(encryptedServerCode, 'utf8'));

  // 4. client/main.lua
  const clientContent = `-- ====================================================================
-- ${product.title || 'Vertex Resource'} - Client Script
-- ====================================================================

CreateThread(function()
    TriggerServerEvent('${folderName}:server:requestData')
end)

RegisterNetEvent('${folderName}:client:receiveData', function(data)
    if Config.Debug then
        print('[Vertex Studio] Cliente conectado a ' .. tostring(data.product))
    end
end)
`;
  zip.addFile(`${folderName}/client/main.lua`, Buffer.from(clientContent, 'utf8'));

  // 5. html/index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${product.title || 'Vertex UI'}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app" class="vertex-nui-container">
    <div class="vertex-header">
      <h1>${product.title || 'Vertex Resource'}</h1>
      <span class="badge">Vertex Escrow Protected</span>
    </div>
    <div class="vertex-body">
      <p>Interfaz NUI protegida por Vertex Escrow Engine.</p>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`;
  zip.addFile(`${folderName}/html/index.html`, Buffer.from(htmlContent, 'utf8'));

  // 6. html/app.js (ENCRYPTED & OBFUSCATED NUI SCRIPT)
  const rawJsContent = `console.log("[Vertex NUI] Interfaz cargada para ${product.title}");
window.addEventListener("message", function(event) {
  var data = event.data;
  if (data && data.action === "open") {
    var el = document.getElementById("app");
    if (el) el.style.display = "block";
  }
});`;
  const protectedJs = encryptJavaScript(rawJsContent, meta);
  zip.addFile(`${folderName}/html/app.js`, Buffer.from(protectedJs, 'utf8'));

  // 7. html/style.css (MINIFIED & PROTECTED STYLESHEET)
  const rawCssContent = `.vertex-nui-container {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    background: #0f1015;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    color: #ffffff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
  .vertex-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 16px;
  }
  .badge {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
  }`;
  const protectedCss = encryptCss(rawCssContent, meta);
  zip.addFile(`${folderName}/html/style.css`, Buffer.from(protectedCss, 'utf8'));

  // 8. README.md
  const readmeContent = `# ${product.title} (v${product.version || '1.0.0'})
**Protegido por Vertex Keymaster & Escrow Engine**

---

### 📦 Información de tu Licencia
- **Propietario:** ${user.username} (${user.email})
- **Clave de Licencia:** \`${meta.licenseKey}\`
- **Estado:** Activo y Autorizado
- **Panel de Gestión:** [Vertex Keymaster](${apiUrl.replace('/api', '')}/keymaster)

---

### 🚀 Instalación en tu Servidor FiveM
1. Descomprime esta carpeta y colócala en tu directorio de recursos:
   \`resources/[scripts]/${folderName}\`
2. Abre \`config.lua\` y edita libremente los nombres, comandos y ajustes:
   \`Config.LicenseKey = "${meta.licenseKey}"\`
3. **Vinculación de Servidor:**
   - Si corres en tu PC (localhost), funciona de inmediato sin configurar IP.
   - Si corres en un VPS/Host dedicado, ve a tu **Vertex Keymaster** y escribe la IP de tu servidor FiveM.
4. Agrega a tu \`server.cfg\`:
   \`ensure ${folderName}\`
5. Inicia o reinicia tu servidor FiveM. ¡Listo para jugar!

---
*(C) 2026 Vertex Studio. Todos los derechos reservados.*
`;
  zip.addFile(`${folderName}/README.md`, Buffer.from(readmeContent, 'utf8'));

  return zip.toBuffer();
}

/**
 * Obfuscate standalone Lua code provided by the admin.
 */
export function obfuscateStandaloneLua(rawLua: string, key?: string): string {
  const dummyMeta: EscrowMetadata = {
    licenseKey: key || 'VTX-DEMO-TEST-KEY1',
    productTitle: 'Custom Script',
    productSlug: 'custom-script',
    version: '1.0.0',
    ownerUsername: 'VertexAdmin',
    ownerEmail: 'admin@vertexstudio.com'
  };
  return encryptLuaCode(rawLua, dummyMeta);
}

