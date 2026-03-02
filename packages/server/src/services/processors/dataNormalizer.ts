/**
 * Нормализация данных (Z-score или Min-Max)
 */
export class DataNormalizer {
    private mean: number = 0;
    private std: number = 1;
    private min: number = 0;
    private max: number = 1;
    private method: 'zscore' | 'minmax' = 'zscore';

    constructor(method: 'zscore' | 'minmax' = 'zscore') {
        this.method = method;
    }

    /**
     * Обучается на данных и возвращает нормализованные данные
     */
    fitTransform(data: number[]): number[] {
        if (this.method === 'zscore') {
            this.mean = data.reduce((a, b) => a + b, 0) / data.length;
            const variance = data.reduce((a, b) => a + Math.pow(b - this.mean, 2), 0) / data.length;
            this.std = Math.sqrt(variance) || 1;
            return data.map(x => (x - this.mean) / this.std);
        } else {
            this.min = Math.min(...data);
            this.max = Math.max(...data);
            const range = this.max - this.min || 1;
            return data.map(x => (x - this.min) / range);
        }
    }

    /**
     * Трансформирует новые данные на основе ранее вычисленных параметров
     */
    transform(data: number[]): number[] {
        if (this.method === 'zscore') {
            return data.map(x => (x - this.mean) / this.std);
        } else {
            const range = this.max - this.min || 1;
            return data.map(x => (x - this.min) / range);
        }
    }

    /**
     * Обратная трансформация (для восстановления)
     */
    inverseTransform(normalized: number[]): number[] {
        if (this.method === 'zscore') {
            return normalized.map(x => x * this.std + this.mean);
        } else {
            const range = this.max - this.min || 1;
            return normalized.map(x => x * range + this.min);
        }
    }
}