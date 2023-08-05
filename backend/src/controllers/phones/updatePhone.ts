import { Request, Response } from 'express';
import Phone from '../../models/phone';

const phone = new Phone();

export const updatePhone = async (req: Request, res: Response) => {
  try {
    const response = await phone.updatePhone(parseInt(req.params.id), req.body);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
