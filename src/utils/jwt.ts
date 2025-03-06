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

  // Cast the secret as unknown then as jwt.Secret to satisfy the type
  return jwt.sign(jwtPayload, JWT_SECRET as unknown as jwt.Secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET as unknown as jwt.Secret) as JWTPayload;
};