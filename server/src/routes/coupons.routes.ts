import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// POST /api/coupons/validate
router.post('/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ detail: 'El código de cupón es requerido' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const [rows]: any = await pool.query(
      'SELECT * FROM coupons WHERE UPPER(code) = ?',
      [cleanCode]
    );

    if (rows.length === 0) {
      res.status(404).json({ detail: 'Cupón no válido o no encontrado' });
      return;
    }

    const coupon = rows[0];

    if (!coupon.is_active) {
      res.status(400).json({ detail: 'Este cupón está actualmente desactivado' });
      return;
    }

    if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
      res.status(400).json({ detail: 'Este cupón ha expirado' });
      return;
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      res.status(400).json({ detail: 'Este cupón ha alcanzado el límite máximo de usos' });
      return;
    }

    const numSubtotal = parseFloat(subtotal) || 0;
    const minSpend = parseFloat(coupon.min_spend) || 0;
    if (numSubtotal < minSpend) {
      res.status(400).json({
        detail: `El pedido mínimo para aplicar este cupón es de €${minSpend.toFixed(2)}`
      });
      return;
    }

    let discountAmount = 0;
    const discountVal = parseFloat(coupon.discount_value);

    if (coupon.discount_type === 'percentage') {
      discountAmount = (numSubtotal * discountVal) / 100;
    } else {
      discountAmount = discountVal;
    }

    discountAmount = Math.min(discountAmount, numSubtotal);
    const newTotal = Math.max(0, numSubtotal - discountAmount);

    res.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: discountVal,
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      new_total: parseFloat(newTotal.toFixed(2))
    });
  } catch (error: any) {
    console.error('Coupon validate error:', error);
    res.status(500).json({ detail: 'Error al validar cupón' });
  }
});

export default router;
