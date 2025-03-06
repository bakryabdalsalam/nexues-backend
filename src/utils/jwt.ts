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
  
  // Use a more explicit type cast to resolve TypeScript error
  const secret = JWT_SECRET as jwt.Secret;
  
  return jwt.sign(jwtPayload, secret, { 
    expiresIn 
  });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = JWT_SECRET as jwt.Secret;
  return jwt.verify(token, secret) as JWTPayload;
};