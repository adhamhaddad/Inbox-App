import { Router } from 'express';
import {
  validateCreateProfilePicture,
  validateGetProfilePicture,
  validateDeleteProfilePicture
} from '../../middleware/validation/profilePictures';
import {
  createProfilePicture,
  getProfilePicture,
  deleteProfilePicture
} from '../../controllers/profilePictures';
import { verifyToken } from '../../middleware';
import { checkFolder } from '../../utils/checkUpload';
import { profile } from '../../utils/multer';

const router = Router();

router
  .post(
    '/',
    verifyToken,
    checkFolder,
    profile,
    validateCreateProfilePicture,
    createProfilePicture
  )
  .get('/:user_id', validateGetProfilePicture, verifyToken, getProfilePicture)
  .delete(
    '/:id',
    validateDeleteProfilePicture,
    verifyToken,
    deleteProfilePicture
  );

export default router;
