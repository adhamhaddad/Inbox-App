import { Router } from 'express';
import { validateCreateMailFolder } from '../../middleware/validation/mailFolders';
import { updateMailFolder } from '../../controllers/mailFolders';
import { verifyToken, expressFilterRequest } from '../../middleware';

const allowedKeys = {
  patch: ['mail_ids', 'folder']
};

const router = Router();

router.patch(
  '/',
  validateCreateMailFolder,
  verifyToken,
  expressFilterRequest(allowedKeys),
  updateMailFolder
);

export default router;
