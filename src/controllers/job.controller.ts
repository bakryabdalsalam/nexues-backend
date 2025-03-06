import { Request, Response } from 'express';
import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

// Remove the local AuthRequest interface since we're importing it from types
export const jobController = {
  async getAllJobs(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10,
        search,
        location,
        category,
        experienceLevel,
        employmentType,
        remote
      } = req.query;

      console.log('Received job search request:', req.query);

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: Prisma.JobWhereInput = {
        status: 'OPEN'
      };

      if (search) {
        where.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } }
        ];
      }

      if (location) {
        where.location = { contains: String(location), mode: 'insensitive' };
      }

      if (category) {
        where.category = String(category);
      }

      if (experienceLevel) {
        where.experienceLevel = String(experienceLevel);
      }

      if (employmentType) {
        where.employmentType = String(employmentType);
      }

      if (remote !== undefined) {
        where.remote = Boolean(remote);
      }

      console.log('Executing query with params:', { where, skip, take: limitNum });

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                industry: true,
                location: true,
                logo: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limitNum
        }),
        prisma.job.count({ where })
      ]);

      return res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            hasMore: pageNum * limitNum < total
          }
        }
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching jobs'
      });
    }
  },

  getJobById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              description: true,
              industry: true,
              size: true,
              website: true,
              location: true,
              logo: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          applications: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching job'
      });
    }
  },

  getSimilarJobs: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const job = await prisma.job.findUnique({
        where: { id },
        select: {
          category: true,
          experienceLevel: true,
          company: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const similarJobs = await prisma.job.findMany({
        where: {
          OR: [
            { category: job.category },
            { experienceLevel: job.experienceLevel },
          ],
          id: { not: id },
          status: 'OPEN'
        },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              location: true,
              logo: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: similarJobs
      });
    } catch (error) {
      console.error('Get similar jobs error:', error);
      res.status(500).json({ message: 'Error fetching similar jobs' });
    }
  },

  getJobStats: async (req: Request, res: Response) => {
    try {
      const [
        totalJobs,
        categoryStats,
        locationStats,
      ] = await Promise.all([
        prisma.job.count(),
        prisma.job.groupBy({
          by: ['category'],
          _count: true,
        }),
        prisma.job.groupBy({
          by: ['location'],
          _count: true,
        }),
      ]);

      res.json({
        totalJobs,
        categoryStats,
        locationStats,
      });
    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({ message: 'Error fetching job statistics' });
    }
  },

  createJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        title,
        description,
        location,
        experienceLevel,
        category,
        salary,
        remote,
        employmentType,
        requirements = [],
        benefits = []
      } = req.body;

      // First get the company ID for the user
      const company = await prisma.company.findUnique({
        where: { userId: req.user.id }
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Company profile not found'
        });
      }

      const job = await prisma.job.create({
        data: {
          title,
          description,
          location,
          experienceLevel,
          category,
          salary: salary ? parseFloat(salary.toString()) : null,
          remote: remote || false,
          employmentType,
          requirements,
          benefits,
          companyId: company.id
        },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              location: true,
              logo: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error creating job' 
      });
    }
  },

  updateJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        location,
        experienceLevel,
        category,
        salary,
        remote,
        employmentType,
        requirements,
        benefits
      } = req.body;

      const job = await prisma.job.update({
        where: { id },
        data: {
          title,
          description,
          location,
          experienceLevel,
          category,
          salary: salary ? parseFloat(salary.toString()) : null,
          remote,
          employmentType,
          requirements,
          benefits
        },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              location: true,
              logo: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error updating job' 
      });
    }
  },

  deleteJob: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.job.delete({
        where: { id },
      });

      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ message: 'Error deleting job' });
    }
  },

  getRecommendations: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user.id;

      // Get user's profile and previous applications
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: {
            include: {
              applications: {
                include: {
                  job: true
                }
              }
            }
          }
        }
      });

      if (!userProfile) {
        throw new AppError(404, 'User profile not found');
      }

      // Extract user's skills and previous job categories
      const userSkills = userProfile.skills || [];
      const previousCategories = userProfile.user.applications.map(app => app.job.category);

      // Find jobs matching user's skills and categories
      const recommendedJobs = await prisma.job.findMany({
        where: {
          OR: [
            // Match by skills (if any skills are specified)
            ...(userSkills.length > 0 ? [{
              description: {
                contains: userSkills.join(' '),
                mode: Prisma.QueryMode.insensitive
              }
            }] : []),
            // Match by previous job categories
            ...(previousCategories.length > 0 ? [{
              category: {
                in: previousCategories
              }
            }] : [])
          ] as Prisma.JobWhereInput[],
          // Exclude jobs user has already applied to
          NOT: {
            applications: {
              some: {
                userId
              }
            }
          }
        },
        take: 6,
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({
        success: true,
        data: recommendedJobs
      });
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ message: 'Error fetching job recommendations' });
    }
  }
};
