import { Request, Response } from 'express';
import { PredictionService, ForecastParams } from '../services/prediction.service';
import { enqueueTask, getTaskStatus } from '../queues/task.queue';

export class PredictionController {
    static async forecast(req: Request, res: Response) {
        try {
            const params = this.normalizeForecastParams(req.body);
            if (req.query.async === 'true') {
                const jobId = await enqueueTask({ type: 'forecast', payload: params });
                if (!jobId) {
                    return res.status(503).json({ success: false, error: 'Очередь задач недоступна' });
                }
                return res.status(202).json({ success: true, data: { jobId, status: 'queued' } });
            }
            const result = await PredictionService.forecast(params);
            return res.json({ success: true, data: result });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Ошибка прогнозирования';
            const statusCode = message.startsWith('Validation:') ? 400 : 500;
            return res.status(statusCode).json({ success: false, error: message });
        }
    }
    static async getForecastTask(req: Request, res: Response) {
        const task = await getTaskStatus(req.params.jobId);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Задача не найдена' });
        }
        return res.json({ success: true, data: task });
    }
    static async getModels(_req: Request, res: Response) {
        return res.json({
            success: true,
            data: [
                { id: 'regression', aliases: ['regression'], name: 'Linear Regression' },
                { id: 'gradient_boosting', aliases: ['gradientBoosting', 'gradient_boosting'], name: 'Gradient Boosting (local)' },
                { id: 'arima', aliases: ['timeSeries', 'time_series', 'arima'], name: 'Time Series (smoothing + trend)' },
            ],
        });
    }
    private static normalizeForecastParams(raw: unknown): ForecastParams {
        if (!raw || typeof raw !== 'object') {
            throw new Error('Validation: тело запроса должно быть объектом');
        }

        const payload = raw as Record<string, unknown>;
        const horizon = Number(payload.horizon ?? 5);
        const confidence = Number(payload.confidence ?? payload.confidenceLevel ?? 0.9);

        if (!Number.isFinite(horizon) || horizon < 1 || horizon > 20) {
            throw new Error('Validation: horizon должен быть числом от 1 до 20');
        }

        if (!Number.isFinite(confidence) || confidence < 0.5 || confidence > 0.99) {
            throw new Error('Validation: confidence/confidenceLevel должен быть в диапазоне 0.5..0.99');
        }

        return {
            regionCode: this.asOptionalString(payload.regionCode),
            model: this.asOptionalString(payload.model ?? payload.modelType),
            horizon,
            confidence,
            scenarios: this.asStringArray(payload.scenarios),
            historicalData: Array.isArray(payload.historicalData) ? payload.historicalData : undefined,
        };
    }

    private static asOptionalString(value: unknown): string | undefined {
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    }

    private static asStringArray(value: unknown): string[] | undefined {
        if (!Array.isArray(value)) return undefined;
        return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
}