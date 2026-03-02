import { Router } from 'express';
import { PredictionController } from '../controllers/prediction.controller';
import { validateZodBody } from '../middleware/zodValidation.middleware';
import { forecastRequestSchema } from '../schemas/prediction.schema';

const router = Router();

router.post('/forecast', validateZodBody(forecastRequestSchema), PredictionController.forecast);
router.get('/forecast/tasks/:jobId', PredictionController.getForecastTask);
router.get('/models', PredictionController.getModels);

export default router;