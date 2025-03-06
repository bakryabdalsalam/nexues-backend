import { Router } from 'express';
import authRoutes from './auth.routes';
import { userRoutes } from './user.routes';
import { companyRoutes } from './company.routes';
import { uploadRoutes } from './upload.routes';
import jobRoutes from './job.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/company', companyRoutes);
router.use('/upload', uploadRoutes);
router.use('/jobs', jobRoutes);

export default router;