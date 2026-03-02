interface Stump {
    featureIndex: number;
    threshold: number;
    leftValue: number;
    rightValue: number;
}

export class GradientBoostingModel {
    private featureNames: string[];
    private stumps: Stump[] = [];
    private learningRate: number;
    private nEstimators: number;
    private bias = 0;

    constructor(featureNames?: string[], learningRate = 0.1, nEstimators = 40) {
        this.featureNames = featureNames || ['education', 'health', 'economy', 'social'];
        this.learningRate = learningRate;
        this.nEstimators = nEstimators;
    }

    async train(X: number[][], y: number[]): Promise<void> {
        if (!X.length || !y.length || X.length !== y.length) {
            throw new Error('Некорректные данные для обучения');
        }
        this.stumps = [];
        this.bias = y.reduce((sum, value) => sum + value, 0) / y.length;

        const currentPredictions = Array.from({length: y.length}, () => this.bias);
        for (let i = 0; i < this.nEstimators; i++) {
            const residuals = y.map((target, index) => target - currentPredictions[index]);
            const stump = this.fitBestStump(X, residuals);
            this.stumps.push(stump);
            for (let row = 0; row < X.length; row++) {
                const update = X[row][stump.featureIndex] <= stump.threshold ? stump.leftValue : stump.rightValue;
                currentPredictions[row] += this.learningRate * update;
            }
        }
    }

        async predict(X: number[][]): Promise<number[]> {
            if (!this.stumps.length) {
            throw new Error('Модель не обучена');
        }
            return X.map((row) => {
                let prediction = this.bias;
                for (const stump of this.stumps) {
                    prediction += this.learningRate * (row[stump.featureIndex] <= stump.threshold ? stump.leftValue : stump.rightValue);
                }
                return Math.min(1, Math.max(0, prediction));
            });
        }

    getFeatureImportance(): Record<string, number> {
        if (!this.stumps.length) {
            return Object.fromEntries(this.featureNames.map((name) => [name, 0]));
        }
        const weights = new Array(this.featureNames.length).fill(0);
        for (const stump of this.stumps) {
            weights[stump.featureIndex] += Math.abs(stump.leftValue - stump.rightValue);
        }
        const total = weights.reduce((sum, value) => sum + value, 0) || 1;
        return Object.fromEntries(this.featureNames.map((name, index) => [name, weights[index] / total]));
    }

    async saveModel(_path: string): Promise<void> {
        // В текущей версии состояние хранится в памяти процесса.
    }

    async loadModel(_path: string): Promise<void> {
        // Для локальной in-memory версии загрузка из файла пока не требуется.
    }

    private fitBestStump(X: number[][], residuals: number[]): Stump {
        let bestStump: Stump = {
            featureIndex: 0,
            threshold: 0,
            leftValue: 0,
            rightValue: 0
        };
        let bestLoss = Number.POSITIVE_INFINITY;

        const featureCount = X[0]?.length || 0;
        for (let featureIndex = 0; featureIndex < featureCount; featureIndex++) {
            const values = X.map((row) => row[featureIndex]);
            const uniqueValues = [...new Set(values)].sort((a, b) => a - b);
            if (!uniqueValues.length) continue;
            for (const threshold of uniqueValues) {
                const leftIndices: number[] = [];
                const rightIndices: number[] = [];
                values.forEach((value, rowIndex) => {
                    if (value <= threshold) leftIndices.push(rowIndex);
                    else rightIndices.push(rowIndex);
                });
                if (!leftIndices.length || !rightIndices.length) continue;
                const leftValue = this.meanByIndex(residuals, leftIndices);
                const rightValue = this.meanByIndex(residuals, rightIndices);
                const loss = this.computeStumpLoss(residuals, values, threshold, leftValue, rightValue);
                if (loss < bestLoss) {
                    bestLoss = loss;
                    bestStump = { featureIndex, threshold, leftValue, rightValue };
                }
            }
        }
        return bestStump;
    }

    private meanByIndex(values: number[], indices: number[]): number {
        return indices.reduce((sum, index) => sum + values[index], 0) / indices.length;
    }

    private computeStumpLoss(
        residuals: number[],
        featureValues: number[],
        threshold: number,
        leftValue: number,
        rightValue: number
    ): number {
        return residuals.reduce((sum, residual, index) => {
            const prediction = featureValues[index] <= threshold ? leftValue : rightValue;
            const error = residual - prediction;
            return sum + error * error;
        }, 0);
    }
}