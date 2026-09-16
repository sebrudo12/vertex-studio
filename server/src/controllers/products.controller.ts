import { Request, Response } from 'express';
import { pool } from '../config/db';

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const [rows]: any = await pool.query('SELECT * FROM products WHERE status = "active" ORDER BY featured DESC, id ASC');

    const products = rows.map((p: any) => ({
      id: p.id,
      name: p.title,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      description: p.description,
      price: parseFloat(p.price) || 0,
      category: p.category,
      frameworks: typeof p.frameworks === 'string' ? JSON.parse(p.frameworks || '[]') : (p.frameworks || []),
      version: p.version,
      status: 'Available',
      featured: Boolean(p.featured),
      image: p.thumbnail,
      thumbnail: p.thumbnail,
      gallery: typeof p.gallery === 'string' ? JSON.parse(p.gallery || '[]') : (p.gallery || []),
      dependencies: typeof p.dependencies === 'string' ? JSON.parse(p.dependencies || '[]') : (p.dependencies || []),
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
      last_updated: p.updated_at || p.created_at,
      download_filename: p.download_filename
    }));

    res.json(products);
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const [rows]: any = await pool.query('SELECT * FROM products WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const p = rows[0];
    const [reviews]: any = await pool.query(
      `SELECT r.*, u.username, u.avatar_url 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? AND r.status = 'approved' 
       ORDER BY r.created_at DESC`,
      [p.id]
    );

    const product = {
      id: p.id,
      name: p.title,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description,
      description: p.description,
      price: parseFloat(p.price) || 0,
      category: p.category,
      frameworks: typeof p.frameworks === 'string' ? JSON.parse(p.frameworks || '[]') : (p.frameworks || []),
      version: p.version,
      status: 'Available',
      featured: Boolean(p.featured),
      image: p.thumbnail,
      thumbnail: p.thumbnail,
      gallery: typeof p.gallery === 'string' ? JSON.parse(p.gallery || '[]') : (p.gallery || []),
      dependencies: typeof p.dependencies === 'string' ? JSON.parse(p.dependencies || '[]') : (p.dependencies || []),
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
      last_updated: p.updated_at || p.created_at,
      reviews: reviews.map((r: any) => ({
        id: r.id,
        username: r.username,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at
      }))
    };

    res.json(product);
  } catch (error: any) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
}

export async function getProductDocs(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const [pRows]: any = await pool.query('SELECT id, title, slug FROM products WHERE slug = ?', [slug]);
    if (pRows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const product = pRows[0];
    const [docs]: any = await pool.query('SELECT * FROM product_docs WHERE product_id = ? ORDER BY order_index ASC', [product.id]);
    res.json({ product, sections: docs });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch documentation' });
  }
}
