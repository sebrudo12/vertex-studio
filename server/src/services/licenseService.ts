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

export async function verifyLicenseKey(licenseKey: string, requestIp: string) {
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
  return newKey;
}

export async function transferLicense(licenseId: number, fromUserId: number, targetUserQuery: string, isAdmin = false) {
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

  return {
    success: true,
    newLicenseKey: newKey,
    transferredTo: {
      username: targetUser.username,
      email: targetUser.email
    }
  };
}
