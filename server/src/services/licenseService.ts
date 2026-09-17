import crypto from 'crypto';
import { pool } from '../config/db';

export function generateLicenseKey(): string {
  const seg1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VERTEX-${seg1}-${seg2}-${seg3}`;
}

function cleanIp(ip: string): string {
  if (!ip) return '127.0.0.1';
  let cleaned = ip.trim();
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.replace('::ffff:', '');
  }
  // Strip port if present
  if (cleaned.includes(':') && !cleaned.includes('::')) {
    cleaned = cleaned.split(':')[0];
  }
  return cleaned;
}

export interface ServerMeta {
  server_name?: string;
  server_port?: string;
  max_players?: number;
  game_build?: string;
}

export async function verifyLicenseKey(licenseKey: string, requestIp: string, meta?: ServerMeta) {
  const cleanedReqIp = cleanIp(requestIp);

  const [rows]: any = await pool.query(
    `SELECT l.*, p.title as product_title, p.slug as product_slug, p.version as product_version, u.username, u.email
     FROM licenses l
     JOIN products p ON l.product_id = p.id
     JOIN users u ON l.user_id = u.id
     WHERE l.license_key = ?`,
    [licenseKey]
  );

  if (rows.length === 0) {
    return { valid: false, message: 'La clave de licencia no existe o es inválida.' };
  }

  const lic = rows[0];

  if (lic.status === 'revoked') {
    return { valid: false, message: 'Esta licencia ha sido revocada por administración.' };
  }

  if (lic.status === 'expired') {
    return { valid: false, message: 'Esta licencia ha expirado.' };
  }

  // Check expiration date if set
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
    await pool.query('UPDATE licenses SET status = "expired" WHERE id = ?', [lic.id]);
    return { valid: false, message: 'Esta licencia ha expirado.' };
  }

  const cleanedBoundIp = lic.bound_server_ip ? cleanIp(lic.bound_server_ip) : null;
  const isLocalhost = cleanedReqIp === '127.0.0.1' || cleanedReqIp === 'localhost' || cleanedReqIp === '::1';

  // If local development, allow without overriding remote bound IP
  if (!cleanedBoundIp && !isLocalhost) {
    await pool.query('UPDATE licenses SET bound_server_ip = ? WHERE id = ?', [cleanedReqIp, lic.id]);
    lic.bound_server_ip = cleanedReqIp;
  } else if (cleanedBoundIp && cleanedBoundIp !== cleanedReqIp && !isLocalhost && cleanedBoundIp !== '127.0.0.1') {
    return {
      valid: false,
      message: `Licencia vinculada a la IP (${lic.bound_server_ip}). La petición proviene de (${cleanedReqIp}). Actualiza la IP de tu servidor en Vertex Keymaster.`
    };
  }

  // Record or update server heartbeat in license_servers
  try {
    const sName = meta?.server_name || (isLocalhost ? 'Servidor Local (Desarrollo)' : 'Servidor FiveM');
    const sPort = meta?.server_port || '30120';
    const maxP = meta?.max_players || 32;
    const gBuild = meta?.game_build || 'FiveM';

    const [srvRows]: any = await pool.query(
      'SELECT id FROM license_servers WHERE license_id = ? AND server_ip = ?',
      [lic.id, cleanedReqIp]
    );

    if (srvRows.length > 0) {
      await pool.query(
        `UPDATE license_servers
         SET server_name = ?, server_port = ?, max_players = ?, game_build = ?, status = 'online', last_seen_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [sName, sPort, maxP, gBuild, srvRows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO license_servers (license_id, user_id, product_id, server_name, server_ip, server_port, max_players, game_build, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'online')`,
        [lic.id, lic.user_id, lic.product_id, sName, cleanedReqIp, sPort, maxP, gBuild]
      );
    }
  } catch (srvErr) {
    console.warn('Error recording license server heartbeat:', srvErr);
  }

  return {
    valid: true,
    license: {
      key: lic.license_key,
      status: lic.status,
      product: lic.product_title,
      slug: lic.product_slug,
      version: lic.product_version,
      boundIp: lic.bound_server_ip || cleanedReqIp,
      owner: lic.username
    }
  };
}

export async function regenerateLicense(licenseId: number, userId: number, isAdmin = false) {
  const newKey = generateLicenseKey();
  const query = isAdmin
    ? 'UPDATE licenses SET license_key = ?, bound_server_ip = NULL WHERE id = ?'
    : 'UPDATE licenses SET license_key = ?, bound_server_ip = NULL WHERE id = ? AND user_id = ?';
  const params = isAdmin ? [newKey, licenseId] : [newKey, licenseId, userId];

  const [res]: any = await pool.query(query, params);
  if (res.affectedRows === 0) {
    throw new Error('Licencia no encontrada o no autorizada');
  }

  // Clear connected servers for this license on regeneration
  await pool.query('DELETE FROM license_servers WHERE license_id = ?', [licenseId]);

  return newKey;
}

export async function transferLicense(licenseId: number, fromUserId: number, targetUserQuery: string, isAdmin = false) {
  // Find license
  const [licRows]: any = await pool.query(
    'SELECT l.*, p.title as product_title FROM licenses l JOIN products p ON l.product_id = p.id WHERE l.id = ?',
    [licenseId]
  );
  if (licRows.length === 0) {
    throw new Error('Licencia no encontrada');
  }
  const lic = licRows[0];

  // Find target user
  const [targetRows]: any = await pool.query(
    'SELECT id, username, email FROM users WHERE (email = ? OR username = ?) AND status = "active"',
    [targetUserQuery.trim(), targetUserQuery.trim()]
  );

  if (targetRows.length === 0) {
    throw new Error('Usuario destinatario no encontrado en Vertex Studio');
  }

  const targetUser = targetRows[0];
  if (targetUser.id === fromUserId && !isAdmin) {
    throw new Error('No puedes transferirte la licencia a ti mismo');
  }

  // Regenerate key on transfer for security
  const newKey = generateLicenseKey();

  const query = isAdmin
    ? 'UPDATE licenses SET user_id = ?, license_key = ?, bound_server_ip = NULL WHERE id = ?'
    : 'UPDATE licenses SET user_id = ?, license_key = ?, bound_server_ip = NULL WHERE id = ? AND user_id = ?';
  const params = isAdmin ? [targetUser.id, newKey, licenseId] : [targetUser.id, newKey, licenseId, fromUserId];

  const [res]: any = await pool.query(query, params);
  if (res.affectedRows === 0) {
    throw new Error('Licencia no encontrada o no autorizada');
  }

  // Record in asset_transfers
  await pool.query(
    'INSERT INTO asset_transfers (license_id, from_user_id, to_user_id, product_title) VALUES (?, ?, ?, ?)',
    [licenseId, fromUserId, targetUser.id, lic.product_title || 'Recurso FiveM']
  );

  // Clear server activations from previous owner
  await pool.query('DELETE FROM license_servers WHERE license_id = ?', [licenseId]);

  return {
    success: true,
    newLicenseKey: newKey,
    transferredTo: {
      username: targetUser.username,
      email: targetUser.email
    }
  };
}
