import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

const validLabels = ['PERSONAL', 'PRIVATE', 'COMPANY', 'IMPORTANT'];

export const validateUpdateMailLabel = [
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
