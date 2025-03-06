"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableJobs = exports.getUserApplications = exports.applyForJob = exports.getUserProfile = exports.updateUserProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { resume, skills, experience, education, bio, phoneNumber, address, linkedIn, github, portfolio, } = req.body;
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
exports.updateUserProfile = updateUserProfile;
const getUserProfile = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};
exports.getUserProfile = getUserProfile;
const applyForJob = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const userId = user.id;
        const { jobId } = req.params;
        const { resume, message } = req.body; // Changed from coverLetter to message
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
        const application = await prisma.application.create({
            data: {
                jobId,
                userId: userId,
                resume,
                message, // Changed from coverLetter to message
            },
        });
        res.status(201).json(application);
    }
    catch (error) {
        console.error('Job application error:', error);
        res.status(500).json({ message: 'Error applying for job' });
    }
};
exports.applyForJob = applyForJob;
const getUserApplications = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
};
exports.getUserApplications = getUserApplications;
const getAvailableJobs = async (req, res) => {
    try {
        const { category, location, remote, experienceLevel, search, } = req.query;
        const jobs = await prisma.job.findMany({
            where: {
                status: 'OPEN',
                ...(category && { category: category }),
                ...(location && { location: location }),
                ...(remote && { remote: remote === 'true' }),
                ...(experienceLevel && { experienceLevel: experienceLevel }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
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
    }
    catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ message: 'Error fetching jobs' });
    }
};
exports.getAvailableJobs = getAvailableJobs;
