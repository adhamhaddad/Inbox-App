import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

const validLabels = ['PERSONAL', 'PRIVATE', 'COMPANY', 'IMPORTANT'];

export const validateUpdateMailLabel = [
  body('mail_ids')
    .exists()
    .withMessage('mail_ids is missing from the body')
    .notEmpty()
    .withMessage('mail_ids is empty')
    .isArray()
    .withMessage('label must be an array'),
  body('label')
    .exists()
    .withMessage('label is missing from the body')
    .notEmpty()
    .withMessage('label is empty')
    .isString()
    .withMessage('label must be a string')
    .isIn(validLabels)
    .withMessage(`Invalid label. Valid labels are: ${validLabels.join(', ')}`),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
