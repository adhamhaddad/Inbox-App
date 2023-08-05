import { Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD = path.join(__dirname, '..', '..', 'uploads');
const PROFILE = path.join(__dirname, '..', '..', 'uploads', 'profile-pictures');
const MAIL_ATTACHMENTS = path.join(
  __dirname,
  '..',
  '..',
  'uploads',
  'mail-attachments'
);

export const checkFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if upload folder exists
    await fs.access(UPLOAD);
    await fs.access(PROFILE);
    await fs.access(MAIL_ATTACHMENTS);
    // Upload folder exists, call next middleware
    next();
  } catch (err) {
    // Upload folder does not exist, create it
    try {
      try {
        await fs.access(UPLOAD);
      } catch {
        await fs.mkdir(UPLOAD);
      }
      // Create the other folders
      try {
        await fs.access(PROFILE);
      } catch {
        await fs.mkdir(PROFILE);
      }
      try {
        await fs.access(MAIL_ATTACHMENTS);
      } catch {
        await fs.mkdir(MAIL_ATTACHMENTS);
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
};
