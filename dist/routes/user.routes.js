"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get user profile
router.get('/profile', auth_middleware_1.authenticate, async (req, res) => {
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
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});
// Get user applications
router.get('/applications', auth_middleware_1.authenticate, async (req, res) => {
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
    }
    catch (error) {
        console.error('Get user applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user applications'
        });
    }
});
// Update user profile
router.put('/profile', auth_middleware_1.authenticate, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const { fullName, bio, skills, experience, education, phoneNumber, address, linkedIn, github, portfolio, resume } = req.body;
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});
exports.userRoutes = router;
