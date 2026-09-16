import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// GET /api/settings
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM settings');
    const dbSettings: Record<string, any> = {};
    for (const r of rows) {
      dbSettings[r.key_name] = typeof r.value_json === 'string' ? JSON.parse(r.value_json) : r.value_json;
    }

    const payload = {
      id: 'global',
      accent_color: dbSettings.accent_color || dbSettings.theme_settings?.accent_color || '#FFFFFF',
      logo: dbSettings.logo || '/logo.png',
      stats: dbSettings.stats || dbSettings.site_stats || {
        resources: '51+',
        customers: '1,000+',
        feedback: '99%',
        support: '24/7'
      },
      discord: dbSettings.discord || dbSettings.discord_widget || {
        name: 'Vertex Studio',
        members: 4200,
        online: 380,
        invite: 'https://discord.gg/vertexstudio'
      }
    };

    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
