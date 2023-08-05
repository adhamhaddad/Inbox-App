import { Response } from 'express';
import { Request } from '../../middleware';
import User from '../../models/user';

const user = new User();

export const getUser = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await user.getUser(user_id);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
