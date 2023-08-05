import { Router } from 'express';
import {
  validateCreateMailLabel,
  validateUpdateMailLabel
} from '../../middleware/validation/mailLabels';
import { createMailLabel, updateMailLabel } from '../../controllers/mailLabels';
import { verifyToken } from '../../middleware/verifyToken';

const router = Router();

router
  .post('/', validateCreateMailLabel, verifyToken, createMailLabel)
  .delete('/:id', validateUpdateMailLabel, verifyToken, updateMailLabel);

export default router;
