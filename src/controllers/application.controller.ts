import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export const applicationController = {
  async createApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const { jobId, coverLetter, resume } = req.body;
      const userId = req.user.id;

      // Check if job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new AppError(404, 'Job not found');
      }

      // Check if user has already applied
      const existingApplication = await prisma.application.findFirst({
        where: {
          jobId,
          userId
        }
      });

      if (existingApplication) {
        throw new AppError(400, 'You have already applied for this job');
      }

      const application = await prisma.application.create({
        data: {
          jobId,
          userId,
          coverLetter,
          resume,
          status: 'PENDING'
        },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: application
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Application creation error:', error);
        res.status(500).json({
          success: false,
          message: 'Error creating application'
        });
      }
    }
  },

  async getUserApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const applications = await prisma.application.findMany({
        where: {
          userId: req.user.id
        },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Get user applications error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching applications'
      });
    }
  },

  async getAllApplications(req: AuthenticatedRequest, res: Response) {
    try {
      // Only admin can see all applications
      if (req.user.role !== 'ADMIN') {
        throw new AppError(403, 'Unauthorized access');
      }

      const applications = await prisma.application.findMany({
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get all applications error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching applications'
        });
      }
    }
  },

  async getApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      if (!application) {
        throw new AppError(404, 'Application not found');
      }

      // Only admin or the application owner can view it
      if (req.user.role !== 'ADMIN' && application.userId !== req.user.id) {
        throw new AppError(403, 'Unauthorized access');
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        console.error('Get application error:', error);
        res.status(500).json({
          success: false,
          message: 'Error fetching application'
        });
      }
    }
  },

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
      if (!validStatuses.includes(status)) {
        throw new AppError(400, 'Invalid status value');
      }

      // Check if application exists
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      if (!application) {
        throw new AppError(404, 'Application not found');
      }

      // Update application status
      const updatedApplication = await prisma.application.update({
        where: { id },
        data: { status },
        include: {
          job: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: updatedApplication,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      console.error('Error updating application status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update application status'
      });
    }
  }
};
