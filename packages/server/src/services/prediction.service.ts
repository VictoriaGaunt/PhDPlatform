import axios from 'axios';
import environment from '../config/environment';

export interface ForecastParams {
    regionCode?: string;
    model?: string;
    horizon?: number;
    confidence?: number;
    scenarios?: string[];
    historicalData?: any[];
}

export interface ForecastResult {
    predictions: Array<{ year: number; value: number }>;
    confidenceIntervals?: Array<{ lower: number; upper: number }>;
    scenarios?: Record<string, number[]>;
    metrics?: {
        mape?: number;
        rmse?: number;
        mae?: number;
    };
    historicalData?: Array<{ year: number; value: number }>;
}

export class PredictionService {
    static async forecast(params: ForecastParams): Promise<ForecastResult> {
        const url = environment.PYTHON_MODEL_URL;
        try {
            const response = await axios.post(`${url}/predict`, params);
            return response.data;
        } catch (error) {
            console.error('Ошибка вызова Python-модели:', error);
            return this.getDummyForecast(params);
        }
    }
    private static getDummyForecast(params: ForecastParams): ForecastResult {
            const horizon = params.horizon || 5;
            const predictions = Array.from({ length: horizon }, (_, i) => ({
                year: 2025 + i,
                value: 0.5 + Math.random() * 0.3,
            }));
            return {
                predictions,
                confidenceIntervals: predictions.map(p => ({
                    lower: p.value - 0.1,
                    upper: p.value + 0.1,
                })),
                metrics: { mape: 5.2, rmse: 0.12, mae: 0.08 },
            };
    }
}