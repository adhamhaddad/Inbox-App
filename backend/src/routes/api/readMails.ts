import { Router } from 'express';
import {
  validateCreateReadMail,
  validateUpdateReadMail
} from '../../middleware/validation/readMails';
import { createReadMail, updateReadMail } from '../../controllers/readMails';
import { verifyToken } from '../../middleware';

const router = Router();

router
  .post('/', validateCreateReadMail, verifyToken, createReadMail)
  .patch('/:id', validateUpdateReadMail, verifyToken, updateReadMail);

export default router;
