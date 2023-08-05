import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateDeleteStarredMail = [
  body('mail_id')
    .exists()
    .withMessage('mail_id is missing from the body')
    .notEmpty()
    .withMessage('mail_id is empty')
    .isNumeric()
    .withMessage('mail_id must be a number'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
