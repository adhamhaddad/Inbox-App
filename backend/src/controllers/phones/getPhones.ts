import { Response } from 'express';
import { Request } from '../../middleware';
import Phone from '../../models/phone';

const phone = new Phone();

export const getPhones = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id as unknown as number;
    const response = await phone.getPhones(user_id);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
