import { Response } from 'express';
import { Request } from '../../middleware';
import ReadMail from '../../models/readMail';

const readMail = new ReadMail();

export const updateReadMail = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await readMail.updateReadMail(
      parseInt(req.params.mail_id),
      user_id
    );
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
