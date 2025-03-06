import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';
import { AppError } from '../middleware/error.middleware';

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const isValid = passwordRegex.test(password);
  return {
    isValid,
    message: isValid ? '' : 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
  };
};

export const generateAccessToken = (user: TokenPayload): string => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    }, 
    ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
};

export const generateRefreshToken = (user: TokenPayload): string => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    }, 
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string, isRefreshToken = false): TokenPayload => {
  try {
    const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
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
