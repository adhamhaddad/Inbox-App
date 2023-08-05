import { Request as ExpressRequest } from 'express';
import { DecodedToken } from '../utils/token';

export interface Request extends ExpressRequest {
  user?: DecodedToken;
}
