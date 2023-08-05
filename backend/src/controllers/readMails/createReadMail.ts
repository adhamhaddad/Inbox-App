import { Response } from 'express';
import { Request } from '../../middleware';
import ReadMail from '../../models/readMail';

const readMail = new ReadMail();

export const createReadMail = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await readMail.createReadMail({ user_id, ...req.body });
    res.status(201).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
