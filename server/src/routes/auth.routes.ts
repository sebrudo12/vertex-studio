import { Router } from 'express';
import {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  getDiscordAuthUrl,
  discordCallback
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

// Discord OAuth2
router.get('/discord/login', getDiscordAuthUrl);
router.get('/discord/url', getDiscordAuthUrl);
router.get('/discord/callback', discordCallback);
router.post('/discord/callback', discordCallback);

export default router;
