import { z } from 'zod';

// Схема для регистрации
export const registerSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    firstName: z.string().min(1, 'Имя обязательно'),
    lastName: z.string().min(1, 'Фамилия обязательна'),
    role: z.enum(['guest', 'admin']).optional().default('guest'),
});

// Схема для логина
export const loginSchema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Пароль обязателен'),
});

// Схема для обновления токена
export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token обязателен'),
});

// Типы на основе схем
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;