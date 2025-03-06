import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

export const companyController = {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          company: true
        }
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const company = user.company;

      if (!company) {
        return res.json({
          success: true,
          data: null,
          message: 'Company profile not created yet'
        });
      }

      return res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Get company profile error:', error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error fetching company profile'
      });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      const { companyName, description, industry, size, website, location, logo } = req.body;

      const company = await prisma.company.upsert({
        where: { userId },
        update: {
          companyName,
          description,
          industry,
          size,
          website,
          location,
          logo
        },
        create: {
          userId,
          companyName,
          description,
          industry,
          size,
          website,
          location,
          logo
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
              role: true,
              profile: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: company
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error updating company profile'
      });
    }
  },

  async getJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      const { page = 1, limit = 10, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: Prisma.JobWhereInput = {
        company: {
          userId
        }
      };

      if (status) {
        where.status = status as string;
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            applications: {
              select: {
                id: true,
                status: true,
                createdAt: true
              }
            }
          }
        }),
        prisma.job.count({ where })
      ]);

      return res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error fetching company jobs'
      });
    }
  },

  async createJob(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      // Get the company associated with the user
      const company = await prisma.company.findUnique({
        where: { userId }
      });

      if (!company) {
        throw new AppError(404, 'Company profile not found. Please create a company profile first.');
      }

      const {
        title,
        description,
        location,
        salary,
        employmentType,
        experienceLevel,
        remote,
        requirements,
        benefits,
        category,
        status = 'OPEN'
      } = req.body;

      // Validate required fields
      if (!title || !description || !location || !employmentType || !experienceLevel || !category) {
        throw new AppError(400, 'Missing required job fields');
      }

      // Create job with proper company relation
      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          salary: salary ? Number(salary) : undefined,
          employmentType,
          experienceLevel,
          remote: Boolean(remote),
          requirements,
          benefits,
          category,
          status,
          company: {
            connect: {
              id: company.id
            }
          }
        },
        include: {
          company: {
            select: {
              companyName: true,
              industry: true,
              location: true,
              logo: true
            }
          }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      console.error('Error creating job:', error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(400).json({
            success: false,
            message: 'A job with this title already exists'
          });
        }
      }
      return res.status(500).json({
        success: false,
        message: 'Error creating job'
      });
    }
  },

  async updateJob(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const jobId = req.params.id;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      // Verify company owns this job
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          company: {
            userId
          }
        }
      });

      if (!job) {
        throw new AppError(404, 'Job not found');
      }

      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: req.body,
        include: {
          company: true
        }
      });

      return res.json({
        success: true,
        data: updatedJob
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error updating job'
      });
    }
  },

  async deleteJob(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const jobId = req.params.id;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      // Verify company owns this job
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          company: {
            userId
          }
        }
      });

      if (!job) {
        throw new AppError(404, 'Job not found');
      }

      await prisma.job.delete({
        where: { id: jobId }
      });

      return res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error deleting job'
      });
    }
  },

  async getJobApplications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const jobId = req.params.id;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      // Verify company owns this job
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          company: {
            userId
          }
        }
      });

      if (!job) {
        throw new AppError(404, 'Job not found');
      }

      const applications = await prisma.application.findMany({
        where: {
          jobId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true
            }
          }
        }
      });

      return res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error fetching job applications'
      });
    }
  },

  async updateApplicationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId, applicationId } = req.params;
      const { status } = req.body;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      // Verify company owns this job
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          company: {
            userId
          }
        }
      });

      if (!job) {
        throw new AppError(404, 'Job not found');
      }

      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          jobId
        }
      });

      if (!application) {
        throw new AppError(404, 'Application not found');
      }

      const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true
            }
          },
          job: true
        }
      });

      return res.json({
        success: true,
        data: updatedApplication
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error updating application status'
      });
    }
  },

  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      if (req.user?.role !== 'COMPANY') {
        throw new AppError(403, 'Only company accounts can access this resource');
      }

      const company = await prisma.company.findUnique({
        where: { userId },
        include: {
          jobs: {
            include: {
              applications: true
            }
          }
        }
      });

      if (!company) {
        throw new AppError(404, 'Company not found');
      }

      const activeJobs = company.jobs.filter(job => job.status === 'OPEN').length;
      const totalApplications = company.jobs.reduce((acc, job) => acc + job.applications.length, 0);
      const newApplications = company.jobs.reduce((acc, job) => 
        acc + job.applications.filter(app => app.status === 'PENDING').length, 0);

      return res.json({
        success: true,
        data: {
          activeJobs,
          totalApplications,
          newApplications
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error fetching company stats'
      });
    }
  }
};