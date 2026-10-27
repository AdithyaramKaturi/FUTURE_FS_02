import { body } from 'express-validator';

export const createNoteValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Note content cannot be empty')
    .isLength({ max: 3000 })
    .withMessage('Note content cannot exceed 3000 characters')
];
