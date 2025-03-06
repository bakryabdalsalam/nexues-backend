import { Router, Request, Response, NextFunction } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateJobCreation } from '../middleware/validation.middleware';
import { query, param } from 'express-validator';
import { AuthenticatedRequest } from '../types';

const router = Router();

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
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString().trim(),
  query('location').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('experienceLevel').optional().isString().trim(),
  query('remote').optional().isBoolean().toBoolean(),
], jobController.getAllJobs);

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
router.get('/recommendations', authenticate, (req: Request, res: Response, next: NextFunction) => {
  jobController.getRecommendations(req as AuthenticatedRequest, res).catch(next);
});

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
  param('id').isUUID()
], jobController.getJobById);

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
router.post('/', authenticate, requireAdmin, validateJobCreation, jobController.createJob);

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
router.put('/:id', authenticate, requireAdmin, (req: Request, res: Response, next: NextFunction) => {
  const authenticatedReq = req as AuthenticatedRequest;
  jobController.updateJob(authenticatedReq, res).catch(next);
});

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
router.delete('/:id', authenticate, requireAdmin, (req: Request, res: Response, next: NextFunction) => {
  const authenticatedReq = req as AuthenticatedRequest;
  jobController.deleteJob(authenticatedReq, res).catch(next);
});

router.patch('/:id/status', authenticate, requireAdmin, (req: Request, res: Response, next: NextFunction) => {
  const authenticatedReq = req as AuthenticatedRequest;
  jobController.updateJobStatus(authenticatedReq, res).catch(next);
});

// Public routes
router.get('/stats', jobController.getJobStats);
router.get('/:id/similar', jobController.getSimilarJobs);

export { router as jobRoutes };
