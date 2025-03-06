import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';
import { generateToken, verifyToken } from '../utils/jwt';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
} as const;

const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role = UserRole.USER } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          profile: {
            create: {
              fullName: name
            }
          }
        },
        include: {
          profile: true
        }
      });

      const accessToken = generateToken(user.id, '15m');
      const refreshToken = generateToken(user.id, '7d');

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token: accessToken
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          company: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const accessToken = generateToken(user.id, '15m');
      const refreshToken = generateToken(user.id, '7d');

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token: accessToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      // Try to get token from cookie first, then from Authorization header
      let refreshToken = req.cookies?.refreshToken;
      
      // If no cookie, check for Authorization header (for environments where cookies don't work)
      if (!refreshToken) {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          refreshToken = authHeader.split(' ')[1];
        }
      }
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided'
        });
      }

      // Use the verifyToken utility to decode and verify the token
      try {
        // Verify the token
        const decoded = jwt.verify(
          refreshToken, 
          process.env.JWT_SECRET || 'fallback-secret'
        ) as jwt.JwtPayload & { id: string };
        
        // Find the user
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: {
            profile: true,
            company: true
          }
        });

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Invalid refresh token - user not found'
          });
        }

        // Generate new tokens
        const accessToken = generateToken(user.id, '15m');
        const newRefreshToken = generateToken(user.id, '7d');

        // Set the new refresh token in cookie
        res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

        const { password: _, ...userWithoutPassword } = user;

        return res.json({
          success: true,
          data: {
            user: userWithoutPassword,
            token: accessToken
          }
        });
      } catch (tokenError) {
        console.error('Token verification error:', tokenError);
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({
        success: false,
        message: 'Error processing refresh token'
      });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken', {
      ...COOKIE_OPTIONS,
      maxAge: 0
    });

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true,
          company: true,
          applications: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user profile'
      });
    }
  },

  async verifyToken(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true,
          company: true
        }
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Verify token error:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ 
          success: false,
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Error verifying token' 
        });
      }
    }
  }
};

export default authController;
