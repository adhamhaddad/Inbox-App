import { Router } from 'express';
import {
  validateGetUser,
  validateGetUserByEmail,
  validateUpdateUser,
  validateDeleteUser
} from '../../middleware/validation/users';
import {
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser
} from '../../controllers/users';
import { verifyToken, expressFilterRequest } from '../../middleware';

const allowedKeys = {
  post: ['email'],
  patch: ['first_name', 'last_name', 'email']
};

const router = Router();

router
  .post(
    '/',
    validateGetUserByEmail,
    verifyToken,
    expressFilterRequest(allowedKeys),
    getUserByEmail
  )
  .get('/:username', validateGetUser, verifyToken, getUser)
  .patch(
    '/:id',
    validateUpdateUser,
    verifyToken,
    expressFilterRequest(allowedKeys),
    updateUser
  )
  .delete('/:id', validateDeleteUser, verifyToken, deleteUser);

export default router;
