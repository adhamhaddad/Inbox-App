import { Request, Response } from 'express';
import MailLabel from '../../models/mailLabel';

const mailLabel = new MailLabel();

export const createMailLabel = async (req: Request, res: Response) => {
  try {
    const response = await mailLabel.createMailLabel(req.body);
    res.status(201).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
