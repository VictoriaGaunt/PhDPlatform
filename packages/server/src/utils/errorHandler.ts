/**
 * Базовый класс для кастомных ошибок
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // операционная ошибка (не баг)
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Ошибка 404 (Not Found)
 */
export class NotFoundError extends AppError {
    constructor(resource: string = 'Ресурс') {
        super(`${resource} не найден`, 404);
    }
}

/**
 * Ошибка 400 (Bad Request)
 */
export class BadRequestError extends AppError {
    constructor(message: string = 'Неверный запрос') {
        super(message, 400);
    }
}

/**
 * Ошибка 401 (Unauthorized)
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Не авторизован') {
        super(message, 401);
    }
}

/**
 * Ошибка 403 (Forbidden)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Доступ запрещён') {
        super(message, 403);
    }
}

/**
 * Обработчик ошибок в контроллерах (обёртка для async)
 */
import { Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};