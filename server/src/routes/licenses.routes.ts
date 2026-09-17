import { Router } from 'express';
import {
  getMyLicenses,
  updateServerIp,
  regenerateKey,
  transferLicenseController,
  verifyLicenseFiveM
} from '../controllers/licenses.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/my-licenses', authenticateToken, getMyLicenses);
router.put('/:id/server-ip', authenticateToken, updateServerIp);
router.post('/:id/regenerate', authenticateToken, regenerateKey);
router.post('/:id/transfer', authenticateToken, transferLicenseController);
router.post('/verify', verifyLicenseFiveM); // Public endpoint for FiveM Lua scripts

export default router;
