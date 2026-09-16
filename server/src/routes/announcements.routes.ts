import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET /api/announcements
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM announcements WHERE is_active = TRUE ORDER BY published_at DESC LIMIT 10');
    const result = rows.map((a: any) => ({
      id: String(a.id),
      title: a.title,
      body: a.content,
      link: a.link_url,
      date: a.published_at
    }));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

export default router;
