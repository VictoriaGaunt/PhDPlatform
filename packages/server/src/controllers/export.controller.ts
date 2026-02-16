import { Request, Response } from 'express';
import { ExportService } from '../services/export.service';
import {PredictionService} from "../services/prediction.service";

export class ExportController {
    static async exportRegions(req: Request, res: Response) {
        try {
            const buffer = await ExportService.exportRegionsToExcel();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=regions.xlsx');
            res.send(buffer);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async exportPredictions(req: Request, res: Response) {
        try {
            const predictions = await PredictionService.forecast(req.body);
            const csv = ExportService.exportPredictionsToCSV(predictions);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=predictions.csv');
            res.send(csv);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}