import { Schema, model, Document, Types } from 'mongoose';

export interface IExcelRow extends Document {
    sheetId: Types.ObjectId;
    rowIndex: number;
    data: Record<string, any>;
}

const ExcelRowSchema = new Schema<IExcelRow>({
    sheetId: {
        type: Schema.Types.ObjectId,
        ref: 'ExcelSheet',
        required: true,
        index: true
    },
    rowIndex: {
        type: Number,
        required: true,
        index: true
    },
    data: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    }
}, {
    timestamps: true
});

ExcelRowSchema.index({ sheetId: 1, rowIndex: 1 }, { unique: true });

export default model<IExcelRow>('ExcelRow', ExcelRowSchema);