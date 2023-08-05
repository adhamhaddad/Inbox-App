import { Router } from 'express';
import {
  validateCreatePhone,
  validateUpdatePhone,
  validateDeletePhone
} from '../../middleware/validation/phones';
import {
  createPhone,
  getPhones,
  updatePhone,
  deletePhone
} from '../../controllers/phones';
import { verifyToken, expressFilterRequest } from '../../middleware';

const allowedKeys = {
  post: ['phone'],
  patch: ['phone']
};

const router = Router();

router
  .post(
    '/',
    validateCreatePhone,
    verifyToken,
    expressFilterRequest(allowedKeys),
    createPhone
  )
  .get('/', verifyToken, getPhones)
  .patch(
    '/:id',
    validateUpdatePhone,
    verifyToken,
    expressFilterRequest(allowedKeys),
    updatePhone
  )
  .delete('/:id', validateDeletePhone, verifyToken, deletePhone);

export default router;
