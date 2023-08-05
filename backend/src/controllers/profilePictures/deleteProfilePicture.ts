import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import ProfilePicture from '../../models/profilePictures';

const profilePicture = new ProfilePicture();
const upload = path.join(__dirname, '..', '..', '..');

export const deleteProfilePicture = async (req: Request, res: Response) => {
  try {
    const response = await profilePicture.deleteProfilePicture(
      parseInt(req.params.id)
    );
    fs.promises.unlink(`${upload}/${response.image_url}`);
    res.setHeader('Content-Location', `/profile-pictures/${response.id}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
