import { Response } from 'express';
import { Request } from '../../middleware';
import MailLabel from '../../models/mailLabel';

const mailLabel = new MailLabel();

export const updateMailLabel = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await mailLabel.updateMailLabel({ ...req.body, user_id });
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
