"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma_1 = require("../config/prisma");
const date_fns_1 = require("date-fns");
const validation_middleware_1 = require("../middleware/validation.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
// Error handler middleware for admin routes
const adminErrorHandler = (err, req, res, next) => {
    console.error('Admin route error:', err);
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (err.name === 'ForbiddenError') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    if (err.name === 'PrismaClientValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data provided'
        });
    }
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            message: 'Database operation failed'
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
};
// Apply authentication and admin check to all routes
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
/**
 * @swagger
 * components:
 *   schemas:
 *     Stats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         totalJobs:
 *           type: integer
 *         totalApplications:
 *           type: integer
 *         activeJobs:
 *           type: integer
 *         pendingApplications:
 *           type: integer
 */
/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', async (req, res, next) => {
    try {
        await admin_controller_1.adminController.getDashboardStats(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Get analytics data
router.get('/analytics', async (req, res, next) => {
    try {
        // Get applications by day for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = (0, date_fns_1.subDays)(new Date(), i);
            return (0, date_fns_1.format)(date, 'yyyy-MM-dd');
        }).reverse();
        const applicationsByDay = await Promise.all(last7Days.map(async (date) => {
            const count = await prisma_1.prisma.application.count({
                where: {
                    createdAt: {
                        gte: new Date(date),
                        lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
                    },
                },
            });
            return { date, count };
        }));
        // Get jobs by category
        const jobs = await prisma_1.prisma.job.findMany({
            select: {
                category: true,
            },
        });
        const jobsByCategory = Object.entries(jobs.reduce((acc, job) => {
            const category = job.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {})).map(([category, count]) => ({ category, count }));
        // Get recent activity
        const recentActivity = await prisma_1.prisma.application.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                job: {
                    select: {
                        title: true,
                        company: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: {
                applicationsByDay,
                jobsByCategory,
                recentActivity: recentActivity.map(activity => ({
                    id: activity.id,
                    event: `${activity.user.name || activity.user.email} applied to ${activity.job.title} at ${activity.job.company}`,
                    date: activity.createdAt,
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', async (req, res, next) => {
    try {
        await admin_controller_1.adminController.getAllUsers(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Update user
router.put('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, isActive } = req.body;
        const updateData = {
            role,
            isActive
        };
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, COMPANY]
 *                 required: true
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch('/users/:userId/role', async (req, res, next) => {
    try {
        await admin_controller_1.adminController.updateUserRole(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Delete user
router.delete('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.user.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/admin/applications:
 *   get:
 *     summary: Get all applications (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         description: Filter by application status
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Application'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/applications', async (req, res, next) => {
    try {
        await admin_controller_1.adminController.getAllApplications(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Update application status
router.patch('/applications/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const application = await prisma_1.prisma.application.update({
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
        res.json({
            success: true,
            data: application
        });
    }
    catch (error) {
        next(error);
    }
});
// Get all jobs (admin)
router.get('/jobs', async (req, res, next) => {
    try {
        const jobs = await prisma_1.prisma.job.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: jobs
        });
    }
    catch (error) {
        next(error);
    }
});
// Create new job (admin)
router.post('/jobs', validation_middleware_1.validateJobCreation, async (req, res, next) => {
    try {
        const jobData = req.body;
        // Convert salary to number if provided
        const data = {
            ...jobData,
            salary: jobData.salary ? parseFloat(jobData.salary) : null
        };
        const job = await prisma_1.prisma.job.create({ data });
        res.status(201).json({
            success: true,
            data: job,
            message: 'Job created successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// Update job (admin)
router.put('/jobs/:id', validation_middleware_1.validateJobCreation, async (req, res, next) => {
    try {
        const { id } = req.params;
        const jobData = req.body;
        const job = await prisma_1.prisma.job.update({
            where: { id },
            data: jobData
        });
        res.json({
            success: true,
            data: job
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete job (admin)
router.delete('/jobs/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.job.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// Apply error handler
router.use(adminErrorHandler);
