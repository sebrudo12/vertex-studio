import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { verifyLicenseKey } from '../services/licenseService';

export async function getMyLicenses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    const [licenses]: any = await pool.query(
      `SELECT l.*, p.title as product_title, p.slug as product_slug, p.version as product_version, p.thumbnail
       FROM licenses l
       JOIN products p ON l.product_id = p.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );

    res.json({ licenses });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
}

export async function updateServerIp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { serverIp } = req.body;

    if (!serverIp || typeof serverIp !== 'string') {
      res.status(400).json({ error: 'Valid server IP (e.g. 192.168.1.50:30120) is required' });
      return;
    }

    const [result]: any = await pool.query(
      'UPDATE licenses SET bound_server_ip = ? WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [serverIp.trim(), id, userId, req.user?.role]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'License not found or unauthorized' });
      return;
    }

    res.json({ message: 'Server IP updated successfully', serverIp });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update server IP' });
  }
}

export async function verifyLicenseFiveM(req: Request, res: Response): Promise<void> {
  try {
    const { license_key, server_ip } = req.body;

    if (!license_key) {
      res.status(400).json({ valid: false, message: 'Missing license_key parameter' });
      return;
    }

    // Determine client IP from headers or connection
    const requestIp = (
      server_ip ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    ).toString().split(',')[0].trim();

    const result = await verifyLicenseKey(license_key.trim(), requestIp);

    if (!result.valid) {
      res.status(403).json(result);
      return;
    }

    res.json(result);
  } catch (error: any) {
    console.error('License verification error:', error);
    res.status(500).json({ valid: false, message: 'Internal license server error' });
  }
}
