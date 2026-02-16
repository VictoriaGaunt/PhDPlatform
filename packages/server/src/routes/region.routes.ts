import { Router } from 'express';
import { RegionController } from '../controllers/region.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.get('/', RegionController.getAll);
router.get('/:code', RegionController.getByCode);
router.post('/', authMiddleware, adminMiddleware, RegionController.create);
router.put('/:code', authMiddleware, adminMiddleware, RegionController.update);
router.delete('/:code', authMiddleware, adminMiddleware, RegionController.remove);

export default router;