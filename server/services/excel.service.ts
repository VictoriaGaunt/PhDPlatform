import ExcelSheet from '../models/ExcelSheet';
import ExcelRow from '../models/ExcelRow';
import { ExcelParser, ParseResult } from '../utils/excel.parser';

export class ExcelService {
    async processExcel(buffer: Buffer, fileName: string) {
        // Используем исправленный парсер
        const parseResult: ParseResult = ExcelParser.parse(buffer);

        const results = parseResult.sheets.map(sheet => {
            if (sheet.data.length === 0) {
                return {
                    sheetName: sheet.sheetName,
                    rowCount: 0,
                    columns: []
                };
            }

            return {
                sheetName: sheet.sheetName,
                rowCount: sheet.data.length,
                columns: sheet.headers
            };
        });

        return {
            fileName,
            sheets: results,
            totalSheets: parseResult.sheets.length,
            totalRows: results.reduce((sum, sheet) => sum + sheet.rowCount, 0),
            totalColumns: Math.max(...results.map(s => s.columns.length))
        };
    }

    async getSheets() {
        return await ExcelSheet.find();
    }

    async getSheetData(sheetId: string, page: number, limit: number) {
        const sheet = await ExcelSheet.findById(sheetId);
        if (!sheet) throw new Error('Sheet not found');
        return sheet;
    }

    async updateCell(sheetId: string, rowIndex: number, updates: Record<string, any>) {
        const sheet = await ExcelSheet.findById(sheetId);
        if (!sheet) throw new Error('Sheet not found');

        if (sheet.data && sheet.data[rowIndex]) {
            sheet.data[rowIndex] = { ...sheet.data[rowIndex], ...updates };
            await sheet.save();
        }

        return sheet;
    }

    async addRow(sheetId: string, rowData: any) {
        
    }

    async deleteRow(sheetId: string, number: number) {
        
    }

    async uploadExcel(buffer: Buffer, originalname: string) {
        
    }
}