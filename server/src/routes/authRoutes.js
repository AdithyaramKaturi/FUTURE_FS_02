import express from 'express';
import {
  login,
  logout,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  loginValidator,
  profileValidator,
  changePasswordValidator
} from '../validators/authValidators.js';

const router = express.Router();

// Public auth routes (rate limited)
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/logout', logout);

// Protected auth routes
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, profileValidator, validate, updateProfile);
router.put('/change-password', requireAuth, changePasswordValidator, validate, changePassword);

export default router;
