import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import environment from '../config/environment';
import ApiError from '../utils/errorHandler';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Authentication required');
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, environment.JWT_SECRET) as any;
            req.user = decoded;
            next();
        } catch (error) {
            throw new ApiError(401, 'Invalid or expired token');
        }
    } catch (error) {
        next(error);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new ApiError(401, 'Authentication required');
            }

            if (!roles.includes(req.user.role)) {
                throw new ApiError(403, `Access denied. Required roles: ${roles.join(', ')}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};