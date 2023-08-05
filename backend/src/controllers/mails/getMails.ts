import { Request as ExpressRequest, Response } from 'express';
import { DecodedToken } from '../../utils/token';
import Mail from '../../models/mail';

interface Request extends ExpressRequest {
  user?: DecodedToken;
}
const mail = new Mail();

export const getMails = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await mail.getMails(user_id);
    res.status(200).json({ data: response });
  } catch (error) {
    res.status(400).json({ errors: (error as Error).message });
  }
};
