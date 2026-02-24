import mongoose, { Schema, Document } from 'mongoose';

export interface IRegion extends Document {
    code: string;
    name: string;
    population?: number;
    area?: number;
    hci?: number
    federalDistrict?: string;
    geometry?: any;
    metadata?: Record<string, any>;
    updatedAt: Date;
}

const RegionSchema = new Schema<IRegion>({
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    population: { type: Number },
    area: { type: Number },
    hci: { type: Number },
    federalDistrict: { type: String },
    geometry: { type: Schema.Types.Mixed }, // GeoJSON
    metadata: { type: Schema.Types.Mixed },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Region = mongoose.model<IRegion>('Region', RegionSchema);