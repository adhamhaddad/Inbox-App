import { Response } from 'express';
import { Request } from '../../middleware';
import Mail from '../../models/mail';

const mail = new Mail();

export const getMail = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await mail.getMail(parseInt(req.params.id), user_id);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
