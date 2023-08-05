import { Router } from 'express';
import {
  auth,
  users,
  profilePictures,
  phones,
  blockedUsers,
  mails,
  mailFolders,
  mailLabels,
  starredMails,
  readMails
} from './api';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/phones', phones);
router.use('/profile-pictures', profilePictures);
router.use('/blocked-users', blockedUsers);
router.use('/mails', mails);
router.use('/mail-folders', mailFolders);
router.use('/mail-labels', mailLabels);
router.use('/starred-mails', starredMails);
router.use('/read-mails', readMails);

export default router;
