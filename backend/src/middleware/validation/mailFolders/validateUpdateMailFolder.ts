import { Request, Response, NextFunction } from 'express';
import { check, body } from 'express-validator';
import { validate } from '../validationResult';

const validFolders = ['INBOX', 'SENT', 'SPAM', 'DRAFT', 'TRASH'];

export const validateCreateMailFolder = [
  body('mail_ids')
    .exists()
    .withMessage('mail_ids is missing from the body')
    .notEmpty()
    .withMessage('mail_ids is empty')
    .isArray()
    .withMessage('label must be an array'),
  body('folder')
    .exists()
    .withMessage('folder is missing from the body')
    .notEmpty()
    .withMessage('folder is empty')
    .isString()
    .withMessage('folder must be a string')
    .isIn(validFolders)
    .withMessage(
      `Invalid folder. Valid folders are: ${validFolders.join(', ')}`
    ),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
