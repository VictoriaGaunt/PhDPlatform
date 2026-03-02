interface RegressionPoint {
    year: number;
    features: {
        education: number;
        health: number;
        economy: number;
        social: number;
    };
    target?: number;
}

export class RegressionModel {
    private coefficients: number[] = [0.3, 0.25, 0.25, 0.2];
    private intercept = 0;
    private trained = false;

    train(points: RegressionPoint[]): void {
        const trainSet = points.filter((point): point is Required<RegressionPoint> => typeof point.target === 'number');
        if (trainSet.length < 3) {
            return;
        }
    const X = trainSet.map((point) => [1, point.features.education, point.features.health, point.features.economy, point.features.social]);
    const y = trainSet.map((point) => point.target);
    const xt = this.transpose(X);
    const xtx = this.multiply(xt, X);
    const regularized = xtx.map((row, i) => row.map((value, j) => (i === j && i !== 0 ? value + 1e-6 : value)));
    const inverse = this.inverse(regularized);
    const xty = this.multiplyVector(xt, y);
    const beta = this.multiplyMatrixVector(inverse, xty);

    this.intercept = beta[0];
    this.coefficients = beta.slice(1);
    this.trained = true;
}

async predict(points: RegressionPoint[], horizon: number): Promise<Array<{ year: number; value: number }>> {
    if (!this.trained) {
    this.train(points);
}

const lastYear = points.length > 0 ? points[points.length - 1].year : new Date().getFullYear();
const lastFeatures = points.length > 0
    ? points[points.length - 1].features
    : { education: 0.6, health: 0.6, economy: 0.6, social: 0.6 };

return Array.from({ length: horizon }, (_, index) => {
    const step = index + 1;
    const drift = 1 + step * 0.005;
    const predicted = this.intercept +
        this.coefficients[0] * Math.min(1, lastFeatures.education * drift) +
        this.coefficients[1] * Math.min(1, lastFeatures.health * drift) +
        this.coefficients[2] * Math.min(1, lastFeatures.economy * drift) +
        this.coefficients[3] * Math.min(1, lastFeatures.social * drift);
    return {
        year: lastYear + step,
        value: Math.max(0, Math.min(1, predicted)),
    };
});
}

getModelEquation(): string {
    return `HCI = ${this.intercept.toFixed(4)} + ${this.coefficients[0].toFixed(4)}*EDU + ${this.coefficients[1].toFixed(4)}*HLT + ${this.coefficients[2].toFixed(4)}*ECO + ${this.coefficients[3].toFixed(4)}*SOC`;
}
    private transpose(matrix: number[][]): number[][] {
        return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
    }

    private multiply(a: number[][], b: number[][]): number[][] {
        return a.map((row) => b[0].map((_, colIndex) => row.reduce((sum, value, rowIndex) => sum + value * b[rowIndex][colIndex], 0)));
    }

    private multiplyVector(a: number[][], vector: number[]): number[] {
        return a.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    }

    private multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
        return matrix.map((row) => row.reduce((sum, value, index) => sum + value * vector[index], 0));
    }

    private inverse(matrix: number[][]): number[][] {
        const n = matrix.length;
        const augmented = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
        for (let i = 0; i < n; i++) {
            let pivot = augmented[i][i];
            if (Math.abs(pivot) < 1e-12) {
                const swapIndex = augmented.findIndex((row, idx) => idx > i && Math.abs(row[i]) > 1e-12);
                if (swapIndex === -1) throw new Error('Матрица вырождена, невозможно обучить регрессию');
                [augmented[i], augmented[swapIndex]] = [augmented[swapIndex], augmented[i]];
                pivot = augmented[i][i];
            }
            for (let j = 0; j < 2 * n; j++) augmented[i][j] /= pivot;
            for (let k = 0; k < n; k++) {
                if (k === i) continue;
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
        return augmented.map((row) => row.slice(n));
    }
}