import { Request, Response } from 'express';
import { ExcelService } from '../services/excel.service';

const excelService = new ExcelService();

export class DataController {
    async getSheetData(req: Request, res: Response) {
        try {
            const { sheetId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const result = await excelService.getSheetData(sheetId, page, limit);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Ошибка получения данных'
            });
        }
    }

    async updateRow(req: Request, res: Response) {
        try {
            const { sheetId, rowIndex } = req.params;
            const updates = req.body;

            const updatedRow = await excelService.updateCell(
                sheetId,
                parseInt(rowIndex),
                updates
            );

            res.json({
                success: true,
                data: updatedRow
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Ошибка обновления'
            });
        }
    }

    async addRow(req: Request, res: Response) {
        try {
            const { sheetId } = req.params;
            const rowData = req.body;

            const newRow = await excelService.addRow(sheetId, rowData);

            res.status(201).json({
                success: true,
                data: newRow
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Ошибка добавления строки'
            });
        }
    }

    async deleteRow(req: Request, res: Response) {
        try {
            const { sheetId, rowIndex } = req.params;

            await excelService.deleteRow(sheetId, parseInt(rowIndex));

            res.json({
                success: true,
                message: 'Строка удалена'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Ошибка удаления'
            });
        }
    }
}