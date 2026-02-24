import mongoose, { Schema, Document } from 'mongoose';

export interface IIndicator extends Document {
    regionCode: string;
    year: number;
    category: 'education' | 'health' | 'economy' | 'social';
    subcategory?: string;
    value: number;
    source?: string;
    confidence?: number;
    metadata?: any;
}

const IndicatorSchema = new Schema<IIndicator>({
    regionCode: { type: String, required: true, index: true },
    year: { type: Number, required: true },
    category: { type: String, enum: ['education', 'health', 'economy', 'social'], required: true },
    subcategory: String,
    value: { type: Number, required: true },
    source: String,
    confidence: Number,
    metadata: Schema.Types.Mixed
}, { timestamps: true });
IndicatorSchema.index({ regionCode: 1, year: 1, category: 1, subcategory: 1 }, { unique: true, sparse: true });

export const Indicator = mongoose.model<IIndicator>('Indicator', IndicatorSchema);