import { Request, Response } from 'express';
import { PredictionService } from '../services/prediction.service';

export class PredictionController {
    static async forecast(req: Request, res: Response) {
        try {
            const params = req.body;
            const result = await PredictionService.forecast(params);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    static async getModels(_req: Request, res: Response) {
        res.json({
            success: true,
            data: [
                { id: 'gradient_boosting', name: 'Gradient Boosting' },
                { id: 'arima', name: 'ARIMA' },
                { id: 'lstm', name: 'LSTM' },
            ],
        });
    }
}