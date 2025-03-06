import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

interface TokenPayload {
  id: string;
  role: UserRole;
  email?: string;
  exp?: number;
}

export const generateToken = (
  userId: string, 
  role: UserRole, 
  expiresIn: string = '15m',
  isRefreshToken: boolean = false
): string => {
  const payload = {
    id: userId, // Changed from userId to id to match what the middleware expects
    role: role
  };

  const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    if (!decoded || !decoded.id || !decoded.role) {
      throw new AppError(401, 'Invalid token payload');
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw new AppError(401, 'Token verification failed');
  }
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
};