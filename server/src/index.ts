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
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === env.CLIENT_URL ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

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
    res.json({
      database: 'connected',
      test: rows[0]?.result,
      tables: tables.map((t: any) => Object.values(t)[0]),
      has_discord_id: Boolean(env.DISCORD_CLIENT_ID),
      has_discord_secret: Boolean(env.DISCORD_CLIENT_SECRET),
      discord_redirect: env.DISCORD_REDIRECT_URI,
      client_url: env.CLIENT_URL,
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
      const schemaPath = path.resolve(__dirname, 'db/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(sql);
        console.log('--- Database schema created successfully ---');
      }
    }

    // Ensure Super Admin exists
    const [adminRows]: any = await pool.query("SELECT id FROM users WHERE email = 'sebasruades8@gmail.com'");
    if (!adminRows || adminRows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('Admin2026!', 10);
      await pool.query(
        "INSERT INTO users (id, email, username, password, role, is_verified) VALUES (?, ?, ?, ?, 'admin', 1)",
        ['admin-super-id', 'sebasruades8@gmail.com', 'Sebrudo09', hash]
      );
      console.log('--- Super Admin initialized: sebasruades8@gmail.com ---');
    }

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
