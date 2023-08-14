import { Router } from 'express';
import { validateUpdateMailLabel } from '../../middleware/validation/mailLabels';
import { updateMailLabel } from '../../controllers/mailLabels';
import { verifyToken, expressFilterRequest } from '../../middleware';

const allowedKeys = {
  patch: ['mail_ids', 'label']
};

const router = Router();

router.patch(
  '/',
  validateUpdateMailLabel,
  verifyToken,
  expressFilterRequest(allowedKeys),
  updateMailLabel
);

export default router;
