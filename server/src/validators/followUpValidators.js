import { body, query } from 'express-validator';

export const createFollowUpValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Follow-up description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('scheduledAt')
    .notEmpty()
    .withMessage('Scheduled date and time is required')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date string')
];

export const updateFollowUpValidator = [
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO8601 date string'),
  body('status')
    .optional()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be either pending or completed')
];

export const followUpQueryValidator = [
  query('status')
    .optional()
    .isIn(['all', 'pending', 'completed'])
    .withMessage('Status must be all, pending, or completed'),
  query('timeframe')
    .optional()
    .isIn(['all', 'overdue', 'today', 'upcoming'])
    .withMessage('Timeframe must be all, overdue, today, or upcoming'),
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
];
