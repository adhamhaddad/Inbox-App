import { Response } from 'express';
import { Request } from '../../middleware';
import User from '../../models/user';

const user = new User();

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await user.deleteUser(user_id);
    res.setHeader('Content-Location', `/users/${response.id}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
