import { z } from 'zod';
import { MODEL_TYPES, SCENARIOS } from '../config/constants';

export const forecastRequestSchema = z.object({
    regionCode: z.string().length(2, 'Код региона должен состоять из 2 символов'),
    modelType: z.enum([MODEL_TYPES.GRADIENT_BOOSTING, MODEL_TYPES.REGRESSION, MODEL_TYPES.TIME_SERIES])
        .default(MODEL_TYPES.GRADIENT_BOOSTING),
    horizon: z.number().int().min(1).max(20).default(5),
    confidenceLevel: z.number().min(0.5).max(0.99).default(0.95),
    scenarios: z.array(z.enum([SCENARIOS.BASELINE, SCENARIOS.OPTIMISTIC, SCENARIOS.PESSIMISTIC]))
        .default([SCENARIOS.BASELINE]),
});

export const modelTrainingRequestSchema = z.object({
    modelType: z.enum([MODEL_TYPES.GRADIENT_BOOSTING, MODEL_TYPES.REGRESSION, MODEL_TYPES.TIME_SERIES]),
    hyperparameters: z.record(z.string(), z.any()).optional(), // исправлено
    testSize: z.number().min(0.1).max(0.5).default(0.2),
    crossValidation: z.boolean().default(true),
    nFolds: z.number().int().min(3).max(10).default(5),
});

export type ForecastRequest = z.infer<typeof forecastRequestSchema>;
export type ModelTrainingRequest = z.infer<typeof modelTrainingRequestSchema>;