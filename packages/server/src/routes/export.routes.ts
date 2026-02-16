import { Router } from 'express';
import { ExportController } from '../controllers/export.controller';

const router = Router();

router.get('/regions', ExportController.exportRegions);
router.get('/predictions', ExportController.exportPredictions);

export default router;