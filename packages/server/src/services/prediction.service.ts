import axios from 'axios';
import environment from '../config/environment';
import { RegressionModel } from './models/regression.model';
import { TimeSeriesModel } from './models/timeSeries.model';
import { GradientBoostingModel } from './models/gradientBoosting.model';
import { CircuitBreaker } from '../utils/circuitBreaker';

export interface ForecastParams {
    regionCode?: string;
    model?: string;
    horizon?: number;
    confidence?: number;
    scenarios?: string[];
    modelType?: string;
    confidenceLevel?: number;
    historicalData?: HistoricalPointInput[];
}

export interface HistoricalPointInput {
    year?: number | string;
    value?: number | string;
    target?: number | string;
    hci?: number | string;

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

const pythonBreaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeoutMs: 15000,
    executionTimeoutMs: 4000 });

export class PredictionService {
    static async forecast(params: ForecastParams):
        Promise<ForecastResult> {
        try {
            const response = await pythonBreaker.execute(() => axios.post(`${environment.PYTHON_MODEL_URL}/predict`, params, {timeout: 4000}));
            return response.data as ForecastResult;
        } catch {
            return this.getLocalForecast(params);
        }
    }
private static async getLocalForecast(params: ForecastParams): Promise<ForecastResult> {
    const horizon = Math.max(1, Math.min(15, params.horizon || 5));
    const historical = this.normalizeHistorical(params.historicalData || []);

    const modelName = this.normalizeModelName(params.model || params.modelType || 'regression');
    let predictions: Array<{ year: number; value: number }>;

if (modelName === 'arima' || modelName === 'time_series') {
    const model = new TimeSeriesModel();
    predictions = await model.predict(historical.map((point) => ({ year: point.year, target: point.value })), horizon);
} else if (modelName === 'gradient_boosting') {
    predictions = await this.runGradientBoosting(historical, horizon);
} else {
    predictions = await this.runRegression(historical, horizon);
}

const requestedConfidence = params.confidence ?? params.confidenceLevel ?? 0.9;
const confidenceWidth = 1 - Math.min(0.99, Math.max(0.5, requestedConfidence));

return {
    predictions,
    confidenceIntervals: predictions.map((point) => ({
        lower: Math.max(0, point.value - confidenceWidth),
        upper: Math.min(1, point.value + confidenceWidth)
    })),
    metrics: this.calculateMetrics(historical),
    historicalData: historical
};
}

private static async runRegression(
    historical: Array<{ year: number; value: number }>,
    horizon: number
): Promise<Array<{ year: number; value: number }>> {
    const model = new RegressionModel();
    const points = historical.map((point) => ({
        year: point.year,
        target: point.value,
        features: this.buildSyntheticFeatures(point.value)
    }));

    model.train(points);
    return model.predict(points, horizon);
}

private static async runGradientBoosting(
    historical: Array<{ year: number; value: number }>,
    horizon: number
): Promise<Array<{ year: number; value: number }>> {
    const model = new GradientBoostingModel(['yearNorm', 'lag1', 'lag2', 'avg3']);
    const values = historical.map((point) => point.value);

    if (values.length < 4) {
    const ts = new TimeSeriesModel();
    return ts.predict(historical.map((point) => ({ year: point.year, target: point.value })), horizon);
}

const X: number[][] = [];
const y: number[] = [];
for (let index = 3; index < historical.length; index++) {
    X.push(this.buildGbFeatures(values, index));
    y.push(values[index]);
}

await model.train(X, y);

const predictions: Array<{ year: number; value: number }> = [];
const rollingValues = [...values];
let currentYear = historical[historical.length - 1].year;

for (let step = 0; step < horizon; step++) {
    const featureRow = this.buildGbFeatures(rollingValues, rollingValues.length);
    const [predictedValue] = await model.predict([featureRow]);
    rollingValues.push(predictedValue);
    currentYear += 1;
    predictions.push({ year: currentYear, value: predictedValue });
}

return predictions;
}

private static normalizeModelName(model: string): string {
    const normalized = model.toLowerCase();
    if (normalized === 'gradientboosting') return 'gradient_boosting';
    if (normalized === 'timeseries') return 'time_series';
    return normalized;
}

private static buildGbFeatures(values: number[], index: number): number[] {
    const lag1 = values[index - 1] ?? values[values.length - 1] ?? 0.5;
    const lag2 = values[index - 2] ?? lag1;
    const lastThree = values.slice(Math.max(0, index - 3), index);
    const avg3 = lastThree.length ? lastThree.reduce((sum, value) => sum + value, 0) / lastThree.length : lag1;
    const yearNorm = Math.min(1, index / 100);

    return [yearNorm, lag1, lag2, avg3];
}

private static normalizeHistorical(data: HistoricalPointInput[]): Array<{ year: number; value: number }> {
    const nowYear = new Date().getFullYear();
    const parsed = data
        .map((row, index) => {
            const rawYear = row?.year ?? nowYear - data.length + index;
            const rawValue = row?.value ?? row?.target ?? row?.hci;
            return {
                year: Number(rawYear),
                value: Number(rawValue)
            };
        })
        .filter((row) => Number.isFinite(row.year) && Number.isFinite(row.value))
        .map((row) => ({ year: row.year, value: Math.max(0, Math.min(1, row.value)) }))
        .sort((a, b) => a.year - b.year);

    if (parsed.length) return parsed;

return [
    { year: nowYear - 2, value: 0.62 },
    { year: nowYear - 1, value: 0.64 },
    { year: nowYear, value: 0.66 }
];
}

private static buildSyntheticFeatures(baseValue: number) {
    return {
        education: Math.min(1, baseValue + 0.04),
        health: Math.min(1, baseValue + 0.02),
        economy: Math.min(1, baseValue - 0.01),
        social: Math.min(1, baseValue + 0.01)
    };
}

private static calculateMetrics(historical: Array<{ year: number; value: number }>) {
    if (historical.length < 2) {
        return { mape: 0, rmse: 0, mae: 0 };
    }

    const diffs = historical.slice(1).map((point, index) => point.value - historical[index].value);
    const absDiffs = diffs.map((value) => Math.abs(value));
    const mse = diffs.reduce((sum, value) => sum + value * value, 0) / diffs.length;
    const mae = absDiffs.reduce((sum, value) => sum + value, 0) / absDiffs.length;
    const mean = historical.reduce((sum, point) => sum + point.value, 0) / historical.length;
    const mapeBase = mean === 0 ? 1 : Math.abs(mean);

    return {
        mape: Number(((mae / mapeBase) * 100).toFixed(2)),
        rmse: Number(Math.sqrt(mse).toFixed(4)),
        mae: Number(mae.toFixed(4))
    };
}
}