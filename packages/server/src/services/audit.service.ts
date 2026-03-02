import { AuditLog, IAuditLog } from '../models/AuditLog.model';

export class AuditService {
    /**
     * Логирует действие пользователя
     */
    static async log(
        userId: string,
        action: string,
        details?: any,
        ip?: string,
        userAgent?: string
    ): Promise<IAuditLog> {
        const log = new AuditLog({
            userId,
            action,
            details,
            ip,
            userAgent,
            timestamp: new Date()
        });
        return await log.save();
    }

    /**
     * Получает логи с фильтрацией
     */
    static async getLogs(
        filter: { userId?: string; action?: string; startDate?: Date; endDate?: Date },
        page = 1,
        limit = 50
    ): Promise<{ logs: IAuditLog[]; total: number }> {
        const query: any = {};
        if (filter.userId) query.userId = filter.userId;
        if (filter.action) query.action = filter.action;
        if (filter.startDate || filter.endDate) {
            query.timestamp = {};
            if (filter.startDate) query.timestamp.$gte = filter.startDate;
            if (filter.endDate) query.timestamp.$lte = filter.endDate;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'email name'),
            AuditLog.countDocuments(query)
        ]);
        return { logs, total };
    }
}