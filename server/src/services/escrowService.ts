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
 * Generates a complete ready-to-run FiveM resource .zip package
 * with embedded license key and encrypted server runtime.
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
`;
  zip.addFile(`${folderName}/fxmanifest.lua`, Buffer.from(fxmanifestContent, 'utf8'));

  // 2. config.lua
  const configContent = `-- ====================================================================
-- ${product.title || 'Vertex Resource'} - Configuration File
-- Licensed to: ${user.username} (${meta.licenseKey})
-- ====================================================================

Config = {}

-- Clave de Licencia oficial emitida por Vertex Keymaster
Config.LicenseKey = "${meta.licenseKey}"

-- Configuración general
Config.Debug = false
Config.NotificationType = "ox_lib" -- "ox_lib", "qb", "esx", "chat"

-- Opciones del recurso
Config.Locale = "es" -- Idioma del script: "es" o "en"
`;
  zip.addFile(`${folderName}/config.lua`, Buffer.from(configContent, 'utf8'));

  // 3. Raw server code to be encrypted
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

  // Encrypt the server code
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

  // 5. README.md
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
2. Abre \`config.lua\` y confirma que tu clave de licencia coincida con:
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
