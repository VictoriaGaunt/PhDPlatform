import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
    regionCode: string;
    modelName: string;
    horizon: number;
    generatedAt: Date;
    predictions: Array<{ year: number; value: number; confidenceLower?: number; confidenceUpper?: number }>;
    metrics?: {
        rmse?: number;
        mae?: number;
        mape?: number;
    };
    parameters?: Record<string, unknown>;
    createdBy?: mongoose.Types.ObjectId;
}

const PredictionSchema = new Schema<IPrediction>({
    regionCode: { type: String, required: true, index: true },
    modelName: { type: String, required: true, index: true },
    horizon: { type: Number, required: true },
    generatedAt: { type: Date, default: Date.now },
    predictions: [{
        year: { type: Number, required: true },
        value: { type: Number, required: true },
        confidenceLower: Number,
        confidenceUpper: Number
    }],
    metrics: {
        rmse: Number,
        mae: Number,
        mape: Number
    },
    parameters: Schema.Types.Mixed,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
PredictionSchema.index({ regionCode: 1, generatedAt: -1 });
PredictionSchema.index({ modelName: 1, generatedAt: -1 });
PredictionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);