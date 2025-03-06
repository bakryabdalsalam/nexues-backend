import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

export const generateToken = (
  userId: string,
  role: UserRole,
  email: string,
  expiresIn: string = '15m'
): string => {
  const secret = JWT_SECRET;
  const payload: TokenPayload = {
    id: userId,
    role,
    email
  };

  // Cast expiresIn to any to bypass type checking for the expiresIn option
  return jwt.sign(payload, secret as jwt.Secret, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret as jwt.Secret) as TokenPayload;
    
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
  return jwt.verify(token, REFRESH_TOKEN_SECRET as jwt.Secret) as jwt.JwtPayload;
};
