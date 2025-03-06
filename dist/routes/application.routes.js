"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationRoutes = void 0;
const express_1 = require("express");
const application_controller_1 = require("../controllers/application.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const prisma_1 = require("../config/prisma");
const route_utils_1 = require("../utils/route-utils");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         jobId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, ACCEPTED, REJECTED]
 *         coverLetter:
 *           type: string
 *         resume:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications for the authenticated user
 *     tags: [Applications]
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
 */
router.get('/me', auth_middleware_1.authenticate, (0, route_utils_1.withAuth)(application_controller_1.applicationController.getUserApplications));
/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get an application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 */
router.get('/:id', auth_middleware_1.authenticate, (0, route_utils_1.withAuth)(application_controller_1.applicationController.getApplication));
/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - coverLetter
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *               resume:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input or duplicate application
 */
router.post('/', auth_middleware_1.authenticate, validation_middleware_1.validateApplication, (0, route_utils_1.withAuth)(application_controller_1.applicationController.createApplication));
/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update an application status (Admin only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, ACCEPTED, REJECTED]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Application not found
 */
router.patch('/:id/status', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, express_validator_1.body)('status')
    .isIn(['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'])
    .withMessage('Invalid status value'), (0, route_utils_1.withAuth)(application_controller_1.applicationController.updateApplicationStatus));
// Get all applications (admin only)
router.get('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, route_utils_1.withAuth)(application_controller_1.applicationController.getAllApplications));
// Create application
router.post('/', auth_middleware_1.authenticate, (0, route_utils_1.withAuth)(async (req, res) => {
    try {
        const { jobId, message, resume } = req.body;
        const userId = req.user.id;
        // Check if user has already applied
        const existingApplication = await prisma_1.prisma.application.findFirst({
            where: {
                jobId,
                userId
            }
        });
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }
        const application = await prisma_1.prisma.application.create({
            data: {
                jobId,
                userId,
                message,
                resume,
                status: 'PENDING'
            },
            include: {
                job: {
                    include: {
                        company: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            data: application
        });
    }
    catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application'
        });
    }
}));
// Get application by ID
router.get('/:id', auth_middleware_1.authenticate, (0, route_utils_1.withAuth)(async (req, res) => {
    try {
        const { id } = req.params;
        const application = await prisma_1.prisma.application.findUnique({
            where: { id },
            include: {
                job: {
                    include: {
                        company: true
                    }
                }
            }
        });
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }
        // Check if user is authorized to view this application
        if (application.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }
        res.json({
            success: true,
            data: application
        });
    }
    catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application'
        });
    }
}));
exports.applicationRoutes = router;
