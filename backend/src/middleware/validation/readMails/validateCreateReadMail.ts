import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateCreateReadMail = [
  body('mail_id')
    .exists()
    .withMessage('mail_id is missing from the body')
    .notEmpty()
    .withMessage('mail_id is empty')
    .isNumeric()
    .withMessage('mail_id must be a number'),
  body('user_id')
    .exists()
    .withMessage('user_id is missing from the body')
    .notEmpty()
    .withMessage('user_id is empty')
    .isNumeric()
    .withMessage('user_id must be a number'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
