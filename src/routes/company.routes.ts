import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { companyController } from '../controllers/company.controller';
import { checkRole } from '../middleware/auth.middleware';
import { withAuth } from '../utils/route-utils';

const router = Router();

// Apply authentication and company role check to all routes
router.use(authenticate);
router.use(checkRole(['COMPANY']));

// Use withAuth wrapper for all controller methods
router.get('/stats', withAuth(companyController.getStats));
router.get('/profile', withAuth(companyController.getProfile));
router.put('/profile', withAuth(companyController.updateProfile));
router.get('/jobs', withAuth(companyController.getJobs));
router.post('/jobs', withAuth(companyController.createJob));
router.put('/jobs/:id', withAuth(companyController.updateJob));
router.delete('/jobs/:id', withAuth(companyController.deleteJob));
router.get('/jobs/:id/applications', withAuth(companyController.getJobApplications));
router.patch('/jobs/:jobId/applications/:applicationId', withAuth(companyController.updateApplicationStatus));

export { router as companyRoutes };