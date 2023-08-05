import { Response } from 'express';
import { Request } from '../../middleware';
import Password from '../../models/password';

const password = new Password();

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    await password.updatePassword(user_id, req.body);
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
