import { Request, Response, NextFunction } from 'express';
import { check } from 'express-validator';
import { validate } from '../validationResult';

export const validateUpdateReadMail = [
  check('mail_id')
    .exists()
    .withMessage('mail_id is missing from the parameters')
    .notEmpty()
    .withMessage('mail_id is empty'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
