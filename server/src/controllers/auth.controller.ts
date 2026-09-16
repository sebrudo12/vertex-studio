import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { pool } from '../config/db';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const username = req.body.username || req.body.name;
    const { email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ detail: 'Name/username, email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ detail: 'Password must be at least 6 characters' });
      return;
    }

    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      res.status(400).json({ detail: 'Username or email is already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const ADMIN_EMAILS = ['admin@vertexstudio.com', 'sebasruades8@gmail.com'];
    const assignedRole = ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'customer';

    const [result]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, avatar_url, status) VALUES (?, ?, ?, ?, ?, "active")',
      [username, email, passwordHash, assignedRole, avatarUrl]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email, role: assignedRole }, env.JWT_SECRET, {
      expiresIn: '7d' as any
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      id: userId,
      name: username,
      username,
      email,
      role: 'customer',
      avatar: avatarUrl,
      avatar_url: avatarUrl,
      status: 'active',
      user: {
        id: userId,
        username,
        name: username,
        email,
        role: 'customer',
        avatar_url: avatarUrl,
        avatar: avatarUrl,
        status: 'active'
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Failed to create account' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ detail: 'Email and password are required' });
      return;
    }

    const [rows]: any = await pool.query(
      'SELECT id, username, email, password_hash, role, status, avatar_url, discord_id, discord_tag FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ detail: 'Invalid email or password' });
      return;
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      res.status(403).json({ detail: 'Account suspended. Please contact support.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ detail: 'Invalid email or password' });
      return;
    }

    const ADMIN_EMAILS = ['admin@vertexstudio.com', 'sebasruades8@gmail.com'];
    if (ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await pool.query('UPDATE users SET role = "admin" WHERE id = ?', [user.id]);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: '7d' as any
    });

    res.json({
      message: 'Login successful',
      token,
      id: user.id,
      email: user.email,
      name: user.username,
      username: user.username,
      role: user.role,
      avatar: user.avatar_url,
      avatar_url: user.avatar_url,
      status: user.status,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        avatar: user.avatar_url,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Failed to log in' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ detail: 'Unauthorized' });
    return;
  }
  const u: any = req.user;
  res.json({
    id: u.id,
    email: u.email,
    name: u.username,
    username: u.username,
    role: u.role,
    avatar: u.avatar_url,
    avatar_url: u.avatar_url,
    status: u.status,
    user: u
  });
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { username, avatar_url, discord_tag } = req.body;

    await pool.query(
      'UPDATE users SET username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url), discord_tag = COALESCE(?, discord_tag) WHERE id = ?',
      [username, avatar_url, discord_tag, userId]
    );

    const [rows]: any = await pool.query(
      'SELECT id, username, email, role, status, avatar_url, discord_id, discord_tag FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (error: any) {
    res.status(500).json({ detail: 'Failed to update profile' });
  }
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ detail: 'Valid current and new password (min 6 chars) required' });
      return;
    }

    const [rows]: any = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      res.status(400).json({ detail: 'Incorrect current password' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ detail: 'Failed to change password' });
  }
}

function resolveDiscordRedirectUri(req: Request): string {
  if (env.DISCORD_REDIRECT_URI && !env.DISCORD_REDIRECT_URI.includes('localhost')) {
    return env.DISCORD_REDIRECT_URI;
  }
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:5000';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}/api/auth/discord/callback`;
}

export async function getDiscordAuthUrl(req: Request, res: Response): Promise<void> {
  try {
    const clientId = env.DISCORD_CLIENT_ID;
    const redirectUri = resolveDiscordRedirectUri(req);

    if (!clientId || !env.DISCORD_CLIENT_SECRET) {
      // Demo / simulated mode if user has not yet put real Discord Client ID & Secret
      const mockDiscordId = '987654321012345678';
      const mockEmail = 'discord_demo@vertexstudio.com';
      const mockUsername = 'DiscordPlayer';

      let [userRows]: any = await pool.query('SELECT * FROM users WHERE discord_id = ? OR email = ?', [mockDiscordId, mockEmail]);
      let user;

      if (userRows.length === 0) {
        const [resIns]: any = await pool.query(
          'INSERT INTO users (username, email, role, avatar_url, discord_id, discord_tag, status) VALUES (?, ?, "customer", ?, ?, ?, "active")',
          [mockUsername, mockEmail, 'https://cdn.discordapp.com/embed/avatars/0.png', mockDiscordId, 'DiscordPlayer#0001']
        );
        user = { id: resIns.insertId, username: mockUsername, email: mockEmail, role: 'customer', status: 'active', avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png' };
      } else {
        user = userRows[0];
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' as any });
      res.json({
        url: `${env.CLIENT_URL}/auth/discord?token=${token}`,
        configured: false
      });
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const scope = encodeURIComponent('identify email');
    const url = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    res.json({ url, configured: true });
  } catch (error: any) {
    console.error('getDiscordAuthUrl error:', error);
    res.status(500).json({ detail: 'Failed to generate Discord auth URL' });
  }
}

export async function discordCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = (req.query.code as string) || (req.body && req.body.code);
    const error = (req.query.error as string) || (req.body && req.body.error);

    if (error || !code) {
      if (req.method === 'GET') {
        res.redirect(`${env.CLIENT_URL}/auth/discord?error=${encodeURIComponent(error || 'cancelled')}`);
        return;
      }
      res.status(400).json({ detail: error || 'Authorization code required' });
      return;
    }

    if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
      const mockToken = jwt.sign({ id: 2, email: 'customer@vertexstudio.com', role: 'customer' }, env.JWT_SECRET, { expiresIn: '7d' as any });
      if (req.method === 'GET') {
        res.redirect(`${env.CLIENT_URL}/auth/discord?token=${mockToken}`);
        return;
      }
      res.json({ token: mockToken });
      return;
    }

    // Exchange code with Discord API
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: resolveDiscordRedirectUri(req)
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const dUser = userResponse.data;
    const discordId = dUser.id;
    const discordTag = dUser.discriminator && dUser.discriminator !== '0'
      ? `${dUser.username}#${dUser.discriminator}`
      : dUser.username;
    const email = dUser.email || `${discordId}@discord.vertexstudio.com`;
    const avatar = dUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${dUser.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/${(parseInt(discordId.slice(-1), 10) || 0) % 5}.png`;

    let [userRows]: any = await pool.query('SELECT * FROM users WHERE discord_id = ? OR email = ?', [discordId, email]);
    let user;

    const ADMIN_EMAILS = ['admin@vertexstudio.com', 'sebasruades8@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase()) || (userRows.length > 0 && userRows[0].role === 'admin');
    const targetRole = isAdmin ? 'admin' : 'customer';

    if (userRows.length === 0) {
      const [resIns]: any = await pool.query(
        'INSERT INTO users (username, email, role, avatar_url, discord_id, discord_tag, status) VALUES (?, ?, ?, ?, ?, ?, "active")',
        [dUser.global_name || dUser.username, email, targetRole, avatar, discordId, discordTag]
      );
      user = {
        id: resIns.insertId,
        username: dUser.global_name || dUser.username,
        email,
        role: targetRole,
        avatar_url: avatar,
        status: 'active'
      };
    } else {
      user = userRows[0];
      user.role = targetRole;
      await pool.query(
        'UPDATE users SET discord_id = ?, discord_tag = ?, avatar_url = COALESCE(?, avatar_url), role = ? WHERE id = ?',
        [discordId, discordTag, avatar, targetRole, user.id]
      );
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' as any }
    );

    if (req.method === 'GET') {
      const redirectParams = new URLSearchParams({
        token,
        role: user.role || 'customer',
        name: user.username || 'User',
        email: user.email || '',
        avatar: user.avatar_url || '',
      });
      res.redirect(`${env.CLIENT_URL}/auth/discord?${redirectParams.toString()}`);
    } else {
      res.json({ token, user });
    }
  } catch (error: any) {
    const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : (error.message || 'auth_failed');
    console.error('Discord callback error:', errorMsg);
    if (req.method === 'GET') {
      res.redirect(`${env.CLIENT_URL}/auth/discord?error=${encodeURIComponent(errorMsg)}`);
    } else {
      res.status(500).json({ detail: errorMsg });
    }
  }
}
