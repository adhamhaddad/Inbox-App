import { Router } from 'express';
import {
  validateCreateMail,
  validateGetMail,
  validateUpdateMail,
  validateDeleteMail
} from '../../middleware/validation/mails';
import {
  createMail,
  getMails,
  updateMail,
  deleteMail
} from '../../controllers/mails';
import { verifyToken, expressFilterRequest } from '../../middleware';
import { checkFolder } from '../../utils/checkUpload';
import { mailAttachments } from '../../utils/multer';

const allowedKeys = {
  post: ['to', 'cc', 'bcc', 'subject', 'message', 'attachments']
};

const router = Router();

router
  .post(
    '/',
    verifyToken,
    checkFolder,
    mailAttachments,
    validateCreateMail,
    expressFilterRequest(allowedKeys),
    createMail
  )
  .get('/', verifyToken, getMails)
  .get('/:id', validateGetMail, verifyToken, getMails)
  .patch('/:id', validateUpdateMail, verifyToken, updateMail)
  .delete('/:id', validateDeleteMail, verifyToken, deleteMail);

export default router;
