import crypto from 'crypto';
import { pool } from '../config/db';

export function generateLicenseKey(): string {
  const seg1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const seg3 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VERTEX-${seg1}-${seg2}-${seg3}`;
}

export async function verifyLicenseKey(licenseKey: string, requestIp: string) {
  const [rows]: any = await pool.query(
    `SELECT l.*, p.title as product_title, p.slug as product_slug, u.username, u.email
     FROM licenses l
     JOIN products p ON l.product_id = p.id
     JOIN users u ON l.user_id = u.id
     WHERE l.license_key = ?`,
    [licenseKey]
  );

  if (rows.length === 0) {
    return { valid: false, message: 'License key does not exist' };
  }

  const lic = rows[0];

  if (lic.status === 'revoked') {
    return { valid: false, message: 'License has been revoked by staff' };
  }

  if (lic.status === 'expired') {
    return { valid: false, message: 'License has expired' };
  }

  // Check expiration date if set
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) {
    await pool.query('UPDATE licenses SET status = "expired" WHERE id = ?', [lic.id]);
    return { valid: false, message: 'License has expired' };
  }

  // Auto-bind IP on first verification if not bound yet
  if (!lic.bound_server_ip) {
    await pool.query('UPDATE licenses SET bound_server_ip = ? WHERE id = ?', [requestIp, lic.id]);
    lic.bound_server_ip = requestIp;
  } else if (lic.bound_server_ip !== requestIp && lic.bound_server_ip !== '127.0.0.1') {
    // If request IP is different from bound IP
    return {
      valid: false,
      message: `License bound to server IP (${lic.bound_server_ip}). Request was from (${requestIp}). Update bound IP in your Vertex Dashboard.`
    };
  }

  return {
    valid: true,
    license: {
      key: lic.license_key,
      status: lic.status,
      product: lic.product_title,
      slug: lic.product_slug,
      boundIp: lic.bound_server_ip,
      owner: lic.username
    }
  };
}
