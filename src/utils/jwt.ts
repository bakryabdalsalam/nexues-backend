import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  const jwtPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  const options: jwt.SignOptions = { expiresIn };

  // Convert the secret to a Buffer to satisfy type requirements
  const secret: jwt.Secret = Buffer.from(JWT_SECRET, 'utf-8');

  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret: jwt.Secret = Buffer.from(JWT_SECRET, 'utf-8');
  return jwt.verify(token, secret) as JWTPayload;
};