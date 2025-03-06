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
  
  // Fix the type error by properly typing the secret for jwt.sign
  return jwt.sign(jwtPayload, String(JWT_SECRET), { 
    expiresIn 
  });
};

export const verifyToken = (token: string): JWTPayload => {
  // Use the same String casting for consistency
  return jwt.verify(token, String(JWT_SECRET)) as JWTPayload;
};