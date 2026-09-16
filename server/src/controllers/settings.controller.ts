import { Request, Response } from 'express';
import { pool } from '../config/db';

export async function getPublicSettings(req: Request, res: Response): Promise<void> {
  try {
    const [rows]: any = await pool.query(
      'SELECT key_name, value_json FROM settings WHERE key_name IN ("site_stats", "discord_widget", "theme_settings")'
    );

    const settings: Record<string, any> = {};
    for (const r of rows) {
      settings[r.key_name] = typeof r.value_json === 'string' ? JSON.parse(r.value_json) : r.value_json;
    }

    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}
