import { AuditLog, IAuditLog } from '../models/AuditLog.model';
import mongoose from 'mongoose';

interface AuditFilter {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
}

export class AuditService {
    static async log(
        userId: string,
        action: string,
        details?: Record<string, unknown>,
        ip?: string,
        userAgent?: string,
        targetCollection = 'system',
        documentId?: string
    ): Promise<IAuditLog> {
        const objectId = new mongoose.Types.ObjectId(userId);
        const log = new AuditLog({
            userId: objectId,
            action,
            targetCollection,
            documentId,
            changes: details,
            ip,
            userAgent,
            timestamp: new Date()
        });
        return log.save();
    }

    static async getLogs(
        filter: AuditFilter,
        page = 1,
        limit = 50
    ): Promise<{ logs: IAuditLog[]; total: number }> {
        const query: {
            userId?: string;
            action?: string;
            timestamp?: { $gte?: Date; $lte?: Date };
        } = {};

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
                .populate('userId', 'username role')
                .lean(),
            AuditLog.countDocuments(query)
        ]);
        return { logs: logs as unknown as IAuditLog[], total };
    }
}