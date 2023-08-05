import { Router } from 'express';
import { validateCreateMailFolder } from '../../middleware/validation/mailFolders';
import { updateMailFolder } from '../../controllers/mailFolders';
import { verifyToken } from '../../middleware';

const router = Router();

router.patch('/:id', validateCreateMailFolder, verifyToken, updateMailFolder);

export default router;
