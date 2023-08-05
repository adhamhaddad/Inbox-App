import { Request, Response } from 'express';
import MailFolder from '../../models/mailFolder';

const mailFolder = new MailFolder();

export const updateMailFolder = async (req: Request, res: Response) => {
  try {
    const response = await mailFolder.updateMailFolder(
      parseInt(req.params.id),
      req.body
    );
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
