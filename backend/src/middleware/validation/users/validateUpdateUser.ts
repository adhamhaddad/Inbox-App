import { Request, Response, NextFunction } from 'express';
import { check, body } from 'express-validator';
import { validate } from '../validationResult';

export const validateUpdateUser = [
  check('id')
    .exists()
    .withMessage('id is missing from the parameters')
    .notEmpty()
    .withMessage('id is empty'),
  body('first_name')
    .exists()
    .withMessage('First name is missing from the body.')
    .notEmpty()
    .withMessage('First name is empty')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be at least 2 and maximum 50 letters'),
  body('last_name')
    .exists()
    .withMessage('Last name is missing from the body.')
    .notEmpty()
    .withMessage('Last name is empty')
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be at least 2 and maximum 50 letters'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
