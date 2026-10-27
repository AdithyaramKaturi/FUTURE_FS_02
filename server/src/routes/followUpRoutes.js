import express from 'express';
import {
  getFollowUps,
  updateFollowUp,
  deleteFollowUp
} from '../controllers/followUpController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  followUpQueryValidator,
  updateFollowUpValidator
} from '../validators/followUpValidators.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', followUpQueryValidator, validate, getFollowUps);
router.patch('/:id', updateFollowUpValidator, validate, updateFollowUp);
router.delete('/:id', deleteFollowUp);

export default router;
