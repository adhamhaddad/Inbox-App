import { Response } from 'express';
import { Request } from '../../middleware';
import MailFolder from '../../models/mailFolder';

const mailFolder = new MailFolder();

export const updateMailFolder = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await mailFolder.updateMailFolder({
      ...req.body,
      user_id
    });
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
