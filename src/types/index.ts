import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
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

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}
