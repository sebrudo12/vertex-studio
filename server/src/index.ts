import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { testConnection, pool } from './config/db';
import { errorHandler } from './middleware/errorHandler';

// Import Routes
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import ordersRoutes from './routes/orders.routes';
import licensesRoutes from './routes/licenses.routes';
import downloadsRoutes from './routes/downloads.routes';
import ticketsRoutes from './routes/tickets.routes';
import reviewsRoutes from './routes/reviews.routes';
import announcementsRoutes from './routes/announcements.routes';
import changelogsRoutes from './routes/changelogs.routes';
import settingsRoutes from './routes/settings.routes';
import adminRoutes from './routes/admin.routes';
import meRoutes from './routes/me.routes';
import checkoutRoutes from './routes/checkout.routes';
import docsRoutes from './routes/docs.routes';
import couponsRoutes from './routes/coupons.routes';

const app = express();

// Security and Logging
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public uploads
app.use('/uploads', express.static(env.UPLOADS_STORAGE_PATH));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/licenses', licensesRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/changelogs', changelogsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/coupons', couponsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'VERTEX STUDIO',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const [rows]: any = await pool.query('SELECT 1 + 1 as result');
    const [tables]: any = await pool.query('SHOW TABLES');
    const [users]: any = await pool.query('SELECT id, username, email, role, status FROM users');
    res.json({
      database: 'connected',
      test: rows[0]?.result,
      tables: tables.map((t: any) => Object.values(t)[0]),
      users,
    });
  } catch (err: any) {
    res.status(500).json({
      database: 'error',
      message: err.message,
      code: err.code,
    });
  }
});

import fs from 'fs';

// Serve client static build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

async function ensureDatabaseSchema() {
  try {
    const [rows]: any = await pool.query("SHOW TABLES LIKE 'users'");
    if (!rows || rows.length === 0) {
      console.log('--- Database empty, running initial schema migration ---');
      const candidates = [
        path.resolve(__dirname, 'db/schema.sql'),
        path.resolve(__dirname, '../src/db/schema.sql'),
        path.resolve(__dirname, '../../src/db/schema.sql'),
        path.resolve(process.cwd(), 'src/db/schema.sql'),
        path.resolve(process.cwd(), 'server/src/db/schema.sql'),
        path.resolve(process.cwd(), 'dist/db/schema.sql'),
      ];
      const schemaPath = candidates.find((p) => fs.existsSync(p));
      if (schemaPath) {
        console.log(`Loading schema from: ${schemaPath}`);
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(sql);
        console.log('--- Database schema created successfully from file ---');
      } else {
        console.error('schema.sql file not found in candidates:', candidates);
      }
    }

    // Ensure Super Admin exists
    const [adminRows]: any = await pool.query("SELECT id FROM users WHERE email = 'sebasruades8@gmail.com'");
    if (!adminRows || adminRows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('Admin2026!', 10);
      await pool.query(
        "INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'active')",
        ['Sebrudo09', 'sebasruades8@gmail.com', hash]
      );
      console.log('--- Super Admin initialized: sebasruades8@gmail.com ---');
    }

    // Enforce correct roles: only sebasruades8 is super admin, kingsitonassir is customer
    await pool.query("UPDATE users SET role = 'customer' WHERE email = 'kingsitonassir@gmail.com'");
    await pool.query("UPDATE users SET role = 'admin' WHERE email = 'sebasruades8@gmail.com'");

    // Ensure coupons table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_percent INT UNSIGNED NOT NULL DEFAULT 10,
        max_uses INT UNSIGNED NOT NULL DEFAULT 100,
        uses_count INT UNSIGNED NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure coupon exists
    const [couponRows]: any = await pool.query("SELECT id FROM coupons WHERE code = 'VERTEX20'");
    if (!couponRows || couponRows.length === 0) {
      await pool.query(
        "INSERT INTO coupons (code, discount_percent, max_uses, uses_count, is_active) VALUES ('VERTEX20', 20, 100, 0, 1)"
      );
    }

    // Ensure default featured products exist if database has 0 products
    const [prodRows]: any = await pool.query("SELECT COUNT(*) as count FROM products");
    if (prodRows && Number(prodRows[0]?.count) === 0) {
      console.log('--- Database has 0 products, seeding default Vertex Studio products ---');
      const defaultProducts = [
        {
          slug: 'vertex-mechanics',
          title: 'Vertex Mechanics',
          short_description: 'Advanced mechanic management system with tuning tablet, diagnostic scanners, and realistic repair minigames.',
          description: '### Complete Mechanic Roleplay System\nVertex Mechanics transforms the vehicle tuning and repair experience on FiveM. Mechanics receive a realistic in-game tablet to diagnose engine health, suspension degradation, gearbox wear, and apply cosmetic tunings with an interactive spray booth and dynamic color wheel.',
          price: 29.99,
          category: 'Scripts',
          frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox']),
          version: '2.1.0',
          status: 'active',
          featured: 1,
          thumbnail: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1200&auto=format&fit=crop&q=80'
          ]),
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          dependencies: JSON.stringify(['ox_lib', 'oxmysql']),
          features: JSON.stringify([
            'Modern NUI Tablet',
            'Vehicle Diagnostic Scanner',
            'Custom Spray Booth with Color Picker',
            'Realistic Repair Minigames',
            'QBCore & ESX Full Support',
            'Discord Webhook Logs'
          ]),
          download_filename: 'vertex_mechanics.zip'
        },
        {
          slug: 'vertex-hud',
          title: 'Vertex HUD Premium',
          short_description: 'Ultra-clean, modular, high-FPS game HUD with compass, cinematic mode, and custom stress/armor/voice meters.',
          description: '### The Next Generation HUD for FiveM\nVertex HUD brings AAA game quality UI to your roleplay server. Lightweight, beautiful, and completely customizable by each player via an intuitive in-game settings menu.',
          price: 19.99,
          category: 'UI',
          frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox', 'Standalone']),
          version: '1.4.0',
          status: 'active',
          featured: 1,
          thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80'
          ]),
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          dependencies: JSON.stringify(['None']),
          features: JSON.stringify([
            '0.01ms Optimized Resmon',
            'Modular Drag & Drop Layout',
            'Vehicle Gauges & Nitro Effect',
            'Cinematic Cam Mode',
            'Voice Range Indicator',
            'Customizable Colors'
          ]),
          download_filename: 'vertex_hud.zip'
        },
        {
          slug: 'vertex-banking',
          title: 'Vertex Banking & Crypto',
          short_description: 'Next-generation financial system with debit cards, loan management, crypto exchange, and transaction histories.',
          description: '### Modern Banking & Crypto Ecosystem\nProvide your players with a financial experience inspired by modern fintech apps. Create savings accounts, apply for vehicle and business loans with interest rates, invest in fluctuating cryptocurrency markets, and wire money with transaction receipts.',
          price: 24.99,
          category: 'Scripts',
          frameworks: JSON.stringify(['QBCore', 'ESX', 'Qbox']),
          version: '1.2.0',
          status: 'active',
          featured: 1,
          thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&auto=format&fit=crop&q=80'
          ]),
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          dependencies: JSON.stringify(['oxmysql']),
          features: JSON.stringify([
            'Interactive ATM & Bank UI',
            'Dynamic Crypto Trading Market',
            'Multi-Account & Shared Business Wallets',
            'Debit Card PIN & Fraud Protection',
            'PDF-Style Invoices and Transaction History'
          ]),
          download_filename: 'vertex_banking.zip'
        },
        {
          slug: 'vertex-loading-screen',
          title: 'Vertex Loading Screen',
          short_description: 'Modern, audio-visual animated loading screen with audio visualizer, rules carousel, and server stats.',
          description: '### High-Performance Loading Screen for FiveM\nVertex Loading Screen is built from the ground up for modern FiveM servers looking for a truly breathtaking first impression.',
          price: 9.99,
          category: 'UI',
          frameworks: JSON.stringify(['Standalone', 'QBCore', 'ESX', 'Qbox']),
          version: '1.0.0',
          status: 'active',
          featured: 1,
          thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
          gallery: JSON.stringify([
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80'
          ]),
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          dependencies: JSON.stringify(['None (Standalone)']),
          features: JSON.stringify([
            'Modern NUI Clean Design',
            'Interactive Audio Visualizer',
            'Server Rules & Staff Carousel',
            '0.00ms Resmon Performance'
          ]),
          download_filename: 'vertex_loadingscreen.zip'
        }
      ];

      for (const p of defaultProducts) {
        const [insertRes]: any = await pool.query(
          `INSERT INTO products 
          (slug, title, short_description, description, price, category, frameworks, version, status, featured, thumbnail, gallery, video_url, dependencies, features, download_filename) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.slug, p.title, p.short_description, p.description, p.price, p.category,
            p.frameworks, p.version, p.status, p.featured, p.thumbnail, p.gallery,
            p.video_url, p.dependencies, p.features, p.download_filename
          ]
        );
        const prodId = insertRes.insertId;
        await pool.query(
          `INSERT INTO product_versions (product_id, version, changelog, zip_path) VALUES (?, ?, ?, ?)`,
          [prodId, p.version, `Initial release of ${p.title}`, p.download_filename]
        );
      }
      console.log('--- Default products seeded successfully ---');
    }

    // Ensure sample reviews exist if empty
    const [revCount]: any = await pool.query("SELECT COUNT(*) as count FROM reviews");
    if (revCount && Number(revCount[0]?.count) === 0) {
      const [u]: any = await pool.query("SELECT id FROM users LIMIT 1");
      const [p]: any = await pool.query("SELECT id FROM products LIMIT 1");
      if (u.length > 0 && p.length > 0) {
        await pool.query(
          `INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES 
          (?, ?, 5, 'Exceptional quality and 0.00ms resmon. The best FiveM scripts we have ever used!', 'approved'),
          (?, ?, 5, 'Super clean UI and seamless framework integration. Customer support in Discord is top tier.', 'approved')`,
          [u[0].id, p[0].id, u[0].id, p[0].id]
        );
      }
    }
  } catch (err) {
    console.error('Database schema auto-check error:', err);
  }
}

async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('WARNING: Database connection failed. Please check your DB credentials.');
  } else {
    console.log('Successfully connected to MySQL database: ' + env.DB_NAME);
    await ensureDatabaseSchema();
  }

  app.listen(env.PORT, () => {
    console.log(`Vertex Studio API running at port ${env.PORT}`);
    console.log(`Allowed Client URL: ${env.CLIENT_URL}`);
  });
}

startServer();
