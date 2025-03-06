import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: TokenPayload, expiresIn: string): string => {
  const jwtPayload = {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };

  // Explicitly declare sign options so that the correct overload is used.
  const options: jwt.SignOptions = { expiresIn };

  return jwt.sign(jwtPayload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};