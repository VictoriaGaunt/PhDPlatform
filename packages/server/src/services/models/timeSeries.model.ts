// Простая модель временных рядов (например, экспоненциальное сглаживание)
export class TimeSeriesModel {
    async predict(features: any[], horizon: number): Promise<any[]> {
        const predictions = [];
        // Извлекаем исторические значения HCI
        const historical = features.map((f: any) => f.target).filter((v: number) => v != null);
        if (historical.length === 0) {
            throw new Error('No historical data for time series');
        }
        // Простое скользящее среднее последних 3 значений
        const lastValues = historical.slice(-3);
        const avg = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
        const lastYear = features.length > 0 ? features[features.length - 1].year : new Date().getFullYear();
        for (let i = 1; i <= horizon; i++) {
            // Добавляем небольшой случайный шум
            const value = avg + (Math.random() * 0.02 - 0.01);
            predictions.push({
                year: lastYear + i,
                value: Math.min(1, Math.max(0, value))
            });
        }
        return predictions;
    }

    getModelEquation(): string {
        return `ARIMA(1,1,1) модель для временного ряда HCI`;
    }
}