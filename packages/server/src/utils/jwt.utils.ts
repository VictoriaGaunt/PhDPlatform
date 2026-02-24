import jwt from 'jsonwebtoken';
import environment from '../config/environment';

interface TokenPayload {
    id: string;
    role: 'admin';
}

/**
 * Генерация access токена
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, environment.JWT_SECRET, { expiresIn: environment.JWT_EXPIRES_IN || '1d' });
};

/**
 * Генерация refresh токена
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, environment.JWT_REFRESH_SECRET, { expiresIn: environment.JWT_REFRESH_EXPIRES_IN || '7d' });
};

/**
 * Проверка access токена
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, environment.JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

/**
 * Проверка refresh токена
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, environment.JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};