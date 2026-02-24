import Joi from 'joi';

// Схема для логина
export const loginSchema = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
});

// Схема для создания региона
export const regionCreateSchema = Joi.object({
    code: Joi.string().required().pattern(/^\d{2,3}$/), // код из 2-3 цифр
    name: Joi.string().required().min(2),
    population: Joi.number().integer().positive().optional(),
    area: Joi.number().positive().optional(),
    hci: Joi.number().min(0).max(1).optional(),
    federalDistrict: Joi.string().optional(),
    geometry: Joi.object().optional(),
    metadata: Joi.object().optional(),
});

// Схема для обновления региона (все поля опциональны)
export const regionUpdateSchema = Joi.object({
    name: Joi.string().min(2),
    population: Joi.number().integer().positive(),
    area: Joi.number().positive(),
    hci: Joi.number().min(0).max(1),
    federalDistrict: Joi.string(),
    geometry: Joi.object(),
    metadata: Joi.object(),
}).min(1); // хотя бы одно поле для обновления

// Схема для параметров прогноза
export const forecastParamsSchema = Joi.object({
    regionCode: Joi.string().required(),
    years: Joi.number().integer().min(1).max(20).default(5),
    model: Joi.string().valid('gradient_boosting', 'linear', 'arima').default('gradient_boosting'),
});

// Схема для пагинации
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    fields: Joi.string().optional(),
});