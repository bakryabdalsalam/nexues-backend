import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { PrismaClient, UserRole } from '@prisma/client';

const prismaClient = new PrismaClient();

export const adminController = {
  getDashboardStats: async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        recentUsers,
        recentJobs,
        recentApplications,
      ] = await Promise.all([
        prismaClient.user.count({ where: { role: UserRole.USER } }),
        prismaClient.user.count({ where: { role: UserRole.COMPANY } }),
        prismaClient.job.count(),
        prismaClient.application.count(),
        prismaClient.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { profile: true },
          where: { role: UserRole.USER }
        }),
        prismaClient.job.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            company: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            applications: {
              select: {
                id: true
              }
            }
          }
        }),
        prismaClient.application.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            job: {
              include: {
                company: {
                  select: {
                    companyName: true,
                    id: true
                  }
                }
              }
            },
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalCompanies,
          totalJobs,
          totalApplications,
          recentActivity: {
            users: recentUsers,
            jobs: recentJobs.map(job => ({
              ...job,
              company: {
                ...job.company,
                companyName: job.company?.companyName || 'N/A',
                // Add user data from the company's associated user
                name: job.company?.user?.name || 'N/A',
                email: job.company?.user?.email || 'N/A',
                role: job.company?.user?.role || 'N/A'
              },
              _count: {
                applications: job.applications.length
              }
            })),
            applications: recentApplications.map(app => ({
              ...app,
              job: {
                ...app.job,
                company: {
                  ...app.job.company,
                  name: app.job?.company?.companyName || 'N/A'
                }
              }
            }))
          }
        }
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching dashboard statistics' 
      });
    }
  },

  // Get all users with pagination
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prismaClient.user.findMany({
          skip,
          take: limit,
          include: {
            profile: true,
            company: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prismaClient.user.count()
      ]);

      const pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching users' 
      });
    }
  },

  // Get all applications with pagination
  getAllApplications: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [applications, total] = await Promise.all([
        prismaClient.application.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            job: {
              include: {
                company: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prismaClient.application.count()
      ]);

      const pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: applications,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      });
    } catch (error) {
      console.error('Error getting applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get applications'
      });
    }
  },

  updateUserStatus: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await prismaClient.user.update({
        where: { id: userId },
        data: { isActive },
      });

      res.json(user);
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Error updating user status' });
    }
  },

  getSystemLogs: async (req: Request, res: Response) => {
    try {
      // This is a placeholder for system logs
      // In a real application, you would implement proper logging
      // and retrieve logs from your logging system
      res.json({
        message: 'System logs functionality to be implemented',
        // Add actual log retrieval logic here
      });
    } catch (error) {
      console.error('Get system logs error:', error);
      res.status(500).json({ message: 'Error fetching system logs' });
    }
  },

  manageJobPostings: async (req: Request, res: Response) => {
    try {
      const jobs = await prismaClient.job.findMany({
        include: {
          company: true,
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      res.json(jobs);
    } catch (error) {
      console.error('Manage job postings error:', error);
      res.status(500).json({ message: 'Error fetching job postings' });
    }
  },
  
  // Add endpoint for updating user role
  updateUserRole: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      
      const updatedUser = await prismaClient.user.update({
        where: { id: userId },
        data: { role },
        include: { profile: true, company: true }
      });
      
      return res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }
  }
};