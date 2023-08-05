import { Response } from 'express';
import { Request } from '../../middleware';
import Phone from '../../models/phone';

const phone = new Phone();

export const createPhone = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await phone.createPhone({ user_id, ...req.body });
    res.status(201).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
