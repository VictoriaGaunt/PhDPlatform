import { z } from 'zod';

// Базовая схема для региона (для создания)
export const regionBaseSchema = z.object({
    code: z.string().length(2, 'Код региона должен состоять из 2 символов'),
    name: z.string().min(1, 'Название региона обязательно'),
    federalDistrict: z.string().min(1, 'Федеральный округ обязателен'),
    population: z.number().int().positive().optional(),
    area: z.number().positive().optional(),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
    }).optional(),
});

// Схема для обновления региона (все поля опциональны)
export const regionUpdateSchema = regionBaseSchema.partial();

// Схема для получения региона по коду
export const regionCodeParamSchema = z.object({
    code: z.string().length(2),
});

// Схема для запроса сравнения регионов
export const compareRegionsSchema = z.object({
    regionCodes: z.array(z.string().length(2)).min(2, 'Нужно указать минимум 2 региона'),
    indicators: z.array(z.string()).optional(),
    years: z.array(z.number().int()).optional(),
});

export type RegionInput = z.infer<typeof regionBaseSchema>;
export type RegionUpdateInput = z.infer<typeof regionUpdateSchema>;
export type CompareRegionsInput = z.infer<typeof compareRegionsSchema>;