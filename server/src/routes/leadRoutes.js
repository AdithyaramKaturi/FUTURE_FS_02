import express from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead
} from '../controllers/leadController.js';
import { getLeadNotes, createLeadNote } from '../controllers/noteController.js';
import { createLeadFollowUp } from '../controllers/followUpController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminCreateLeadValidator,
  updateLeadValidator,
  updateStatusValidator,
  leadQueryValidator
} from '../validators/leadValidators.js';
import { createNoteValidator } from '../validators/noteValidators.js';
import { createFollowUpValidator } from '../validators/followUpValidators.js';

const router = express.Router();

// All lead routes require authentication
router.use(requireAuth);

// Core CRUD
router.get('/', leadQueryValidator, validate, getLeads);
router.post('/', adminCreateLeadValidator, validate, createLead);
router.get('/:id', getLeadById);
router.patch('/:id', updateLeadValidator, validate, updateLead);
router.patch('/:id/status', updateStatusValidator, validate, updateLeadStatus);
router.delete('/:id', deleteLead);

// Lead Notes Sub-routes
router.get('/:id/notes', getLeadNotes);
router.post('/:id/notes', createNoteValidator, validate, createLeadNote);

// Lead Follow-Up Sub-route
router.post('/:id/follow-ups', createFollowUpValidator, validate, createLeadFollowUp);

export default router;
