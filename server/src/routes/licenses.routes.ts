import { Router } from 'express';
import { getMyLicenses, updateServerIp, verifyLicenseFiveM } from '../controllers/licenses.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/my-licenses', authenticateToken, getMyLicenses);
router.put('/:id/server-ip', authenticateToken, updateServerIp);
router.post('/verify', verifyLicenseFiveM); // Public endpoint for FiveM Lua scripts

export default router;
