import { User } from '../models/User.model';
import bcrypt from 'bcryptjs';
import { AuditService } from './audit.service';
import logger from '../config/logger';
import {AuditLog} from "../models/AuditLog.model";
import {Prediction} from "../models/Prediction.model";
import {Indicator} from "../models/Indicator.model";
import {Region} from "../models/Region.model"; // предположим, есть логгер

export class InitService {
    /**
     * Проверяет наличие администратора и создаёт по умолчанию, если нет
     */
    static async ensureAdmin(): Promise<void> {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            logger.info('No admin user found, creating default admin...');
            const hashedPassword = await bcrypt.hash('admin123', 12); // пароль по умолчанию, лучше из env
            const admin = new User({
                email: 'admin@phd-platform.local',
                password: hashedPassword,
                name: 'System Administrator',
                role: 'admin',
                isActive: true
            });
            await admin.save();
            await AuditService.log(admin.id, 'USER_CREATED', { message: 'Default admin created' });
            logger.info('Default admin created');
        }
    }

    /**
     * Инициализация базы данных (например, создание индексов)
     */
    static async initDatabase(): Promise<void> {
        logger.info('Initializing database indexes...');
        await Promise.all([
            User.createIndexes(),
            Region.createIndexes(),
            Indicator.createIndexes(),
            Prediction.createIndexes(),
            AuditLog.createIndexes()
        ]);
        logger.info('Database indexes created');
    }

    /**
     * Главная функция инициализации приложения
     */
    static async run(): Promise<void> {
        await this.initDatabase();
        await this.ensureAdmin();
    }
}