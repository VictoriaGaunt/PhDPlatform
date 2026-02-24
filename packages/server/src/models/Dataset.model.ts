import mongoose, { Schema, Document } from 'mongoose';

export interface IDataset extends Document {
    name: string;
    description?: string;
    filename: string;
    filePath: string;
    format: 'csv' | 'json' | 'xlsx';
    size: number;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    tags?: string[];
    metadata?: any;
}

const DatasetSchema = new Schema<IDataset>({
    name: { type: String, required: true },
    description: String,
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    format: { type: String, enum: ['csv', 'json', 'xlsx'], required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
    tags: [String],
    metadata: Schema.Types.Mixed
}, { timestamps: true });
DatasetSchema.index({ tags: 1 });
DatasetSchema.index({ uploadedBy: 1 });

export const Dataset = mongoose.model<IDataset>('Dataset', DatasetSchema);