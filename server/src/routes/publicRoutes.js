import express from 'express';
import { submitPublicInquiry } from '../controllers/publicController.js';
import { publicLeadLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { publicLeadValidator } from '../validators/leadValidators.js';

const router = express.Router();

/**
 * Public Contact Form Submission Endpoint
 * POST /api/public/leads
 */
router.post(
  '/leads',
  publicLeadLimiter,
  publicLeadValidator,
  validate,
  submitPublicInquiry
);

export default router;
