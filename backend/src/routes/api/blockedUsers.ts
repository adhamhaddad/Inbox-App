import { Router } from 'express';
import {
  validateCreateBlockedUser,
  validateGetBlockedUser,
  validateDeleteBlockedUser
} from '../../middleware/validation/blockedUsers';
import {
  createBlockedContact,
  getBlockContacts,
  deleteBlockContact
} from '../../controllers/blockedUsers';
import { verifyToken } from '../../middleware';

const router = Router();

router
  .post('/', validateCreateBlockedUser, verifyToken, createBlockedContact)
  .get('/:user_id', validateGetBlockedUser, verifyToken, getBlockContacts)
  .delete('/:id', validateDeleteBlockedUser, verifyToken, deleteBlockContact);

export default router;
