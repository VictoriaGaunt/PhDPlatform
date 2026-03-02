export class TimeSeriesModel {
    async predict(features: Array<{ year: number; target?: number }>, horizon: number): Promise<Array<{ year: number; value: number }>> {
        const historical = features
            .map((item) => item.target)
            .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
        if (historical.length === 0) {
            throw new Error('No historical data for time series');
        }

        const alpha = 0.5;
        let level = historical[0];
        for (let i = 1; i < historical.length; i++) {
            level = alpha * historical[i] + (1 - alpha) * level;
        }

        const trend = this.estimateTrend(historical);
        const lastYear = features.length > 0 ? features[features.length - 1].year : new Date().getFullYear();
        return Array.from({ length: horizon }, (_, index) => {
            const step = index + 1;
            const value = level + trend * step;
            return {
                year: lastYear + step,
                value: Math.min(1, Math.max(0, value))
            };
        });
    }

    getModelEquation(): string {
        return 'Exponential Smoothing + Linear Trend';
    }
    private estimateTrend(series: number[]): number {
        if (series.length < 2) return 0;

        let totalDelta = 0;
        for (let i = 1; i < series.length; i++) {
            totalDelta += series[i] - series[i - 1];
        }
        return totalDelta / (series.length - 1);
    }
}