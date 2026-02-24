/**
 * Вычисление среднего арифметического
 */
export const mean = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

/**
 * Вычисление среднеквадратического отклонения
 */
export const std = (arr: number[], population = true): number => {
    if (arr.length < 2) return 0;
    const m = mean(arr);
    const squaredDiffs = arr.map(val => Math.pow(val - m, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (population ? arr.length : arr.length - 1);
    return Math.sqrt(variance);
};

/**
 * Нормализация данных (z-score)
 */
export const normalize = (arr: number[]): number[] => {
    const m = mean(arr);
    const sd = std(arr, false); // выборка
    if (sd === 0) return arr.map(() => 0);
    return arr.map(val => (val - m) / sd);
};

/**
 * Min-max нормализация
 */
export const minMaxNormalize = (arr: number[], min = 0, max = 1): number[] => {
    const arrMin = Math.min(...arr);
    const arrMax = Math.max(...arr);
    if (arrMax - arrMin === 0) return arr.map(() => min);
    return arr.map(val => ((val - arrMin) / (arrMax - arrMin)) * (max - min) + min);
};

/**
 * Вычисление метрик прогноза (RMSE, MAE, MAPE)
 */
export const calculateMetrics = (actual: number[], predicted: number[]) => {
    if (actual.length !== predicted.length) throw new Error('Массивы разной длины');
    const n = actual.length;
    let rmse = 0, mae = 0, mape = 0;
    for (let i = 0; i < n; i++) {
        const diff = actual[i] - predicted[i];
        rmse += diff * diff;
        mae += Math.abs(diff);
        mape += Math.abs(diff / actual[i]);
    }
    return {
        rmse: Math.sqrt(rmse / n),
        mae: mae / n,
        mape: (mape / n) * 100,
    };
};