# 🚀 VERTEX STUDIO — FiveM Development Platform

Plataforma web profesional, moderna y premium para **Vertex Studio**, desarrollada con arquitectura tecnológica de alto rendimiento para el ecosistema de servidores **FiveM**.

---

## 💎 Identidad Visual y Tecnologías

- **Branding:** VERTEX STUDIO con logotipo oficial 3D cromo / titanio y anillo orbital neón.
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js, Express, TypeScript, JWT, bcryptjs, Helmet, Multer.
- **Base de Datos:** MySQL (XAMPP `localhost:3306`) con 15 tablas relacionales y claves foráneas.
- **Pasarelas de Pago:** Stripe (Tarjetas) y PayPal (Sandbox & Live) con modo de prueba instantáneo integrado.
- **Sistema de Licencias:** Claves únicas criptográficas con formato `VERTEX-XXXX-XXXX-XXXX`, vinculación de IP de servidor y endpoint de verificación para scripts Lua de FiveM (`POST /api/licenses/verify`).
- **Descargas Protegidas:** Acceso únicamente a compradores autenticados con registro de auditoría e IP.

---

## 📂 Estructura del Proyecto

```
Web/
├── client/                     # Frontend React + TypeScript (Vite + Tailwind)
│   ├── public/
│   │   └── logo.png            # Logotipo oficial de Vertex Studio
│   └── src/
│       ├── components/         # Navbar, Footer, TechBackground, ProductCard, CartDrawer, etc.
│       ├── context/            # AuthContext, CartContext, AccentContext, ToastContext
│       ├── pages/              # Home, Store, ProductDetail, Checkout, Success, Docs, Changelog, Support
│       │   ├── dashboard/      # Overview, My Products, Downloads, Licenses, Orders, Support, Settings
│       │   └── admin/          # Analytics, Products, Users, Orders, Licenses, Tickets, Reviews, Settings
│       └── services/           # Cliente Axios configurado para la API REST
│
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Conexión MySQL pool y variables de entorno
│   │   ├── controllers/        # Controladores (Auth, Products, Orders, Licenses, etc.)
│   │   ├── middleware/         # Autenticación JWT, verificación Admin, uploads Multer
│   │   ├── routes/             # Endpoints API REST (/api/...)
│   │   ├── services/           # Generador de licencias, pasarelas de pago, Discord OAuth
│   │   └── db/                 # schema.sql, migrate.ts, seed.ts
│   └── storage/
│       └── scripts/            # Archivos .zip reales protegidos (vertex_loadingscreen.zip, etc.)
│
├── package.json                # Orquestador monorepo (npm run dev, build, seed, start)
└── README.md
```

---

## ⚡ Cuentas de Acceso Preconfiguradas (Semilla MySQL)

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@vertexstudio.com` | `AdminVertex2026!` |
| **Cliente Demo** | `customer@vertexstudio.com` | `CustomerVertex2026!` |

---

## 🛠️ Comandos de Ejecución

Desde la carpeta raíz `C:\Users\Shadow\Desktop\Vertex Studio\Web`:

### 1. Iniciar en Modo Desarrollo (Frontend + Backend concurrentes)
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 2. Ejecutar Migraciones o Semillado de Base de Datos
```bash
npm run migrate
npm run seed
```

### 3. Compilar para Producción
```bash
npm run build
```

### 4. Iniciar Servidor de Producción (Express sirviendo API y Frontend integrado)
```bash
npm start
```
- Web accesible directamente en: `http://localhost:5000`

---

## 🔒 Endpoint de Verificación para Scripts FiveM (server.cfg / Lua)

Para que tus scripts de FiveM verifiquen licencias con tu web:
- **URL:** `POST http://localhost:5000/api/licenses/verify`
- **Body JSON:**
```json
{
  "license_key": "VERTEX-A8F2-99C1-7E4B",
  "server_ip": "127.0.0.1:30120"
}
```
- **Respuesta:**
```json
{
  "valid": true,
  "license": {
    "key": "VERTEX-A8F2-99C1-7E4B",
    "status": "active",
    "product": "Vertex Loading Screen",
    "slug": "vertex-loading-screen",
    "boundIp": "127.0.0.1:30120",
    "owner": "AlexRoleplay"
  }
}
```

© 2026 Vertex Studio. Todos los derechos reservados.