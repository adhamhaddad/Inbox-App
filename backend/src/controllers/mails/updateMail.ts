import { Request, Response } from 'express';
import { io } from '../../server';
import Mail from '../../models/mail';

const mail = new Mail();

export const updateMail = async (req: Request, res: Response) => {
  try {
    const response = await mail.updateMail(parseInt(req.params.id), req.body);
    io.emit('mails', { action: 'UPDATE', data: response });
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
