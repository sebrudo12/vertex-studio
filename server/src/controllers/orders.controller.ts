import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { generateLicenseKey } from '../services/licenseService';
import { processPayment } from '../services/paymentService';

export async function checkout(req: AuthRequest, res: Response): Promise<void> {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { items, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const provider = paymentMethod === 'paypal' ? 'paypal' : (paymentMethod === 'stripe' ? 'stripe' : 'test_sandbox');

    await connection.beginTransaction();

    // 1. Calculate total & verify products
    let totalAmount = 0;
    const orderItemsToInsert: any[] = [];

    for (const item of items) {
      const [pRows]: any = await connection.query(
        'SELECT id, title, price, download_filename FROM products WHERE id = ? AND status = "active"',
        [item.id]
      );

      if (pRows.length === 0) {
        throw new Error(`Product with ID ${item.id} is unavailable or not found`);
      }

      const product = pRows[0];
      const price = parseFloat(product.price);
      totalAmount += price;

      orderItemsToInsert.push({
        productId: product.id,
        price,
        productTitle: product.title,
        downloadFilename: product.download_filename
      });
    }

    // 2. Process payment
    const paymentResult = await processPayment(provider, totalAmount, orderItemsToInsert);
    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    // 3. Create Order
    const orderNumber = `VTX-ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const [orderRes]: any = await connection.query(
      `INSERT INTO orders (order_number, user_id, total_amount, currency, status, payment_method, transaction_id, customer_email)
       VALUES (?, ?, ?, 'EUR', 'completed', ?, ?, ?)`,
      [orderNumber, userId, totalAmount, provider, paymentResult.transactionId, userEmail]
    );

    const orderId = orderRes.insertId;

    // 4. Create Order Items & Licenses
    const generatedLicenses: any[] = [];

    for (const oi of orderItemsToInsert) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, price, product_title) VALUES (?, ?, ?, ?)',
        [orderId, oi.productId, oi.price, oi.productTitle]
      );

      // Generate unique license key for this product
      const licenseKey = generateLicenseKey();
      const [licRes]: any = await connection.query(
        `INSERT INTO licenses (license_key, user_id, product_id, order_id, status, bound_server_ip, max_ips)
         VALUES (?, ?, ?, ?, 'active', NULL, 1)`,
        [licenseKey, userId, oi.productId, orderId]
      );

      generatedLicenses.push({
        id: licRes.insertId,
        key: licenseKey,
        productTitle: oi.productTitle,
        productId: oi.productId
      });
    }

    // 5. Record Payment log
    await connection.query(
      `INSERT INTO payments (order_id, provider, provider_payment_id, amount, status, raw_payload)
       VALUES (?, ?, ?, ?, 'succeeded', ?)`,
      [orderId, provider, paymentResult.transactionId, totalAmount, JSON.stringify(paymentResult)]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order completed successfully',
      orderId,
      orderNumber,
      totalAmount,
      currency: 'EUR',
      paymentMethod: provider,
      licenses: generatedLicenses
    });
  } catch (error: any) {
    await connection.rollback();
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Checkout failed' });
  } finally {
    connection.release();
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    const [orders]: any = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Fetch items for each order
    for (const order of orders) {
      const [items]: any = await pool.query(
        `SELECT oi.*, p.slug, p.thumbnail 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const [orders]: any = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [id, userId, req.user?.role]
    );

    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = orders[0];
    const [items]: any = await pool.query(
      `SELECT oi.*, p.slug, p.thumbnail, l.license_key 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       LEFT JOIN licenses l ON l.order_id = oi.order_id AND l.product_id = oi.product_id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;
    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}
