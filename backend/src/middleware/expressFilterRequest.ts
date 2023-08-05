import { Request, Response, NextFunction } from 'express';

type AllowedKeys = Record<string, string[]>;

export const expressFilterRequest = (allowedKeys: AllowedKeys) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const keys = Object.keys(allowedKeys);
    const route = keys.find((key) =>
      req.method.toLocaleLowerCase().includes(key)
    );
    if (!route || !allowedKeys[route]) {
      return next();
    }
    const filteredBody = await Promise.resolve(
      Object.keys(req.body)
        .filter((key) => allowedKeys[route].includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {} as Record<string, any>)
    );
    req.body = filteredBody;
    next();
  };
};
