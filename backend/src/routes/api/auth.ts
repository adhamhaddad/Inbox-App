import { Router } from 'express';
import {
  validateRegister,
  validateLogin,
  validateUpdatePassword
} from '../../middleware/validation/auth';
import {
  createUser,
  authUser,
  authMe,
  updatePassword
} from '../../controllers/auth';
import { verifyToken, expressFilterRequest } from '../../middleware';

const router = Router();

const allowedKeys = {
  post: ['first_name', 'last_name', 'email', 'password'],
  login: ['email', 'password'],
  patch: ['current_password', 'new_password']
};

router
  .post(
    '/register',
    validateRegister,
    expressFilterRequest(allowedKeys),
    createUser
  )
  .post('/login', validateLogin, expressFilterRequest(allowedKeys), authUser)
  .patch(
    '/reset-password',
    validateUpdatePassword,
    verifyToken,
    expressFilterRequest(allowedKeys),
    updatePassword
  )
  .get('/auth-me', authMe);

export default router;
