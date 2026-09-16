import { Router } from 'express';
import { getTickets, createTicket, addMessage } from '../controllers/tickets.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', getTickets);
router.post('/', createTicket);
router.post('/:id/messages', addMessage);

export default router;
