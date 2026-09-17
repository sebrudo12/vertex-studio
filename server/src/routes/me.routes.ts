import { Router, Response } from 'express';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// GET /api/me/summary
router.get('/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [ordersCount]: any = await pool.query('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId]);
    const [licensesCount]: any = await pool.query('SELECT COUNT(*) as count FROM licenses WHERE user_id = ? AND status = "active"', [userId]);
    const [downloadsCount]: any = await pool.query('SELECT COUNT(*) as count FROM downloads WHERE user_id = ?', [userId]);

    const [recentOrders]: any = await pool.query(
      'SELECT id, total_amount as amount, status, created_at as date FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    for (const o of recentOrders) {
      const [items]: any = await pool.query('SELECT product_title as name FROM order_items WHERE order_id = ?', [o.id]);
      o.items = items;
      o.amount = parseFloat(o.amount) || 0;
    }

    res.json({
      orders: ordersCount[0]?.count || 0,
      active_licenses: licensesCount[0]?.count || 0,
      available_downloads: licensesCount[0]?.count || 0,
      downloads: downloadsCount[0]?.count || 0,
      recent_orders: recentOrders
    });
  } catch (error: any) {
    console.error('me summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// GET /api/me/products
router.get('/products', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [rows]: any = await pool.query(`
      SELECT DISTINCT p.id, p.title as name, p.slug, p.thumbnail as image, p.version, p.short_description,
             l.id as license_id, l.license_key
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN licenses l ON l.user_id = o.user_id AND l.product_id = p.id AND l.status = 'active'
      WHERE o.user_id = ? AND o.status = 'completed'
      ORDER BY o.created_at DESC
    `, [userId]);

    const products = rows.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      version: p.version,
      short_description: p.short_description,
      license: p.license_key ? { key: p.license_key, id: p.license_id } : null
    }));

    res.json(products);
  } catch (error: any) {
    console.error('me products error:', error);
    res.status(500).json({ error: 'Failed to fetch my products' });
  }
});

// GET /api/me/licenses
router.get('/licenses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [licenses]: any = await pool.query(`
      SELECT l.id, l.license_key as \`key\`, l.status, l.bound_server_ip, l.download_count,
             l.created_at, l.expires_at as expires,
             p.id as product_id, p.title as product_name, p.slug, p.thumbnail as image,
             p.version, p.category, p.frameworks, p.short_description
      FROM licenses l
      JOIN products p ON l.product_id = p.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `, [userId]);

    res.json(licenses.map((l: any) => ({
      ...l,
      status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
      frameworks: typeof l.frameworks === 'string' ? JSON.parse(l.frameworks || '[]') : (l.frameworks || [])
    })));
  } catch (error: any) {
    console.error('me licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch my licenses' });
  }
});

// GET /api/me/orders
router.get('/orders', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const [orders]: any = await pool.query(`
      SELECT id, order_number, total_amount as amount, status, created_at as date, payment_method
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    for (const o of orders) {
      const [items]: any = await pool.query(`
        SELECT oi.id, oi.product_id, oi.product_title as name, oi.price, p.slug, p.thumbnail as image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [o.id]);
      o.items = items;
      o.amount = parseFloat(o.amount) || 0;
    }

    res.json(orders);
  } catch (error: any) {
    console.error('me orders error:', error);
    res.status(500).json({ error: 'Failed to fetch my orders' });
  }
});

export default router;
