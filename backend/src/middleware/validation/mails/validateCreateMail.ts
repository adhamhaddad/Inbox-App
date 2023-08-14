import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateCreateMail = [
  body('to').exists().withMessage('To is missing from the body'),
  body('cc').exists().withMessage('CC is missing from the body'),
  body('bcc').exists().withMessage('BCC is missing from the body'),
  body('subject')
    .exists()
    .withMessage('Subject is missing from the body')
    .notEmpty()
    .withMessage('Subject is empty')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Subject must be at least 1 letters'),
  body('message')
    .exists()
    .withMessage('Message is missing from the body')
    .notEmpty()
    .withMessage('Message is empty')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Message must be at least 1 letters'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
