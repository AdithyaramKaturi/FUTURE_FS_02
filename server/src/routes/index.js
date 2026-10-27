import express from 'express';
import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import leadRoutes from './leadRoutes.js';
import followUpRoutes from './followUpRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import seedRoutes from './seedRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LeadFlow CRM API'
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/leads', leadRoutes);
router.use('/follow-ups', followUpRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/seed', seedRoutes);

export default router;
