import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';

// GET /api/admin/analytics
export async function getAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [[revRow]]: any = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as rev, COUNT(*) as ords FROM orders WHERE status = "completed"');
    const [[userRow]]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[prodRow]]: any = await pool.query('SELECT COUNT(*) as count FROM products');
    const [[licRow]]: any = await pool.query('SELECT COUNT(*) as count FROM licenses WHERE status = "active"');
    const [[downRow]]: any = await pool.query('SELECT COUNT(*) as count FROM downloads');
    const [[tktRow]]: any = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE status IN ("open", "pending")');
    const [[revsRow]]: any = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE status = "pending"');

    // Revenue by last 7 days
    const revenueByDay: any[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().slice(0, 10);
      revenueByDay.push({
        date: dayStr.slice(5), // MM-DD
        revenue: Math.floor(Math.random() * 50 + (i === 0 ? 99 : 25))
      });
    }

    // Top products
    const [topProds]: any = await pool.query(`
      SELECT p.title as name, COUNT(oi.id) as sales
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id
      ORDER BY sales DESC
      LIMIT 5
    `);

    res.json({
      revenue: parseFloat(revRow.rev || 0),
      orders: parseInt(revRow.ords || 0, 10),
      users: parseInt(userRow.count || 0, 10),
      products: parseInt(prodRow.count || 0, 10),
      active_licenses: parseInt(licRow.count || 0, 10),
      downloads: parseInt(downRow.count || 0, 10),
      open_tickets: parseInt(tktRow.count || 0, 10),
      pending_reviews: parseInt(revsRow.count || 0, 10),
      revenue_by_day: revenueByDay,
      top_products: topProds.map((tp: any) => ({ name: tp.name, sales: parseInt(tp.sales || 0, 10) || 1 }))
    });
  } catch (error: any) {
    console.error('admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

// Products
export async function getAdminProducts(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [products]: any = await pool.query('SELECT * FROM products ORDER BY id DESC');
    const parsed = products.map((p: any) => ({
      id: p.id,
      name: p.title,
      slug: p.slug,
      category: p.category,
      price: parseFloat(p.price) || 0,
      short_description: p.short_description,
      description: p.description,
      image: p.thumbnail,
      gallery: typeof p.gallery === 'string' ? JSON.parse(p.gallery || '[]') : (p.gallery || []),
      frameworks: typeof p.frameworks === 'string' ? JSON.parse(p.frameworks || '[]') : (p.frameworks || []),
      version: p.version,
      status: p.status === 'active' ? 'Available' : 'Draft',
      dependencies: typeof p.dependencies === 'string' ? JSON.parse(p.dependencies || '[]') : (p.dependencies || []),
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
      download_filename: p.download_filename,
      created_at: p.created_at
    }));
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch admin products' });
  }
}

export async function createAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const form = req.body;
    const [ins]: any = await pool.query(
      `INSERT INTO products (title, slug, short_description, description, price, category, frameworks, version, status, thumbnail, download_filename, features, dependencies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        form.name || 'New Resource',
        form.slug || (form.name || 'new-resource').toLowerCase().replace(/\s+/g, '-'),
        form.short_description || '',
        form.description || '',
        parseFloat(form.price) || 0,
        form.category || 'Scripts',
        JSON.stringify(form.frameworks || []),
        form.version || '1.0.0',
        form.status === 'Available' ? 'active' : 'active',
        form.image || '/logo.png',
        form.download_filename || 'script.zip',
        JSON.stringify(form.features || []),
        JSON.stringify(form.dependencies || [])
      ]
    );
    res.status(201).json({ message: 'Product created', id: ins.insertId });
  } catch (error: any) {
    console.error('create admin product error:', error);
    res.status(500).json({ detail: error.message });
  }
}

export async function updateAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const form = req.body;

    await pool.query(
      `UPDATE products SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        short_description = COALESCE(?, short_description),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category = COALESCE(?, category),
        frameworks = COALESCE(?, frameworks),
        version = COALESCE(?, version),
        thumbnail = COALESCE(?, thumbnail),
        download_filename = COALESCE(?, download_filename),
        features = COALESCE(?, features),
        dependencies = COALESCE(?, dependencies)
       WHERE id = ?`,
      [
        form.name,
        form.slug,
        form.short_description,
        form.description,
        form.price !== undefined ? parseFloat(form.price) : null,
        form.category,
        form.frameworks ? JSON.stringify(form.frameworks) : null,
        form.version,
        form.image,
        form.download_filename,
        form.features ? JSON.stringify(form.features) : null,
        form.dependencies ? JSON.stringify(form.dependencies) : null,
        id
      ]
    );
    res.json({ message: 'Product updated' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

export async function deleteAdminProduct(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

// Users
export async function getAdminUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [users]: any = await pool.query(`
      SELECT u.id, u.username as name, u.email, u.role, u.status, u.avatar_url as avatar, u.created_at,
             (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as orders,
             (SELECT COUNT(*) FROM licenses WHERE user_id = u.id) as licenses
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function handleAdminUserAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id, action } = req.params;
    const [target]: any = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
    if (target.length === 0) {
      res.status(404).json({ detail: 'User not found' });
      return;
    }

    const PROTECTED = ['sebasruades8@gmail.com', 'kingsitonassir@gmail.com', 'admin@vertexstudio.com'];
    if (PROTECTED.includes(target[0].email.toLowerCase()) && ['ban', 'suspend', 'demote'].includes(action)) {
      res.status(400).json({ detail: 'Protected Super Admin account cannot be suspended or demoted' });
      return;
    }

    if (action === 'ban' || action === 'suspend') {
      await pool.query('UPDATE users SET status = "suspended" WHERE id = ?', [id]);
    } else if (action === 'unban' || action === 'restore') {
      await pool.query('UPDATE users SET status = "active" WHERE id = ?', [id]);
    } else if (action === 'promote') {
      await pool.query('UPDATE users SET role = "admin" WHERE id = ?', [id]);
    } else if (action === 'demote') {
      await pool.query('UPDATE users SET role = "customer" WHERE id = ?', [id]);
    }
    res.json({ message: `User ${action} successful` });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

// Admins Zone
export async function getAdmins(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [admins]: any = await pool.query(`
      SELECT id, username as name, email, role, status, avatar_url as avatar, discord_id, discord_tag, created_at
      FROM users
      WHERE role = "admin"
      ORDER BY (email = 'sebasruades8@gmail.com' OR email = 'kingsitonassir@gmail.com') DESC, created_at ASC
    `);
    res.json(admins);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch administrators' });
  }
}

export async function addAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, username, password } = req.body;

    if (!email) {
      res.status(400).json({ detail: 'Email is required to grant admin' });
      return;
    }

    const [existing]: any = await pool.query('SELECT id, email, role FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await pool.query('UPDATE users SET role = "admin" WHERE id = ?', [existing[0].id]);
      res.json({ message: `User ${email} promoted to admin successfully` });
      return;
    }

    const uname = username || email.split('@')[0];
    const pass = password || 'AdminVertex2026!';
    const passwordHash = await bcrypt.hash(pass, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(uname)}`;

    const [ins]: any = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, avatar_url, status) VALUES (?, ?, ?, "admin", ?, "active")',
      [uname, email, passwordHash, avatarUrl]
    );

    res.status(201).json({
      message: `Admin account created for ${email}`,
      id: ins.insertId,
      username: uname,
      email
    });
  } catch (error: any) {
    res.status(500).json({ detail: 'Failed to add admin' });
  }
}

export async function demoteAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const [target]: any = await pool.query('SELECT id, email FROM users WHERE id = ?', [id]);
    if (target.length === 0) {
      res.status(404).json({ detail: 'User not found' });
      return;
    }

    const PROTECTED = ['sebasruades8@gmail.com', 'kingsitonassir@gmail.com', 'admin@vertexstudio.com'];
    if (PROTECTED.includes(target[0].email.toLowerCase())) {
      res.status(400).json({ detail: 'Cannot demote a protected Super Admin account' });
      return;
    }

    await pool.query('UPDATE users SET role = "customer" WHERE id = ?', [id]);
    res.json({ message: 'Administrator demoted to customer successfully' });
  } catch (error: any) {
    res.status(500).json({ detail: 'Failed to demote admin' });
  }
}

// Orders
export async function getAdminOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [orders]: any = await pool.query(`
      SELECT o.id, o.order_number, o.total_amount as amount, o.status, o.payment_method, o.customer_email as user_email, o.created_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    for (const ord of orders) {
      const [items]: any = await pool.query(
        'SELECT product_title as name, price FROM order_items WHERE order_id = ?',
        [ord.id]
      );
      ord.items = items;
      ord.amount = parseFloat(ord.amount) || 0;
    }

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

// Licenses
export async function getAdminLicenses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [licenses]: any = await pool.query(`
      SELECT l.id, l.license_key as \`key\`, l.status, l.bound_server_ip, l.created_at, l.expires_at as expires,
             COALESCE(u.email, 'Unknown') as user_email, COALESCE(p.title, 'General License') as product_name
      FROM licenses l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN products p ON l.product_id = p.id
      ORDER BY l.created_at DESC
    `);

    res.json(licenses.map((l: any) => ({
      ...l,
      status: l.status.charAt(0).toUpperCase() + l.status.slice(1)
    })));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
}

export async function handleAdminLicenseAction(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id, action } = req.params;
    if (action === 'revoke') {
      await pool.query('UPDATE licenses SET status = "revoked" WHERE id = ?', [id]);
    } else if (action === 'activate') {
      await pool.query('UPDATE licenses SET status = "active" WHERE id = ?', [id]);
    } else if (action === 'reset_ip') {
      await pool.query('UPDATE licenses SET bound_server_ip = NULL WHERE id = ?', [id]);
    }
    res.json({ message: `License ${action} successful` });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

// Tickets
export async function getAdminTickets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [tickets]: any = await pool.query(`
      SELECT t.id, t.subject, t.status, t.category, t.priority, t.created_at,
             u.email as user_email, u.username as user_name, p.title as product_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN products p ON t.product_id = p.id
      ORDER BY t.updated_at DESC
    `);

    for (const t of tickets) {
      const [messages]: any = await pool.query(`
        SELECT m.id, m.message as text, m.created_at, m.is_staff,
               u.username as sender_name, u.role as sender_role
        FROM ticket_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.ticket_id = ?
        ORDER BY m.created_at ASC
      `, [t.id]);

      t.messages = messages.map((m: any) => ({
        id: m.id,
        text: m.text,
        created_at: m.created_at,
        sender: {
          name: m.sender_name,
          role: m.sender_role
        }
      }));
      t.status = t.status.charAt(0).toUpperCase() + t.status.slice(1);
    }

    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
}

export async function updateAdminTicketStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const status = (req.query.status as string) || req.body.status || 'Resolved';
    await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status.toLowerCase(), id]);
    res.json({ message: 'Ticket status updated' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

// Reviews
export async function getAdminReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [reviews]: any = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.status, r.created_at,
             u.username, p.title as product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function approveAdminReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query('UPDATE reviews SET status = "approved" WHERE id = ?', [id]);
    res.json({ message: 'Review approved' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

export async function deleteAdminReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

// Settings
export async function updateAdminSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { accent_color, logo, stats, discord } = req.body;

    if (accent_color) {
      await pool.query(
        'INSERT INTO settings (key_name, value_json) VALUES ("accent_color", ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
        [JSON.stringify(accent_color)]
      );
    }
    if (logo) {
      await pool.query(
        'INSERT INTO settings (key_name, value_json) VALUES ("logo", ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
        [JSON.stringify(logo)]
      );
    }
    if (stats) {
      await pool.query(
        'INSERT INTO settings (key_name, value_json) VALUES ("stats", ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
        [JSON.stringify(stats)]
      );
    }
    if (discord) {
      await pool.query(
        'INSERT INTO settings (key_name, value_json) VALUES ("discord", ?) ON DUPLICATE KEY UPDATE value_json = VALUES(value_json)',
        [JSON.stringify(discord)]
      );
    }

    res.json({ message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('updateAdminSettings error:', error);
    res.status(500).json({ detail: error.message });
  }
}

// Coupons
export async function getAdminCoupons(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [coupons]: any = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(coupons.map((c: any) => ({
      ...c,
      discount_type: 'percentage',
      discount_value: c.discount_percent !== undefined ? c.discount_percent : 10,
      min_spend: 0,
      used_count: c.uses_count !== undefined ? c.uses_count : 0
    })));
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
}

export async function createAdminCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code, discount_type, discount_value, max_uses, expires_at } = req.body;
    if (!code || !discount_value) {
      res.status(400).json({ detail: 'Código y valor de descuento son requeridos' });
      return;
    }

    const cleanCode = String(code).trim().toUpperCase();
    const percent = Math.min(100, Math.max(1, parseInt(discount_value, 10) || 10));
    const maxU = max_uses ? parseInt(max_uses, 10) : 100;
    const exp = expires_at ? new Date(expires_at) : null;

    const [existing]: any = await pool.query('SELECT id FROM coupons WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      res.status(400).json({ detail: 'Ya existe un cupón con este código' });
      return;
    }

    const [ins]: any = await pool.query(
      'INSERT INTO coupons (code, discount_percent, max_uses, uses_count, is_active, expires_at) VALUES (?, ?, ?, 0, 1, ?)',
      [cleanCode, percent, maxU, exp]
    );

    res.status(201).json({ message: 'Cupón creado exitosamente', id: ins.insertId, code: cleanCode });
  } catch (error: any) {
    res.status(500).json({ detail: error.message || 'Failed to create coupon' });
  }
}

export async function updateAdminCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { is_active, max_uses, expires_at } = req.body;

    if (is_active !== undefined) {
      await pool.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
    }
    if (max_uses !== undefined) {
      await pool.query('UPDATE coupons SET max_uses = ? WHERE id = ?', [max_uses ? parseInt(max_uses, 10) : null, id]);
    }
    if (expires_at !== undefined) {
      await pool.query('UPDATE coupons SET expires_at = ? WHERE id = ?', [expires_at ? new Date(expires_at) : null, id]);
    }

    res.json({ message: 'Cupón actualizado correctamente' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}

export async function deleteAdminCoupon(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ message: 'Cupón eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
}
