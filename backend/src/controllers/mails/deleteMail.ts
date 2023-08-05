import { Response } from 'express';
import { Request } from '../../middleware';
import { io } from '../../server';
import Mail from '../../models/mail';

const mails = new Mail();

export const deleteMail = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await mails.deleteMail(parseInt(req.params.id), user_id);
    io.emit('mails', { action: 'DELETE', data: response });
    res.setHeader('Content-Location', `/mails/${response.id}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
