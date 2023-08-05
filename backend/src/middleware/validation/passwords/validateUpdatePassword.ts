import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateUpdatePassword = [
  body('current_password')
    .exists()
    .withMessage('Current password is missing from the body')
    .notEmpty()
    .withMessage('Current password is empty')
    .isLength({ min: 8 })
    .withMessage('Current password must be at least 8 characters long'),
  body('new_password')
    .exists()
    .withMessage('New password is missing from the body')
    .notEmpty()
    .withMessage('New password is empty')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
