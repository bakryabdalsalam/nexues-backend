import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { companyController } from '../controllers/company.controller';
import { checkRole } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types';

const router = Router();

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

router.put('/profile', (req: Request, res: Response, next: NextFunction) => {
  companyController.updateProfile(req as AuthenticatedRequest, res).catch(next);
});

router.get('/jobs', (req: Request, res: Response, next: NextFunction) => {
  companyController.getJobs(req as AuthenticatedRequest, res).catch(next);
});

router.post('/jobs', (req: Request, res: Response, next: NextFunction) => {
  companyController.createJob(req as AuthenticatedRequest, res).catch(next);
});

router.put('/jobs/:id', (req: Request, res: Response, next: NextFunction) => {
  companyController.updateJob(req as AuthenticatedRequest, res).catch(next);
});

router.delete('/jobs/:id', (req: Request, res: Response, next: NextFunction) => {
  companyController.deleteJob(req as AuthenticatedRequest, res).catch(next);
});

router.get('/jobs/:id/applications', (req: Request, res: Response, next: NextFunction) => {
  companyController.getJobApplications(req as AuthenticatedRequest, res).catch(next);
});

router.patch('/jobs/:jobId/applications/:applicationId', (req: Request, res: Response, next: NextFunction) => {
  companyController.updateApplicationStatus(req as AuthenticatedRequest, res).catch(next);
});

export { router as companyRoutes };