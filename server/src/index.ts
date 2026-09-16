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
