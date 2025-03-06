import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  const jwtPayload: JWTPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };
  
  return jwt.sign(jwtPayload, JWT_SECRET, { 
    expiresIn,
    algorithm: 'HS256'
  });
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JWTPayload;
};