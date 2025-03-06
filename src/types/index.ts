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

export interface RequestWithUser extends Request {
  user?: TokenPayload;
}

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
