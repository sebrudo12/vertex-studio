import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reviews
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT r.*, u.username, u.avatar_url, p.title as product_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.status = 'approved'
      ORDER BY r.created_at DESC
    `);

    const result = rows.map((r: any) => ({
      id: r.id,
      product: r.product_name,
      product_id: r.product_id,
      username: r.username,
      avatar: r.avatar_url,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
