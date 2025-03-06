import jwt from 'jsonwebtoken';
type UserRole = 'ADMIN' | 'USER' | 'GUEST'; // Define UserRole type if not available in @prisma/client
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
  
  // Ensure payload is treated as an object and secret as a string
  return jwt.sign(payload as object, secret as string, { expiresIn });
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret as string) as TokenPayload;
    
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
  // Ensure secret is treated as a string
  return jwt.verify(token, REFRESH_TOKEN_SECRET as string) as jwt.JwtPayload;
};