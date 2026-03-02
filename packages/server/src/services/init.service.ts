import { User } from '../models/User.model';
import bcrypt from 'bcryptjs';
import { AuditService } from './audit.service';
import logger from '../config/logger';
import { AuditLog } from '../models/AuditLog.model';
import { Prediction } from '../models/Prediction.model';
import { Indicator } from '../models/Indicator.model';
import { Region } from '../models/Region.model';
import environment from '../config/environment';

export class InitService {
    static async ensureAdmin(): Promise<void> {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) return;

        const username = environment.ADMIN_USERNAME || 'admin';
        const password = environment.ADMIN_PASSWORD || 'admin123';

        logger.info('No admin user found, creating default admin...');
        const passwordHash = await bcrypt.hash(password, 12);
        const admin = new User({
            username,
            passwordHash,
            role: 'admin',
        });

        await admin.save();
        await AuditService.log(admin.id, 'CREATE_ADMIN', { message: 'Default admin created' }, undefined, undefined, 'users', admin.id);
        logger.info('Default admin created');
    }

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

    static async run(): Promise<void> {
        await this.initDatabase();
        await this.ensureAdmin();
    }
}