import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Lead } from '../models/Lead.js';
import { Note } from '../models/Note.js';
import { FollowUp } from '../models/FollowUp.js';
import { seedDemoDatabase } from '../utils/seedHelper.js';

const router = express.Router();

/**
 * Clear all leads, notes, and follow-ups
 * POST /api/seed/clear
 */
router.post('/clear', requireAuth, async (req, res, next) => {
  try {
    const [leads, notes, followUps] = await Promise.all([
      Lead.deleteMany({}),
      Note.deleteMany({}),
      FollowUp.deleteMany({})
    ]);

    res.status(200).json({
      success: true,
      message: `Database cleaned: removed ${leads.deletedCount} leads, ${notes.deletedCount} notes, and ${followUps.deletedCount} follow-ups.`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Optional demo database seeder
 * POST /api/seed/demo
 */
router.post('/demo', requireAuth, async (req, res, next) => {
  try {
    const result = await seedDemoDatabase(req.admin);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
});

export default router;
