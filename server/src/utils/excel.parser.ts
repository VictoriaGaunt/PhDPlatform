import * as XLSX from 'xlsx';

// Определяем интерфейсы
export interface ExcelRow {
    [key: string]: any;
}

export interface SheetData {
    sheetName: string;
    data: ExcelRow[];
    headers: string[];
}

export interface ParseResult {
    sheets: SheetData[];
    metadata: {
        fileName: string;
        totalSheets: number;
        totalRows: number;
        totalColumns: number;
    };
}

export class ExcelParser {
    static parse(buffer: Buffer): ParseResult {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheets: SheetData[] = [];
        let totalRows = 0;
        let totalColumns = 0;

        workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

            let headers: string[] = [];
            if (jsonData.length > 0 && jsonData[0]) {
                headers = Object.keys(jsonData[0]);
            }

            const sheetData: SheetData = {
                sheetName,
                data: jsonData,
                headers
            };

            sheets.push(sheetData);
            totalRows += jsonData.length;
            totalColumns = Math.max(totalColumns, headers.length);
        });

        return {
            sheets,
            metadata: {
                fileName: 'uploaded_file.xlsx',
                totalSheets: sheets.length,
                totalRows,
                totalColumns
            }
        };
    }
}