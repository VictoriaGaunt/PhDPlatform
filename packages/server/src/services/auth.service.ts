import { UserService } from './user.service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { AppError } from '../utils/errorHandler';
import bcrypt from 'bcryptjs';
import environment from '../config/environment';

export class AuthService {
    /**
     * Аутентификация пользователя (администратора)
     * @param login - имя пользователя
     * @param password - пароль
     * @returns объект с токенами и информацией о пользователе
     */
    static async login(login: string, password: string) {
        const user = await UserService.findByUsername(login);
        if (!user) {
            throw new AppError('Неверный логин или пароль', 401);
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new AppError('Неверный логин или пароль', 401);
        }
        const payload = { id: user.id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        const { passwordHash, ...userWithoutPassword } = user.toObject();
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }
    /**
     * Обновление access токена с помощью refresh токена
     * @param refreshToken - refresh токен
     */
    static async refreshAccessToken(refreshToken: string) {
        const { verifyRefreshToken } = await import('../utils/jwt.utils');
        const payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new AppError('Недействительный refresh токен', 401);
        }

        const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });
        return { accessToken: newAccessToken };
    }

    /**
     * Создание первого администратора (вызывается при инициализации)
     */
    static async createInitialAdmin() {
        const adminLogin = environment.ADMIN_LOGIN;
        const adminPassword = environment.ADMIN_PASSWORD;
        if (!adminLogin || !adminPassword) {
            console.warn('ADMIN_LOGIN или ADMIN_PASSWORD не заданы, администратор не создан');
            return;
        }

        const existing = await UserService.findByUsername(adminLogin);
        if (!existing) {
            await UserService.createAdmin(adminLogin, adminPassword);
            console.log('✅ Первый администратор создан');
        }
    }
}