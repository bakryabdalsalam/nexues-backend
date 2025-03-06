import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const withAuth = (handler: (req: AuthenticatedRequest, res: Response, next?: NextFunction) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
};
