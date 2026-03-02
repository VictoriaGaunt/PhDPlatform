import { z } from 'zod';

const modelAliasSchema = z
    .enum([
        'gradientBoosting',
        'gradient_boosting',
        'regression',
        'timeSeries',
        'time_series',
        'arima'
    ])
    .default('regression');

const historicalPointSchema = z.object({
    year: z.union([z.number(), z.string()]).optional(),
    value: z.union([z.number(), z.string()]).optional(),
    target: z.union([z.number(), z.string()]).optional(),
    hci: z.union([z.number(), z.string()]).optional(),

});

export const forecastRequestSchema = z.object({
    regionCode: z.string().length(2, 'Код региона должен состоять из 2 символов').optional(),
    modelType: modelAliasSchema.optional(),
    model: modelAliasSchema.optional(),
    horizon: z.number().int().min(1).max(20).default(5),
    confidenceLevel: z.number().min(0.5).max(0.99).optional(),
    confidence: z.number().min(0.5).max(0.99).optional(),
    scenarios: z.array(z.string().min(1)).default(['baseline']),
    historicalData: z.array(historicalPointSchema).optional(),
});

export type ForecastRequest = z.infer<typeof forecastRequestSchema>;