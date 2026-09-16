import { Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getTickets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    let query = `
      SELECT t.*, u.username, u.email, u.avatar_url, p.title as product_title
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN products p ON t.product_id = p.id
    `;
    const params: any[] = [];
    if (!isAdmin) {
      query += ' WHERE t.user_id = ?';
      params.push(userId);
    }
    query += ' ORDER BY t.updated_at DESC';

    const [tickets]: any = await pool.query(query, params);

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
      t.product = t.product_title || 'General';
      t.status = t.status.charAt(0).toUpperCase() + t.status.slice(1);
    }

    res.json(tickets);
  } catch (error: any) {
    console.error('getTickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
}

export async function createTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { subject, category, product, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ detail: 'Subject and message are required' });
      return;
    }

    let productId = null;
    if (product) {
      const [prods]: any = await pool.query('SELECT id FROM products WHERE title = ? OR slug = ? LIMIT 1', [product, product]);
      if (prods.length > 0) productId = prods[0].id;
    }

    const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const [resTicket]: any = await pool.query(
      `INSERT INTO tickets (ticket_number, user_id, product_id, subject, category, status, priority)
       VALUES (?, ?, ?, ?, ?, 'open', 'normal')`,
      [ticketNumber, userId, productId, subject, category || 'General']
    );

    const ticketId = resTicket.insertId;
    await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_staff) VALUES (?, ?, ?, FALSE)',
      [ticketId, userId, message]
    );

    res.status(201).json({ id: ticketId, message: 'Ticket created successfully' });
  } catch (error: any) {
    console.error('createTicket error:', error);
    res.status(500).json({ detail: 'Failed to create ticket' });
  }
}

export async function addMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const isStaff = req.user?.role === 'admin';
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      res.status(400).json({ detail: 'Message cannot be empty' });
      return;
    }

    await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message, is_staff) VALUES (?, ?, ?, ?)',
      [id, userId, message.trim(), isStaff]
    );

    const newStatus = isStaff ? 'pending' : 'open';
    await pool.query('UPDATE tickets SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);

    res.json({ message: 'Message sent successfully' });
  } catch (error: any) {
    console.error('addMessage error:', error);
    res.status(500).json({ detail: 'Failed to send message' });
  }
}
