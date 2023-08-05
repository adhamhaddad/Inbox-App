import { Request as ExpressRequest, Response } from 'express';
import { DecodedToken } from '../../utils/token';
import StarredMail from '../../models/starredMail';

interface Request extends ExpressRequest {
  user?: DecodedToken;
}

const starredMail = new StarredMail();

export const deleteStarredMail = async (req: Request, res: Response) => {
  try {
    const user_id: number = req.user?.id as unknown as number;
    const response = await starredMail.deleteStarredMail(
      parseInt(req.params.id),
      user_id
    );
    res.setHeader('Content-Location', `/starred-mails/${response.id}`);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
