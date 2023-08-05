import { Router } from 'express';
import {
  validateCreateStarredMail,
  validateDeleteStarredMail
} from '../../middleware/validation/starredMails';
import {
  createStarredMail,
  deleteStarredMail
} from '../../controllers/starredMails';
import { verifyToken } from '../../middleware';

const router = Router();

router
  .post('/', validateCreateStarredMail, verifyToken, createStarredMail)
  .delete('/:id', validateDeleteStarredMail, verifyToken, deleteStarredMail);

export default router;
