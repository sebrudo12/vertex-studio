import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { verifyLicenseKey, regenerateLicense, transferLicense } from '../services/licenseService';

export async function getMyLicenses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;

    const [licenses]: any = await pool.query(
      `SELECT l.*, p.title as product_title, p.slug as product_slug, p.version as product_version, 
              p.thumbnail, p.category, p.frameworks, p.short_description
       FROM licenses l
       JOIN products p ON l.product_id = p.id
       WHERE l.user_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );

    res.json({
      licenses: licenses.map((l: any) => ({
        ...l,
        status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
        frameworks: typeof l.frameworks === 'string' ? JSON.parse(l.frameworks || '[]') : (l.frameworks || [])
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
}

export async function updateServerIp(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { serverIp } = req.body;

    const ipToSave = serverIp ? String(serverIp).trim() : null;

    const [result]: any = await pool.query(
      'UPDATE licenses SET bound_server_ip = ? WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [ipToSave, id, userId, req.user?.role]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Licencia no encontrada o no autorizada' });
      return;
    }

    res.json({ message: 'IP de servidor actualizada correctamente', serverIp: ipToSave });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update server IP' });
  }
}

export async function regenerateKey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const isAdmin = req.user?.role === 'admin';

    const newKey = await regenerateLicense(parseInt(id, 10), userId!, isAdmin);
    res.json({ message: 'Clave de licencia regenerada con éxito', newKey });
  } catch (error: any) {
    res.status(400).json({ detail: error.message || 'Error al regenerar licencia' });
  }
}

export async function transferLicenseController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { targetUser } = req.body;
    const isAdmin = req.user?.role === 'admin';

    if (!targetUser || typeof targetUser !== 'string' || !targetUser.trim()) {
      res.status(400).json({ detail: 'Debes indicar el email o usuario del destinatario' });
      return;
    }

    const result = await transferLicense(parseInt(id, 10), userId!, targetUser.trim(), isAdmin);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ detail: error.message || 'Error al transferir licencia' });
  }
}

export async function getMyServers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const [servers]: any = await pool.query(`
      SELECT s.*, p.title as product_title, p.slug as product_slug, p.thumbnail as product_image,
             l.license_key
      FROM license_servers s
      JOIN products p ON s.product_id = p.id
      JOIN licenses l ON s.license_id = l.id
      WHERE s.user_id = ?
      ORDER BY s.last_seen_at DESC
    `, [userId]);

    res.json({ servers });
  } catch (error: any) {
    console.error('getMyServers error:', error);
    res.status(500).json({ error: 'Error al obtener servidores conectados' });
  }
}

export async function unlinkServer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const [sRows]: any = await pool.query(
      'SELECT * FROM license_servers WHERE id = ? AND (user_id = ? OR ? = "admin")',
      [id, userId, req.user?.role]
    );

    if (sRows.length === 0) {
      res.status(404).json({ error: 'Servidor no encontrado o no autorizado' });
      return;
    }

    const srv = sRows[0];
    await pool.query('DELETE FROM license_servers WHERE id = ?', [srv.id]);
    await pool.query('UPDATE licenses SET bound_server_ip = NULL WHERE id = ?', [srv.license_id]);

    res.json({ message: 'Servidor desvinculado exitosamente. La IP de la licencia ha quedado liberada para un nuevo servidor.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al desvincular servidor' });
  }
}

export async function getMyTransfers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const [transfers]: any = await pool.query(`
      SELECT t.*, 
             u_from.username as from_username, u_from.email as from_email,
             u_to.username as to_username, u_to.email as to_email
      FROM asset_transfers t
      JOIN users u_from ON t.from_user_id = u_from.id
      JOIN users u_to ON t.to_user_id = u_to.id
      WHERE t.from_user_id = ? OR t.to_user_id = ?
      ORDER BY t.transferred_at DESC
    `, [userId, userId]);

    res.json({ transfers });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener transferencias' });
  }
}

export async function verifyLicenseFiveM(req: Request, res: Response): Promise<void> {
  try {
    const { license_key, server_ip, server_name, server_port, max_players, game_build } = req.body;

    if (!license_key) {
      res.status(400).json({ valid: false, message: 'Falta el parámetro license_key' });
      return;
    }

    // Determine client IP from headers or connection
    const requestIp = (
      server_ip ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      '127.0.0.1'
    ).toString().split(',')[0].trim();

    const result = await verifyLicenseKey(license_key.trim(), requestIp, {
      server_name: server_name ? String(server_name).slice(0, 255) : undefined,
      server_port: server_port ? String(server_port).slice(0, 20) : undefined,
      max_players: max_players ? parseInt(max_players, 10) : undefined,
      game_build: game_build ? String(game_build).slice(0, 100) : undefined
    });

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
