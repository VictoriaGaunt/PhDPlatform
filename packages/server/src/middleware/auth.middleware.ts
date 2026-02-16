import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../config/environment';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: 'admin' | 'guest';
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Нет токена — пользователь не аутентифицирован
        req.user = undefined;
        return next();
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, environment.JWT_SECRET) as { id: string; role: 'admin' };
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    } catch (error) {
        req.user = undefined;
        next();
    }
};