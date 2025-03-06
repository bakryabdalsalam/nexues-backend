"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationController = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma = new client_1.PrismaClient();
exports.applicationController = {
    async createApplication(req, res) {
        try {
            const { jobId } = req.params;
            const userId = req.user.id;
            const application = await prisma.application.create({
                data: {
                    jobId,
                    userId,
                    status: 'PENDING'
                }
            });
            res.status(201).json(application);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create application' });
        }
    },
    async getUserApplications(req, res) {
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
        }
        catch (error) {
            console.error('Get user applications error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching applications'
            });
        }
    },
    async getAllApplications(req, res) {
        try {
            // Only admin can see all applications
            if (req.user.role !== 'ADMIN') {
                throw new error_middleware_1.AppError(403, 'Unauthorized access');
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                console.error('Get all applications error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching applications'
                });
            }
        }
    },
    async getApplication(req, res) {
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
                throw new error_middleware_1.AppError(404, 'Application not found');
            }
            // Only admin or the application owner can view it
            if (req.user.role !== 'ADMIN' && application.userId !== req.user.id) {
                throw new error_middleware_1.AppError(403, 'Unauthorized access');
            }
            res.json({
                success: true,
                data: application
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                console.error('Get application error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching application'
                });
            }
        }
    },
    async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            // Validate status
            const validStatuses = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
            if (!validStatuses.includes(status)) {
                throw new error_middleware_1.AppError(400, 'Invalid status value');
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
                throw new error_middleware_1.AppError(404, 'Application not found');
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppError) {
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
