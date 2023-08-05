import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validate } from '../validationResult';

export const validateCreateUser = [
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
  body('email')
    .exists()
    .withMessage('Email is missing from the body')
    .notEmpty()
    .withMessage('Email is empty')
    .isEmail()
    .withMessage('Email is not valid')
    .normalizeEmail()
    .withMessage('Email is not normalized'),
  body('password')
    .exists()
    .withMessage('Password is missing from the body')
    .notEmpty()
    .withMessage('Password is empty')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  (req: Request, res: Response, next: NextFunction) => validate(req, res, next)
];
