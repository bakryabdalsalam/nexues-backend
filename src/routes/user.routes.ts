import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id: req.user.id,
      },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// Get user applications
router.get('/applications', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        job: {
          include: {
            company: true
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
      message: 'Error fetching user applications'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { 
      fullName,
      bio,
      skills,
      experience,
      education,
      phoneNumber,
      address,
      linkedIn,
      github,
      portfolio,
      resume 
    } = req.body;

    const updatedProfile = await prisma.profile.upsert({
      where: {
        userId: req.user.id
      },
      update: {
        fullName,
        bio,
        skills,
        experience,
        education,
        phoneNumber,
        address,
        linkedIn,
        github,
        portfolio,
        resume
      },
      create: {
        userId: req.user.id,
        fullName,
        bio,
        skills,
        experience,
        education,
        phoneNumber,
        address,
        linkedIn,
        github,
        portfolio,
        resume
      }
    });

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

export const userRoutes = router;