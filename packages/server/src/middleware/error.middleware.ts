import { Request, Response, NextFunction } from 'express';
import environment from '../config/environment';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('❌ Ошибка:', err.stack || err.message || err);

    const status = err.status || 500;
    const message = err.message || 'Внутренняя ошибка сервера';

    res.status(status).json({
        success: false,
        error: message,
        ...(environment.NODE_ENV === 'development' && { stack: err.stack }),
    });
};