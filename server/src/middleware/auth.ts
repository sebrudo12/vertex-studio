import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../config/db';

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: 'customer' | 'admin';
  staff_role?: string;
  status: 'active' | 'suspended';
  avatar_url?: string;
  discord_id?: string;
  discord_tag?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded: any = jwt.verify(token, env.JWT_SECRET);

    const [rows]: any = await pool.query(
      'SELECT id, username, email, role, staff_role, status, avatar_url, discord_id, discord_tag FROM users WHERE id = ? OR email = ?',
      [decoded.id || 0, decoded.email || '']
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'User not found or token invalid' });
      return;
    }

    const user = rows[0] as AuthenticatedUser;
    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Account suspended. Contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Invalid or expired token', detail: err.message });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const u = req.user;
  const isStaff = u && (u.role === 'admin' || (u.staff_role && u.staff_role !== 'Cliente'));
  if (!isStaff) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number };
      const [rows]: any = await pool.query(
        'SELECT id, username, email, role, status, avatar_url, discord_id, discord_tag FROM users WHERE id = ?',
        [decoded.id]
      );
      if (rows.length > 0 && rows[0].status === 'active') {
        req.user = rows[0] as AuthenticatedUser;
      }
    } catch {
      // ignore
    }
  }
  next();
}
