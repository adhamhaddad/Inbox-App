import { Request, Response } from 'express';
import { setAccessToken, setRefreshToken } from '../../utils/token';
import Auth from '../../models/auth';

const auth = new Auth();

export const authUser = async (req: Request, res: Response) => {
  try {
    // Authenticate the user and generate an access token and refresh token
    const response = await auth.authUser(req.body);
    const accessToken = await setAccessToken(response);
    const refreshToken = await setRefreshToken(response);

    res
      .status(200)
      .json({ data: { user: { ...response }, accessToken, refreshToken } });
  } catch (error) {
    if ((error as Error).message.includes('Password')) {
      return res
        .status(400)
        .json({ errors: [{ password: (error as Error).message }] });
    }
    if ((error as Error).message.includes('Email')) {
      return res
        .status(400)
        .json({ errors: [{ email: (error as Error).message }] });
    }
    res.status(400).json({ errors: (error as Error).message });
  }
};
