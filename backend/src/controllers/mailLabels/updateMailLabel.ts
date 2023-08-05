import { Request, Response } from 'express';
import MailLabel from '../../models/mailLabel';

const mailLabel = new MailLabel();

export const updateMailLabel = async (req: Request, res: Response) => {
  try {
    const response = await mailLabel.updateMailLabel(
      parseInt(req.params.id),
      req.body
    );
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
