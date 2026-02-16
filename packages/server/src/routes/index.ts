import { Router } from 'express';
import authRoutes from './auth.routes';
import regionRoutes from './region.routes';
import predictionRoutes from './prediction.routes';
import exportRoutes from './export.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/regions', regionRoutes);
router.use('/predictions', predictionRoutes);
router.use('/export', exportRoutes);
router.use('/users', userRoutes);

router.get('/test', (req, res) => res.json({ message: 'API is working' }));

export default router;