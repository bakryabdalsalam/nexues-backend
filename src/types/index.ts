import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface TokenPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

export interface JWTPayload {
  id: string;
  role: UserRole;
  email: string;
  exp?: number;
  iat?: number;
}

export interface JobFilters {
  category?: string;
  location?: string;
  experienceLevel?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}
