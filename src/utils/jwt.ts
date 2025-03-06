import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  // Convert to plain object to avoid type issues
  const jwtPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };
  
  return jwt.sign(jwtPayload, JWT_SECRET, { 
    expiresIn
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};