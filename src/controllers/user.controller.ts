import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      resume,
      skills,
      experience,
      education,
      bio,
      phoneNumber,
      address,
      linkedIn,
      github,
      portfolio,
    } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        resume,
        skills,
        experience,
        education,
        bio,
        phoneNumber,
        address,
        linkedIn,
        github,
        portfolio,
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const applyForJob = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;
    const { resume, coverLetter } = req.body;

    // Check if user has already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId,
        jobId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    // Update the application creation code to avoid type errors
    const applicationData = {
      jobId,
      userId,
      status: 'PENDING'
    };

    if (coverLetter) {
      applicationData['coverLetter'] = coverLetter;
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        resume,
        coverLetter,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ message: 'Error applying for job' });
  }
};

export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
};

export const getAvailableJobs = async (req: Request, res: Response) => {
  try {
    const {
      category,
      location,
      remote,
      experienceLevel,
      search,
    } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        ...(category && { category: category as string }),
        ...(location && { location: location as string }),
        ...(remote && { remote: remote === 'true' }),
        ...(experienceLevel && { experienceLevel: experienceLevel as string }),
        ...(search && {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};