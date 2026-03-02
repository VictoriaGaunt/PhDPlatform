import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    targetCollection: string;
    documentId?: string;
    changes?: Record<string, unknown>;
    timestamp: Date;
    ip?: string;
    userAgent?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    targetCollection: { type: String, required: true },
    documentId: { type: String },
    changes: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ targetCollection: 1, action: 1 });
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);