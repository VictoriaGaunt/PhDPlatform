/**
 * Нормализация данных (Z-score или Min-Max)
 */
export class DataNormalizer {
    private mean = 0;
    private std = 1;
    private min = 0;
    private max = 1;
    private readonly method: 'zscore' | 'minmax';
    private isFitted = false;

    constructor(method: 'zscore' | 'minmax' = 'zscore') {
        this.method = method;
    }

    fit(data: number[]): void {
        if (!data.length) {
            throw new Error('Невозможно обучить нормализатор на пустом массиве');
        }
        if (this.method === 'zscore') {
            this.mean = data.reduce((a, b) => a + b, 0) / data.length;
            const variance = data.reduce((a, b) => a + Math.pow(b - this.mean, 2), 0) / data.length;
            this.std = Math.sqrt(variance) || 1;
        } else {
            this.min = Math.min(...data);
            this.max = Math.max(...data);
        }
        this.isFitted = true;
    }
    fitTransform(data: number[]): number[] {
        this.fit(data);
        return this.transform(data);
    }
    transform(data: number[]): number[] {
    if (!this.isFitted) {
        throw new Error('Сначала вызовите fit или fitTransform');
    }
    if (this.method === 'zscore') {
        return data.map((x) => (x - this.mean) / this.std);
    }
        const range = this.max - this.min || 1;
        return data.map((x) => (x - this.min) / range);
    }

    inverseTransform(normalized: number[]): number[] {
        if (!this.isFitted) {
            throw new Error('Сначала вызовите fit или fitTransform');
        }
        if (this.method === 'zscore') {
            return normalized.map((x) => x * this.std + this.mean);
        }

        const range = this.max - this.min || 1;
        return normalized.map((x) => x * range + this.min);
    }
}