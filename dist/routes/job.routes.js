"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const route_utils_1 = require("../utils/route-utils");
const router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         company:
 *           type: string
 *         location:
 *           type: string
 *         experienceLevel:
 *           type: string
 *         category:
 *           type: string
 *         salary:
 *           type: number
 *         remote:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filters
 *     tags: [Jobs]
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
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Job location
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Job category
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *         description: Required experience level
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: number
 *         description: Minimum salary
 *       - in: query
 *         name: salary_max
 *         schema:
 *           type: number
 *         description: Maximum salary
 *       - in: query
 *         name: remote
 *         schema:
 *           type: boolean
 *         description: Remote work option
 *     responses:
 *       200:
 *         description: List of jobs
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
 *                     $ref: '#/components/schemas/Job'
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
 */
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).toInt(),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    (0, express_validator_1.query)('search').optional().isString().trim(),
    (0, express_validator_1.query)('location').optional().isString().trim(),
    (0, express_validator_1.query)('category').optional().isString().trim(),
    (0, express_validator_1.query)('experienceLevel').optional().isString().trim(),
    (0, express_validator_1.query)('remote').optional().isBoolean().toBoolean(),
], job_controller_1.jobController.getAllJobs);
/**
 * @swagger
 * /api/jobs/recommendations:
 *   get:
 *     summary: Get job recommendations for the authenticated user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended jobs
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
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 */
router.get('/recommendations', auth_middleware_1.authenticate, (0, route_utils_1.withAuth)(job_controller_1.jobController.getRecommendations));
/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/:id', [
    (0, express_validator_1.param)('id').isUUID()
], job_controller_1.jobController.getJobById);
/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company
 *               - location
 *               - experienceLevel
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               experienceLevel:
 *                 type: string
 *               category:
 *                 type: string
 *               salary:
 *                 type: number
 *               remote:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, validation_middleware_1.validateJobCreation, (0, route_utils_1.withAuth)(job_controller_1.jobController.createJob));
/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Job not found
 */
router.put('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, validation_middleware_1.validateJobCreation, (0, route_utils_1.withAuth)(job_controller_1.jobController.updateJob));
/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Job not found
 */
router.delete('/:id', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, (0, route_utils_1.withAuth)(job_controller_1.jobController.deleteJob));
// Public routes
router.get('/stats', job_controller_1.jobController.getJobStats);
router.get('/:id/similar', job_controller_1.jobController.getSimilarJobs);
exports.default = router;
