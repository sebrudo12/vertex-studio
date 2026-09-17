import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { env } from '../config/env';
import { generateEncryptedZip, processAndProtectZip } from '../services/escrowService';

export async function downloadEscrowPackage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { licenseId } = req.params;

    // Fetch license and product details
    const [licRows]: any = await pool.query(
      `SELECT l.*, p.id as product_id, p.title, p.slug, p.version, p.short_description, p.download_filename,
              u.username, u.email
       FROM licenses l
       JOIN products p ON l.product_id = p.id
       JOIN users u ON l.user_id = u.id
       WHERE l.id = ? AND (l.user_id = ? OR ? = 'admin')`,
      [licenseId, userId, req.user?.role]
    );

    if (licRows.length === 0) {
      res.status(404).json({ error: 'Licencia no encontrada o no autorizada' });
      return;
    }

    const row = licRows[0];

    if (row.status === 'revoked') {
      res.status(403).json({ error: 'Esta licencia ha sido revocada. Contacta con soporte.' });
      return;
    }

    const host = req.get('x-forwarded-host') || req.get('host') || 'vertex-studio-api.onrender.com';
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const apiUrl = `${proto}://${host}`;

    let zipBuffer: Buffer;
    const uploadedPath = row.download_filename ? path.join(env.SCRIPTS_STORAGE_PATH, row.download_filename) : null;

    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try {
        const rawBuffer = fs.readFileSync(uploadedPath);
        const buyerMeta = {
          licenseKey: row.license_key,
          productTitle: row.title,
          productSlug: row.slug,
          version: row.version || '1.0.0',
          ownerUsername: row.username,
          ownerEmail: row.email,
          apiUrl,
          boundIp: row.bound_server_ip || undefined
        };
        const { buffer: buyerZip } = processAndProtectZip(rawBuffer, buyerMeta);
        zipBuffer = buyerZip;
      } catch (err) {
        zipBuffer = generateEncryptedZip(
          { id: row.product_id, title: row.title, slug: row.slug, version: row.version, short_description: row.short_description },
          { license_key: row.license_key, bound_server_ip: row.bound_server_ip },
          { username: row.username, email: row.email },
          apiUrl
        );
      }
    } else {
      // Generate complete protected FiveM resource
      zipBuffer = generateEncryptedZip(
        {
          id: row.product_id,
          title: row.title,
          slug: row.slug,
          version: row.version,
          short_description: row.short_description
        },
        {
          license_key: row.license_key,
          bound_server_ip: row.bound_server_ip
        },
        {
          username: row.username,
          email: row.email
        },
        apiUrl
      );
    }

    // Audit log
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').toString().split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await pool.query(
      'INSERT INTO downloads (user_id, product_id, license_id, version, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, row.product_id, row.id, row.version, clientIp, userAgent]
    );

    await pool.query('UPDATE licenses SET download_count = download_count + 1 WHERE id = ?', [row.id]);

    const filename = `[VERTEX-ESCROW]-${row.slug}-v${row.version || '1.0.0'}.zip`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (error: any) {
    console.error('Escrow download error:', error);
    res.status(500).json({ error: 'Error al generar la descarga encriptada' });
  }
}

export async function downloadProductFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { productId } = req.params;

    const [licRows]: any = await pool.query(
      'SELECT id FROM licenses WHERE user_id = ? AND product_id = ? AND status = "active"',
      [userId, productId]
    );

    if (licRows.length === 0 && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'No tienes una licencia activa para este producto' });
      return;
    }

    const licenseId = licRows[0]?.id;
    if (licenseId) {
      req.params.licenseId = licenseId.toString();
      return downloadEscrowPackage(req, res);
    }

    // Admin direct download fallback
    const [pRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (pRows.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    const product = pRows[0];
    const host = req.get('x-forwarded-host') || req.get('host') || 'vertex-studio-api.onrender.com';
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const apiUrl = `${proto}://${host}`;

    const zipBuffer = generateEncryptedZip(
      product,
      { license_key: 'VERTEX-ADMIN-MASTER', bound_server_ip: '127.0.0.1' },
      { username: req.user?.username || 'Admin', email: req.user?.email || 'admin@vertexstudio.com' },
      apiUrl
    );

    const filename = `[VERTEX-ADMIN]-${product.slug}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/zip');
    res.send(zipBuffer);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}

export async function getMyDownloads(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    const [ownedProducts]: any = await pool.query(
      `SELECT p.id as product_id, p.title, p.slug, p.version, p.download_filename, p.thumbnail,
              l.id as license_id, l.license_key, l.status as license_status, l.bound_server_ip,
              l.download_count, l.created_at as purchased_at
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
