import { Request, Response } from 'express';
import { pool } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.query;

    let query = `
      SELECT r.*, u.username, u.avatar_url, u.discord_tag, p.title as product_title, p.slug as product_slug
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.status = 'approved'
    `;
    const params: any[] = [];

    if (productId) {
      query += ' AND r.product_id = ?';
      params.push(productId);
    }

    query += ' ORDER BY r.created_at DESC';

    const [reviews]: any = await pool.query(query, params);
    res.json({ reviews });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

export async function createReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ error: 'Product ID, rating (1-5), and comment are required' });
      return;
    }

    // Check if user bought product
    const [orders]: any = await pool.query(
      `SELECT oi.id 
       FROM order_items oi 
       JOIN orders o ON oi.order_id = o.id 
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'completed'`,
      [userId, productId]
    );

    if (orders.length === 0 && req.user?.role !== 'admin') {
      res.status(403).json({ error: 'You can only review products you have purchased' });
      return;
    }

    await pool.query(
      'INSERT INTO reviews (user_id, product_id, rating, comment, status) VALUES (?, ?, ?, ?, "approved")',
      [userId, productId, Math.max(1, Math.min(5, parseInt(rating, 10))), comment.trim()]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

export async function updateReviewStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Review status updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update review' });
  }
}

export async function deleteReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
}
