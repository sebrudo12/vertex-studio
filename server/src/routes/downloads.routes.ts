import { Router } from 'express';
import {
  downloadEscrowPackage,
  downloadProductFile,
  getMyDownloads
} from '../controllers/downloads.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dedicated Keymaster escrow download
router.get('/escrow/:licenseId', authenticateToken, downloadEscrowPackage);

// Product download by ID
router.get('/file/:productId', authenticateToken, downloadProductFile);
router.get('/:productId', authenticateToken, downloadProductFile);

// User downloads audit
router.get('/history/me', authenticateToken, getMyDownloads);

export default router;
