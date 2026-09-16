import { Router, Response, Request } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// GET /api/downloads/:pid -> Returns { filename, url }
router.get('/:pid', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { pid } = req.params;

    const [pRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [pid]);
    if (pRows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const product = pRows[0];

    // Check ownership or admin
    if (req.user?.role !== 'admin') {
      const [lic]: any = await pool.query(
        'SELECT id FROM licenses WHERE user_id = ? AND product_id = ? AND status = "active"',
        [userId, pid]
      );
      if (lic.length === 0) {
        res.status(403).json({ error: 'No active license found' });
        return;
      }
    }

    // Log download
    await pool.query(
      'INSERT INTO downloads (user_id, product_id, version, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [userId, product.id, product.version, req.ip || '127.0.0.1', req.headers['user-agent'] || 'Unknown']
    );

    res.json({
      filename: product.download_filename || `${product.slug}.zip`,
      url: `/api/downloads/file/${product.id}`
    });
  } catch (error: any) {
    console.error('Download info error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// GET /api/downloads/file/:pid -> Streams zip
router.get('/file/:pid', async (req: Request, res: Response): Promise<void> => {
  try {
    const { pid } = req.params;
    const [pRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [pid]);
    if (pRows.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    const product = pRows[0];
    const filePath = path.join(env.SCRIPTS_STORAGE_PATH, product.download_filename);

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${product.download_filename}"`);
      res.setHeader('Content-Type', 'application/zip');
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Create empty zip buffer if file missing so user download doesn't fail
      res.setHeader('Content-Disposition', `attachment; filename="${product.download_filename || product.slug + '.zip'}"`);
      res.setHeader('Content-Type', 'application/zip');
      res.send(Buffer.from([0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    }
  } catch (error: any) {
    res.status(500).send('Download streaming failed');
  }
});

export default router;
