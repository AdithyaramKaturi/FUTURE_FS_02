import { body, param, query } from 'express-validator';
import { LEAD_STATUSES, LEAD_SOURCES, SERVICES_INTERESTED } from '../models/Lead.js';

export const publicLeadValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Your name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone cannot exceed 30 characters'),
  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Company cannot exceed 120 characters'),
  body('serviceInterested')
    .optional({ checkFalsy: true })
    .isIn(SERVICES_INTERESTED)
    .withMessage(`Service must be one of: ${SERVICES_INTERESTED.join(', ')}`),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Project details or message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

export const adminCreateLeadValidator = [
  ...publicLeadValidator,
  body('source')
    .optional()
    .isIn(LEAD_SOURCES)
    .withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('status')
    .optional()
    .isIn(LEAD_STATUSES)
    .withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deal value must be a positive number')
];

export const updateLeadValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone cannot exceed 30 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Company cannot exceed 120 characters'),
  body('serviceInterested')
    .optional()
    .isIn(SERVICES_INTERESTED)
    .withMessage(`Service must be one of: ${SERVICES_INTERESTED.join(', ')}`),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  body('source')
    .optional()
    .isIn(LEAD_SOURCES)
    .withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
  body('status')
    .optional()
    .isIn(LEAD_STATUSES)
    .withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number')
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(LEAD_STATUSES)
    .withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`)
];

export const leadQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .custom((val) => {
      if (val === 'all') return true;
      return LEAD_STATUSES.includes(val);
    })
    .withMessage(`Status must be one of: all, ${LEAD_STATUSES.join(', ')}`),
  query('source')
    .optional()
    .custom((val) => {
      if (val === 'all') return true;
      return LEAD_SOURCES.includes(val);
    })
    .withMessage(`Source must be one of: all, ${LEAD_SOURCES.join(', ')}`),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'name', 'status', 'value', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];
