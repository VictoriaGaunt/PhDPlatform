import { Schema, model, Document } from 'mongoose';

export interface IExcelSheet extends Document {
    fileName: string;
    sheetName: string;
    data: any[];
}

const ExcelSheetSchema = new Schema<IExcelSheet>({
    fileName: String,
    sheetName: String,
    data: [Schema.Types.Mixed]
}, {
    timestamps: true
});

export default model<IExcelSheet>('ExcelSheet', ExcelSheetSchema);