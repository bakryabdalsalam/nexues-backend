import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types';

export const companyController = {
  async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      // Get company associated with the user
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const [totalJobs, activeJobs, totalApplications] = await Promise.all([
        prisma.job.count({
          where: { companyId: company.id }
        }),
        prisma.job.count({
          where: { 
            companyId: company.id,
            status: 'OPEN'
          }
        }),
        prisma.job.findMany({
          where: { companyId: company.id },
          select: {
            _count: {
              select: { applications: true }
            }
          }
        }).then(jobs => jobs.reduce((acc, job) => acc + job._count.applications, 0))
      ]);
      
      return res.json({
        success: true,
        data: {
          totalJobs,
          activeJobs,
          totalApplications
        }
      });
    } catch (error) {
      console.error('Get company stats error:', error);
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
  },
  
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
      });
      
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      
      if (!user.company) {
        return res.json({
          success: true,
          data: null,
          message: 'Company profile not created yet'
        });
      }
      
      return res.json({
        success: true,
        data: user.company
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
      const userId = req.user.id;
      const {
        companyName,
        description,
        industry,
        size,
        website,
        location,
        logo
      } = req.body;
      
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
        }
      });
      
      return res.json({
        success: true,
        data: company
      });
    } catch (error) {
      console.error('Update company profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating company profile'
      });
    }
  },
  
  async getJobs(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const jobs = await prisma.job.findMany({
        where: { companyId: company.id },
        include: {
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Get company jobs error:', error);
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
      const userId = req.user.id;
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
        category
      } = req.body;
      
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          salary: salary ? parseFloat(salary) : null,
          employmentType,
          experienceLevel,
          remote: !!remote,
          requirements,
          benefits,
          category,
          companyId: company.id
        }
      });
      
      return res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Create job error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating job'
      });
    }
  },
  
  async updateJob(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verify ownership
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const job = await prisma.job.findFirst({
        where: {
          id,
          companyId: company.id
        }
      });
      
      if (!job) {
        throw new AppError(404, 'Job not found or you do not have access to it');
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
        status
      } = req.body;
      
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          title,
          description,
          location,
          salary: salary ? parseFloat(salary) : null,
          employmentType,
          experienceLevel,
          remote: !!remote,
          requirements,
          benefits,
          category,
          status
        }
      });
      
      return res.json({
        success: true,
        data: updatedJob
      });
    } catch (error) {
      console.error('Update job error:', error);
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
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verify ownership
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const job = await prisma.job.findFirst({
        where: {
          id,
          companyId: company.id
        }
      });
      
      if (!job) {
        throw new AppError(404, 'Job not found or you do not have access to it');
      }
      
      await prisma.job.delete({
        where: { id }
      });
      
      return res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Delete job error:', error);
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
      const { id } = req.params;
      const userId = req.user.id;
      
      // Verify ownership
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const job = await prisma.job.findFirst({
        where: {
          id,
          companyId: company.id
        }
      });
      
      if (!job) {
        throw new AppError(404, 'Job not found or you do not have access to it');
      }
      
      const applications = await prisma.application.findMany({
        where: { jobId: id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              profile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Get job applications error:', error);
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
      const { jobId, applicationId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      
      // Verify ownership
      const company = await prisma.company.findUnique({
        where: { userId }
      });
      
      if (!company) {
        throw new AppError(404, 'Company not found');
      }
      
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          companyId: company.id
        }
      });
      
      if (!job) {
        throw new AppError(404, 'Job not found or you do not have access to it');
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
              email: true,
              name: true
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
      console.error('Update application status error:', error);
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
  }
};