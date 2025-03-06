import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { companyController } from '../controllers/company.controller';
import { checkRole } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication and company role check to all routes
router.use(authenticate);
router.use(checkRole(['COMPANY']));

// Company stats route
router.get('/stats', (req: Request, res: Response, next: NextFunction) => {
  companyController.getStats(req as AuthenticatedRequest, res).catch(next);
});

// Company profile routes
router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  companyController.getProfile(req as AuthenticatedRequest, res).catch(next);
});
router.put('/profile', companyController.updateProfile);

// Company jobs management routes
router.get('/jobs', companyController.getJobs);
router.post('/jobs', companyController.createJob);
router.put('/jobs/:id', companyController.updateJob);
router.delete('/jobs/:id', companyController.deleteJob);

// Job applications management routes
router.get('/jobs/:id/applications', companyController.getJobApplications);
router.patch('/jobs/:jobId/applications/:applicationId', companyController.updateApplicationStatus);

export { router as companyRoutes };