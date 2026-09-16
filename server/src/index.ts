import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { testConnection } from './config/db';
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
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

async function startServer() {
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('WARNING: Database connection failed. Please ensure MySQL is running on port ' + env.DB_PORT);
  } else {
    console.log('Successfully connected to MySQL database: ' + env.DB_NAME);
  }

  app.listen(env.PORT, () => {
    console.log(`ðŸš€ Vertex Studio API running at http://localhost:${env.PORT}`);
    console.log(`ðŸ“¡ Client allowed at: ${env.CLIENT_URL}`);
  });
}

startServer();
