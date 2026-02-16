import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller';

const router = Router();

router.post('/forecast', PredictionController.forecast);
router.get('/models', PredictionController.getModels);

export default router;