import { Router, Response } from 'express';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateLicenseKey } from '../services/licenseService';

const router = Router();

// POST /api/checkout/free-claim
router.post('/free-claim', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { product_ids } = req.body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      res.status(400).json({ detail: 'No products specified' });
      return;
    }

    await connection.beginTransaction();

    const orderNumber = `VTX-FREE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const [ordRes]: any = await connection.query(
      `INSERT INTO orders (order_number, user_id, total_amount, currency, status, payment_method, customer_email)
       VALUES (?, ?, 0, 'EUR', 'completed', 'free_claim', ?)`,
      [orderNumber, userId, userEmail]
    );
    const orderId = ordRes.insertId;

    for (const pid of product_ids) {
      const [pRows]: any = await connection.query('SELECT id, title, price FROM products WHERE id = ?', [pid]);
      if (pRows.length === 0) continue;
      const prod = pRows[0];

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, price, product_title) VALUES (?, ?, 0, ?)',
        [orderId, prod.id, prod.title]
      );

      const licenseKey = generateLicenseKey();
      await connection.query(
        `INSERT INTO licenses (license_key, user_id, product_id, order_id, status, bound_server_ip, max_ips)
         VALUES (?, ?, ?, ?, 'active', NULL, 1)`,
        [licenseKey, userId, prod.id, orderId]
      );
    }

    await connection.commit();
    res.status(201).json({ order_id: orderId, message: 'Free resources claimed successfully' });
  } catch (error: any) {
    await connection.rollback();
    console.error('Free claim error:', error);
    res.status(500).json({ detail: error.message || 'Free claim failed' });
  } finally {
    connection.release();
  }
});

// POST /api/checkout/paypal/create
router.post('/paypal/create', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paypalOrderId = `PAYID-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
    res.json({ id: paypalOrderId });
  } catch (error: any) {
    res.status(500).json({ detail: 'PayPal create failed' });
  }
});

// POST /api/checkout/paypal/capture
router.post('/paypal/capture', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { paypal_order_id, product_ids, coupon_code } = req.body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      res.status(400).json({ detail: 'No products in checkout' });
      return;
    }

    await connection.beginTransaction();

    let totalAmount = 0;
    const itemsToInsert: any[] = [];

    for (const pid of product_ids) {
      const [pRows]: any = await connection.query('SELECT id, title, price FROM products WHERE id = ?', [pid]);
      if (pRows.length === 0) continue;
      const p = pRows[0];
      const pr = parseFloat(p.price) || 0;
      totalAmount += pr;
      itemsToInsert.push({ id: p.id, title: p.title, price: pr });
    }

    let discountAmount = 0;
    let appliedCode: string | null = null;
    if (coupon_code) {
      const [cRows]: any = await connection.query(
        'SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1',
        [String(coupon_code).trim().toUpperCase()]
      );
      if (cRows.length > 0) {
        const cp = cRows[0];
        const isExpired = cp.expires_at && new Date() > new Date(cp.expires_at);
        const limitReached = cp.max_uses !== null && cp.used_count >= cp.max_uses;
        const meetsMin = totalAmount >= (parseFloat(cp.min_spend) || 0);
        if (!isExpired && !limitReached && meetsMin) {
          appliedCode = cp.code;
          const val = parseFloat(cp.discount_value);
          discountAmount = cp.discount_type === 'percentage' ? (totalAmount * val) / 100 : val;
          discountAmount = Math.min(discountAmount, totalAmount);
          await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [cp.id]);
        }
      }
    }
    const finalAmount = parseFloat(Math.max(0, totalAmount - discountAmount).toFixed(2));

    const orderNumber = `VTX-PP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const [ordRes]: any = await connection.query(
      `INSERT INTO orders (order_number, user_id, total_amount, coupon_code, discount_amount, currency, status, payment_method, transaction_id, customer_email)
       VALUES (?, ?, ?, ?, ?, 'EUR', 'completed', 'paypal', ?, ?)`,
      [orderNumber, userId, finalAmount, appliedCode, discountAmount, paypal_order_id, userEmail]
    );
    const orderId = ordRes.insertId;

    for (const item of itemsToInsert) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, price, product_title) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.price, item.title]
      );

      const licenseKey = generateLicenseKey();
      await connection.query(
        `INSERT INTO licenses (license_key, user_id, product_id, order_id, status, bound_server_ip, max_ips)
         VALUES (?, ?, ?, ?, 'active', NULL, 1)`,
        [licenseKey, userId, item.id, orderId]
      );
    }

    await connection.commit();
    res.json({ order_id: orderId, message: 'Payment captured successfully' });
  } catch (error: any) {
    await connection.rollback();
    console.error('PayPal capture error:', error);
    res.status(500).json({ detail: error.message || 'PayPal capture failed' });
  } finally {
    connection.release();
  }
});

export default router;
