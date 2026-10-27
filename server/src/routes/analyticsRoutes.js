import express from 'express';
import {
  getOverview,
  getLeadsOverTime,
  getLeadsByStatus,
  getLeadsBySource,
  getRecentLeads
} from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/overview', getOverview);
router.get('/leads-over-time', getLeadsOverTime);
router.get('/leads-by-status', getLeadsByStatus);
router.get('/leads-by-source', getLeadsBySource);
router.get('/recent-leads', getRecentLeads);

export default router;
