import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateCreatePhone = [
  body('phone')
    .exists()
    .withMessage('Phone number is missing from the body')
    .notEmpty()
    .withMessage('Phone number is empty')
    .custom((value: string) => {
      // verify phone number format E.164
      if (!value.match(/^\+[1-9]\d{1,14}$/)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    })
    .withMessage('Phone number is not valid'),
  body('user_id')
    .exists()
    .withMessage('user_id is missing from the body')
    .notEmpty()
    .withMessage('user_id is empty')
    .isNumeric()
    .withMessage('user_id must be number'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
