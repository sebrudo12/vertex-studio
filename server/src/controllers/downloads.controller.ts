import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

export async function downloadProductFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    // 1. Check if user owns the product or is admin
    let hasAccess = false;
    let licenseId: number | null = null;

    if (req.user?.role === 'admin') {
      hasAccess = true;
    } else {
      const [licRows]: any = await pool.query(
        'SELECT id, status FROM licenses WHERE user_id = ? AND product_id = ? AND status = "active"',
        [userId, productId]
      );

      if (licRows.length > 0) {
        hasAccess = true;
        licenseId = licRows[0].id;
      }
    }

    if (!hasAccess) {
      res.status(403).json({ error: 'You do not have an active license for this product' });
      return;
    }

    // 2. Fetch product file details
    const [pRows]: any = await pool.query(
      'SELECT id, title, slug, version, download_filename FROM products WHERE id = ?',
      [productId]
    );

    if (pRows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = pRows[0];
    const filePath = path.join(env.SCRIPTS_STORAGE_PATH, product.download_filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Resource package file is not found on server storage' });
      return;
    }

    // 3. Log download for fraud prevention and audit
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await pool.query(
      `INSERT INTO downloads (user_id, product_id, license_id, version, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, product.id, licenseId, product.version, clientIp, userAgent]
    );

    // 4. Stream file download
    res.setHeader('Content-Disposition', `attachment; filename="${product.download_filename}"`);
    res.setHeader('Content-Type', 'application/zip');
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}

export async function getMyDownloads(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    // Get all products user has licensed, plus download logs
    const [ownedProducts]: any = await pool.query(
      `SELECT p.id as product_id, p.title, p.slug, p.version, p.download_filename, p.thumbnail,
              l.license_key, l.status as license_status, l.created_at as purchased_at
       FROM licenses l
       JOIN products p ON l.product_id = p.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );

    const [logs]: any = await pool.query(
      `SELECT d.*, p.title as product_title
       FROM downloads d
       JOIN products p ON d.product_id = p.id
       WHERE d.user_id = ?
       ORDER BY d.downloaded_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({
      availableDownloads: ownedProducts,
      history: logs
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
}
