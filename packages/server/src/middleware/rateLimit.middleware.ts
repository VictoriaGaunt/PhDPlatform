import rateLimit from 'express-rate-limit';
import environment from '../config/environment';

export const apiLimiter = rateLimit({
    windowMs: environment.RATE_LIMIT_WINDOW_MS,
    max: environment.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: 'Слишком много запросов с вашего IP, попробуйте позже.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});