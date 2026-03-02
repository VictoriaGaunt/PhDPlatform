import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateZodBody = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                error: 'Ошибка валидации',
                details: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
            });
        }

        req.body = parsed.data;
        next();
    };
};