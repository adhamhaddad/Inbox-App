import { Router } from 'express';
import {
  validateCreateReadMail,
  validateUpdateReadMail
} from '../../middleware/validation/readMails';
import { createReadMail, updateReadMail } from '../../controllers/readMails';
import { verifyToken, expressFilterRequest } from '../../middleware';

const allowedKeys = {
  post: ['mail_id'],
  patch: []
};

const router = Router();

router
  .post(
    '/',
    validateCreateReadMail,
    verifyToken,
    expressFilterRequest(allowedKeys),
    createReadMail
  )
  .patch(
    '/:mail_id',
    validateUpdateReadMail,
    verifyToken,
    expressFilterRequest(allowedKeys),
    updateReadMail
  );

export default router;
