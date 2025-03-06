import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const handleAuthRoute = (
  handler: (req: AuthenticatedRequest, res: Response) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req as AuthenticatedRequest, res).catch(next);
  };
};
