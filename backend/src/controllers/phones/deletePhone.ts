import { Request, Response } from 'express';
import Phone from '../../models/phone';

const phone = new Phone();

export const deletePhone = async (req: Request, res: Response) => {
  try {
    const response = await phone.deletePhone(parseInt(req.params.id));
    res.setHeader('Content-Location', `/phones/${response.id}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
