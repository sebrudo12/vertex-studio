import { Router } from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/orders.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/checkout', authenticateToken, checkout);
router.get('/my-orders', authenticateToken, getMyOrders);
router.get('/:id', authenticateToken, getOrderById);

export default router;
