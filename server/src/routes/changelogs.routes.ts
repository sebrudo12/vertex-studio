import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET /api/changelogs
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT c.id, c.version, c.release_date, c.content_json, p.title as product_title
      FROM changelogs c
      JOIN products p ON c.product_id = p.id
      ORDER BY c.release_date DESC
    `);

    const result = rows.map((r: any) => {
      const content = typeof r.content_json === 'string' ? JSON.parse(r.content_json || '{}') : (r.content_json || {});
      return {
        id: String(r.id),
        product: r.product_title,
        version: r.version,
        date: r.release_date,
        added: content.added || [],
        fixed: content.fixed || [],
        improved: content.improved || []
      };
    });

    res.json(result);
  } catch (error: any) {
    console.error('changelogs error:', error);
    res.status(500).json({ error: 'Failed to fetch changelogs' });
  }
});

export default router;
