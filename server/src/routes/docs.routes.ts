import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET /api/docs
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [products]: any = await pool.query('SELECT id, title, slug FROM products ORDER BY id ASC');
    const result: any[] = [];

    for (const p of products) {
      const [docs]: any = await pool.query(
        'SELECT section_title, content_markdown FROM product_docs WHERE product_id = ? ORDER BY order_index ASC',
        [p.id]
      );

      const sections: Record<string, string> = {};
      if (docs.length === 0) {
        sections['Installation'] = `### ${p.title} Installation\n\n1. Download the archive from your Vertex Studio Dashboard.\n2. Extract into your server resources folder: \`resources/[vertex]/${p.slug}\`.\n3. Add \`ensure ${p.slug}\` to your \`server.cfg\`.\n4. Restart server and enjoy!`;
        sections['Configuration'] = `### Configuration\n\nEdit \`config.lua\` to customize frameworks, permissions, notifications, and language.`;
      } else {
        for (const d of docs) {
          sections[d.section_title] = d.content_markdown;
        }
      }

      result.push({
        id: String(p.id),
        product: p.title,
        sections
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error('docs error:', error);
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
});

export default router;
